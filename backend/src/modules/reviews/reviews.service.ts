import { AppDataSource } from '@config/database';
import { Review } from '@entities/review.entity';
import { OrderItem } from '@entities/order-item.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class ReviewsService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);

  public async getProductReviews(productId: string, query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async createReview(userId: string, data: Record<string, any>) {
    const existing = await this.reviewRepo.findOneBy({ userId, productId: data.productId });
    if (existing) throw AppError.conflict('You have already reviewed this product');

    // Check if user actually bought the item
    const pastPurchase = await this.orderItemRepo.findOne({
      where: { productId: data.productId, order: { userId } },
      relations: ['order'],
    });

    const isVerifiedPurchase = !!pastPurchase;

    const review = this.reviewRepo.create({
      ...data,
      userId,
      isVerifiedPurchase,
      isApproved: true, // auto-approve for simplicity, real app might moderate
    });

    return this.reviewRepo.save(review);
  }

  public async deleteReview(id: string) {
    const result = await this.reviewRepo.delete(id);
    if (result.affected === 0) throw AppError.notFound('Review');
  }
}
