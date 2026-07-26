import { AppDataSource } from '@config/database';
import { Review } from '@entities/review.entity';
import { Product } from '@entities/product.entity';
import { OrderItem } from '@entities/order-item.entity';
import { OrderStatus } from '@entities/order-status.enum';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class ReviewsService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private productRepo = AppDataSource.getRepository(Product);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);

  public async getProductReviews(productId: string, query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const [items, total] = await this.reviewRepo.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'],
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        rating: true,
        title: true,
        body: true,
        isVerifiedPurchase: true,
        isApproved: true,
        productId: true,
        userId: true,
        user: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async createReview(userId: string, data: Record<string, any>) {
    const existing = await this.reviewRepo.findOneBy({ userId, productId: data.productId });
    if (existing) throw AppError.conflict('You have already reviewed this product');

    const hasDeliveredPurchase = await this.hasDeliveredPurchase(userId, data.productId);
    if (!hasDeliveredPurchase) {
      throw AppError.forbidden('You can only review products from an order that has been delivered to you');
    }

    // Ratings of 3 and above are auto-approved; lower ratings go to the moderation queue
    const isApproved = Number(data.rating) >= 3;

    const review = this.reviewRepo.create({
      ...data,
      userId,
      isVerifiedPurchase: true,
      isApproved,
    });

    const saved = await this.reviewRepo.save(review);
    if (isApproved) {
      await this.recalculateProductRating(saved.productId);
    }
    return saved;
  }

  public async getReviewEligibility(userId: string, productId: string) {
    const alreadyReviewed = !!(await this.reviewRepo.findOneBy({ userId, productId }));
    const hasDeliveredPurchase = await this.hasDeliveredPurchase(userId, productId);

    return {
      canReview: hasDeliveredPurchase && !alreadyReviewed,
      alreadyReviewed,
      hasDeliveredPurchase,
    };
  }

  public async getMyReviewedProductIds(userId: string) {
    const reviews = await this.reviewRepo.find({ where: { userId }, select: { productId: true } });
    return reviews.map((r) => r.productId);
  }

  private async hasDeliveredPurchase(userId: string, productId: string) {
    const pastPurchase = await this.orderItemRepo.findOne({
      where: { productId, order: { userId, status: OrderStatus.DELIVERED } },
      relations: ['order'],
    });
    return !!pastPurchase;
  }

  public async getPendingReviews(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const [items, total] = await this.reviewRepo.findAndCount({
      where: { isApproved: false },
      relations: ['user', 'product'],
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        rating: true,
        title: true,
        body: true,
        isVerifiedPurchase: true,
        isApproved: true,
        productId: true,
        userId: true,
        user: { id: true, firstName: true, lastName: true, avatarUrl: true },
        product: { id: true, name: true, slug: true },
      },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async approveReview(id: string) {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw AppError.notFound('Review');

    review.isApproved = true;
    await this.reviewRepo.save(review);
    await this.recalculateProductRating(review.productId);
    return review;
  }

  public async deleteReview(id: string) {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw AppError.notFound('Review');

    await this.reviewRepo.delete(id);
    if (review.isApproved) {
      await this.recalculateProductRating(review.productId);
    }
  }

  private async recalculateProductRating(productId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isApproved = true')
      .getRawOne<{ avg: string | null; count: string }>();

    const avg = result?.avg ?? null;
    const count = result?.count ?? '0';

    await this.productRepo.update(productId, {
      averageRating: avg ? Number(Number(avg).toFixed(2)) : 0,
      reviewCount: Number(count ?? 0),
    });
  }
}
