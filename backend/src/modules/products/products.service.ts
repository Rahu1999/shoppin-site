import { AppDataSource } from '@config/database';
import { Product } from '@entities/product.entity';
import { ProductVariant } from '@entities/product-variant.entity';
import { ProductImage } from '@entities/product-image.entity';
import { Inventory } from '@entities/inventory.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';
import { Brackets, In, IsNull } from 'typeorm';

export class ProductsService {
  private productRepo = AppDataSource.getRepository(Product);

  public async getProducts(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory');

    if (query.adminView) {
      // Admin gets all products + variants for the product form
      queryBuilder
        .leftJoinAndSelect('product.variants', 'variants')
        .leftJoinAndSelect('variants.inventory', 'variantInventory');
    } else {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });
    }

    if (query.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query.brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId: query.brandId });
    }

    if (query.isFeatured === 'true') {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: true });
    }

    if (query.sku) {
      queryBuilder.andWhere('product.sku = :sku', { sku: query.sku });
    }

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product.name LIKE :search', { search: searchTerm })
            .orWhere('product.description LIKE :search', { search: searchTerm })
            .orWhere('product.shortDescription LIKE :search', { search: searchTerm })
            .orWhere('product.sku LIKE :search', { search: searchTerm });
        })
      );
    }

    if (query.minPrice && query.maxPrice) {
      queryBuilder.andWhere('product.basePrice BETWEEN :min AND :max', {
        min: Number(query.minPrice),
        max: Number(query.maxPrice),
      });
    } else if (query.minPrice) {
      queryBuilder.andWhere('product.basePrice >= :min', { min: Number(query.minPrice) });
    } else if (query.maxPrice) {
      queryBuilder.andWhere('product.basePrice <= :max', { max: Number(query.maxPrice) });
    }

    if (query.sort) {
      queryBuilder.orderBy(`product.${query.sort}`, query.order === 'DESC' ? 'DESC' : 'ASC');
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    const [items, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    const enrichedItems = items.map((product) => {
      if (product.images) {
        product.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
      return {
        ...product,
        stock: product.inventory?.reduce((sum, inv) => sum + Math.max(0, (inv.quantity || 0) - (inv.reserved || 0)), 0) || 0,
      };
    });

    return { items: enrichedItems, meta: buildPaginationMeta(page, limit, total) };
  }

  public async getProductBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['images', 'brand', 'category', 'variants', 'variants.inventory', 'inventory', 'reviews'],
    });

    if (!product) throw AppError.notFound('Product');

    if (product.images) {
      product.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // Compute total stock for non-variant products
    const stock = product.inventory
      ?.filter((inv) => !inv.variantId)
      .reduce((sum, inv) => sum + Math.max(0, (inv.quantity || 0) - (inv.reserved || 0)), 0) || 0;

    return { ...product, stock };
  }

  // Admin Methods
  public async createProduct(data: Record<string, any>) {
    const existing = await this.productRepo.findOneBy({ slug: data.slug });
    if (existing) throw AppError.conflict('Product with this slug already exists');

    const { stockQuantity, images, imageUrls, variants, ...productData } = data;

    if (productData.sku === '') productData.sku = null;
    if (productData.comparePrice === 0) productData.comparePrice = null;
    if (productData.costPrice === 0) productData.costPrice = null;

    const result = await AppDataSource.transaction(async (manager) => {
      const product = manager.create(Product, productData);
      const savedProduct = await manager.save(product);

      if (Array.isArray(images) && images.length > 0) {
        const imageEntities = images.map((url, index) =>
          manager.create(ProductImage, {
            productId: savedProduct.id,
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })
        );
        await manager.save(ProductImage, imageEntities);
      }

      if (Array.isArray(variants) && variants.length > 0) {
        const incomingSkus = variants.map((v: any) => (v.sku || '').trim()).filter(Boolean);
        if (new Set(incomingSkus).size < incomingSkus.length) {
          throw AppError.conflict('Two or more variants share the same SKU. Each variant SKU must be unique.');
        }
        // Product has size variants — create each variant + its inventory
        for (const v of variants) {
          const { stockQuantity: variantStock, id: _id, ...variantData } = v;
          if (variantData.sku === '') variantData.sku = null;
          if (variantData.comparePrice === 0) variantData.comparePrice = null;

          const variant = manager.create(ProductVariant, { ...variantData, productId: savedProduct.id });
          const savedVariant = await manager.save(variant);

          await manager.save(
            manager.create(Inventory, {
              productId: savedProduct.id,
              variantId: savedVariant.id,
              quantity: variantStock ?? 0,
              reserved: 0,
            })
          );
        }
      } else if (stockQuantity !== undefined) {
        // No variants — create a single base inventory record
        await manager.save(
          manager.create(Inventory, {
            productId: savedProduct.id,
            quantity: stockQuantity,
            reserved: 0,
          })
        );
      }

      return savedProduct;
    });

    return this.productRepo.findOne({
      where: { id: result.id },
      relations: ['images', 'category', 'inventory', 'variants', 'variants.inventory'],
    });
  }

  public async updateProduct(id: string, data: Record<string, any>) {
    const { images, stockQuantity, imageUrls, variants, ...updateData } = data;

    if (updateData.sku === '') updateData.sku = null;
    if (updateData.comparePrice === 0) updateData.comparePrice = null;
    if (updateData.costPrice === 0) updateData.costPrice = null;

    await AppDataSource.transaction(async (manager) => {
      const updateResult = await manager.update(Product, id, updateData);
      if (updateResult.affected === 0) throw AppError.notFound('Product');

      if (Array.isArray(images)) {
        await manager.delete(ProductImage, { productId: id });
        const imageEntities = images.map((url: string, index: number) =>
          manager.create(ProductImage, {
            productId: id,
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })
        );
        await manager.save(ProductImage, imageEntities);
      }

      // variants === undefined means "don't touch variants"
      // variants === [] means "remove all variants"
      // variants === [...] means "full replace — upsert incoming, delete removed"
      if (variants !== undefined) {
        // Guard: reject duplicate SKUs within the submitted variants
        const incomingSkus = (variants as any[]).map((v) => (v.sku || '').trim()).filter(Boolean);
        if (new Set(incomingSkus).size < incomingSkus.length) {
          throw AppError.conflict('Two or more variants share the same SKU. Each variant SKU must be unique.');
        }

        const variantRepo = manager.getRepository(ProductVariant);
        const inventoryRepo = manager.getRepository(Inventory);

        const existingVariants = await variantRepo.findBy({ productId: id });
        const incomingIds = (variants as any[]).filter((v) => v.id).map((v) => v.id);

        // Remove variants not present in the incoming list
        const toDelete = existingVariants
          .filter((ev) => !incomingIds.includes(ev.id))
          .map((ev) => ev.id);

        if (toDelete.length > 0) {
          await inventoryRepo.delete({ variantId: In(toDelete) });
          await variantRepo.softDelete(toDelete);
        }

        // Upsert each incoming variant
        for (const v of variants as any[]) {
          const { stockQuantity: variantStock, id: variantId, ...variantData } = v;
          if (variantData.sku === '') variantData.sku = null;
          if (variantData.comparePrice === 0) variantData.comparePrice = null;

          if (variantId) {
            // Update existing variant fields
            await variantRepo.update(variantId, variantData);
            // Sync its inventory
            if (variantStock !== undefined) {
              const inv = await inventoryRepo.findOneBy({ variantId });
              if (inv) {
                inv.quantity = variantStock;
                await manager.save(inv);
              } else {
                await manager.save(
                  manager.create(Inventory, { productId: id, variantId, quantity: variantStock, reserved: 0 })
                );
              }
            }
          } else {
            // Create brand-new variant
            const newVariant = manager.create(ProductVariant, { ...variantData, productId: id });
            const savedVariant = await manager.save(newVariant);
            await manager.save(
              manager.create(Inventory, {
                productId: id,
                variantId: savedVariant.id,
                quantity: variantStock ?? 0,
                reserved: 0,
              })
            );
          }
        }

        // When variants list is empty the product becomes a base-stock product.
        // Update base inventory if stockQuantity was also supplied.
        if ((variants as any[]).length === 0 && stockQuantity !== undefined) {
          const inventoryRepo = manager.getRepository(Inventory);
          const inventory = await inventoryRepo.findOneBy({ productId: id, variantId: IsNull() });
          if (inventory) {
            inventory.quantity = stockQuantity;
            await manager.save(Inventory, inventory);
          } else {
            await manager.save(
              manager.create(Inventory, { productId: id, quantity: stockQuantity, reserved: 0 })
            );
          }
        }
      } else if (stockQuantity !== undefined) {
        // No-variant product — update base inventory
        const inventoryRepo = manager.getRepository(Inventory);
        const inventory = await inventoryRepo.findOneBy({ productId: id, variantId: IsNull() });

        if (inventory) {
          inventory.quantity = stockQuantity;
          await manager.save(Inventory, inventory);
        } else {
          await manager.save(
            manager.create(Inventory, { productId: id, quantity: stockQuantity, reserved: 0 })
          );
        }
      }

      return true;
    });

    return this.productRepo.findOne({
      where: { id },
      relations: ['images', 'category', 'inventory', 'variants', 'variants.inventory'],
    });
  }

  public async deleteProduct(id: string) {
    const result = await this.productRepo.softDelete(id);
    if (result.affected === 0) throw AppError.notFound('Product');
  }
}
