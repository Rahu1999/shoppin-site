import { AppDataSource } from '@config/database';
import { Product } from '@entities/product.entity';
import { ProductImage } from '@entities/product-image.entity';
import { Inventory } from '@entities/inventory.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';
import { Brackets } from 'typeorm';

export class ProductsService {
  private productRepo = AppDataSource.getRepository(Product);

  public async getProducts(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const queryBuilder = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory');

    if (!query.adminView) {
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
        max: Number(query.maxPrice) 
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

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Sort images by sortOrder and Flatten inventory
    const enrichedItems = items.map(product => {
      if (product.images) {
        product.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      }
      return {
        ...product,
        stock: product.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0) - (inv.reserved || 0), 0) || 0
      };
    });

    return { items: enrichedItems, meta: buildPaginationMeta(page, limit, total) };
  }

  public async getProductBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug, isActive: true },
      relations: ['images', 'brand', 'category', 'variants', 'reviews'],
    });

    if (!product) throw AppError.notFound('Product');
    
    // Sort images by sortOrder
    if (product.images) {
      product.images.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    
    return product;
  }

  // Admin Methods
  public async createProduct(data: Record<string, any>) {
    const existing = await this.productRepo.findOneBy({ slug: data.slug });
    if (existing) throw AppError.conflict('Product with this slug already exists');

    const { stockQuantity, images, imageUrls, ...productData } = data;

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

      if (stockQuantity !== undefined) {
        const inventory = manager.create(Inventory, {
          productId: savedProduct.id,
          quantity: stockQuantity,
          reserved: 0,
        });
        await manager.save(Inventory, inventory);
      }

      return savedProduct;
    });

    return this.productRepo.findOne({
      where: { id: result.id },
      relations: ['images', 'category', 'inventory'],
    });
  }

  public async updateProduct(id: string, data: Record<string, any>) {
    const { images, stockQuantity, imageUrls, ...updateData } = data;

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

      if (stockQuantity !== undefined) {
        const inventoryRepo = manager.getRepository(Inventory);
        const inventory = await inventoryRepo.findOneBy({ productId: id });
        
        if (inventory) {
          inventory.quantity = stockQuantity;
          await manager.save(Inventory, inventory);
        } else {
          const newInv = manager.create(Inventory, {
            productId: id,
            quantity: stockQuantity,
            reserved: 0
          });
          await manager.save(Inventory, newInv);
        }
      }

      return true;
    });

    return this.productRepo.findOne({
      where: { id },
      relations: ['images', 'category', 'inventory']
    });
  }

  public async deleteProduct(id: string) {
    const result = await this.productRepo.softDelete(id);
    if (result.affected === 0) throw AppError.notFound('Product');
  }
}
