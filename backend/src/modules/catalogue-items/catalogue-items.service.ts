import { AppDataSource } from '@config/database';
import { CatalogueItem } from '@entities/catalogue-item.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class CatalogueItemsService {
  private itemRepo = AppDataSource.getRepository(CatalogueItem);

  public async getPublicItems() {
    return this.itemRepo.find({
      where: { isActive: true },
      relations: ['category'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  public async getPublicItemBySlug(slug: string) {
    const item = await this.itemRepo.findOne({
      where: { slug, isActive: true },
      relations: ['category'],
    });
    if (!item) throw AppError.notFound('Catalogue item');
    return item;
  }

  public async getItemsAdmin(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const queryBuilder = this.itemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .orderBy('item.sortOrder', 'ASC')
      .addOrderBy('item.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.categoryId) {
      queryBuilder.andWhere('item.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.search) {
      queryBuilder.andWhere('item.name LIKE :search', { search: `%${query.search}%` });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async createItem(data: Record<string, any>) {
    const existing = await this.itemRepo.findOneBy({ slug: data.slug });
    if (existing) throw AppError.conflict('Slug already exists');

    const item = this.itemRepo.create(data);
    return this.itemRepo.save(item);
  }

  public async updateItem(id: string, data: Record<string, any>) {
    const existing = await this.itemRepo.findOneBy({ id });
    if (!existing) throw AppError.notFound('Catalogue item');

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await this.itemRepo.findOneBy({ slug: data.slug });
      if (slugTaken) throw AppError.conflict('Slug already exists');
    }

    await this.itemRepo.update(id, data);
    return this.itemRepo.findOne({ where: { id }, relations: ['category'] });
  }

  public async deleteItem(id: string) {
    const result = await this.itemRepo.softDelete(id);
    if (result.affected === 0) throw AppError.notFound('Catalogue item');
  }
}
