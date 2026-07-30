import { AppDataSource } from '@config/database';
import { Category } from '@entities/category.entity';
import { Product } from '@entities/product.entity';
import { AppError } from '@utils/AppError';

export class CategoriesService {
  private categoryRepo = AppDataSource.getRepository(Category);
  private productRepo = AppDataSource.getRepository(Product);

  public async getCategoriesTree(adminView = false) {
    const where: any = { parentId: undefined };
    if (!adminView) {
      where.isActive = true;
    }

    return this.categoryRepo.find({
      where,
      relations: ['children', 'children.children'],
      order: { sortOrder: 'ASC' },
    });
  }

  public async getCategoryBySlug(slug: string) {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      relations: ['children'],
    });
    if (!category) throw AppError.notFound('Category');

    const products = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.categoryId = :categoryId', { categoryId: category.id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.createdAt', 'DESC')
      .take(100)
      .getMany();

    return { ...category, products };
  }

  // Admin
  public async createCategory(data: Record<string, any>) {
    const existing = await this.categoryRepo.findOneBy({ slug: data.slug });
    if (existing) throw AppError.conflict('Slug already exists');

    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  public async updateCategory(id: string, data: Record<string, any>) {
    const result = await this.categoryRepo.update(id, data);
    if (result.affected === 0) throw AppError.notFound('Category');
    return this.categoryRepo.findOneBy({ id });
  }

  public async deleteCategory(id: string) {
    const result = await this.categoryRepo.softDelete(id);
    if (result.affected === 0) throw AppError.notFound('Category');
  }
}
