import { AppDataSource } from '@config/database';
import { Coupon } from '@entities/coupon.entity';
import { CouponUsage } from '@entities/coupon-usage.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class CouponsService {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private usageRepo = AppDataSource.getRepository(CouponUsage);

  public async getCoupons(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const [items, total] = await this.couponRepo.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async getCouponByCode(code: string) {
    const coupon = await this.couponRepo.findOneBy({ code: code.toUpperCase() });
    if (!coupon) throw AppError.notFound('Coupon not found');
    return coupon;
  }

  public async createCoupon(data: Record<string, any>) {
    const code = (data.code as string).toUpperCase().trim();
    const existing = await this.couponRepo.findOneBy({ code });
    if (existing) throw AppError.conflict('Coupon code already exists');

    const coupon = this.couponRepo.create({ ...data, code });
    return this.couponRepo.save(coupon);
  }

  public async updateCoupon(id: string, data: Record<string, any>) {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw AppError.notFound('Coupon');

    if (data.code) data.code = (data.code as string).toUpperCase().trim();
    Object.assign(coupon, data);
    return this.couponRepo.save(coupon);
  }

  public async deleteCoupon(id: string) {
    const result = await this.couponRepo.delete(id);
    if (result.affected === 0) throw AppError.notFound('Coupon');
  }

  public async validateCoupon(code: string, orderValue: number, userId?: string) {
    const coupon = await this.getCouponByCode(code);

    if (!coupon.isValid) {
      throw AppError.badRequest('Coupon is invalid or expired');
    }

    if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
      throw AppError.badRequest(
        `Minimum order value for this coupon is ₹${Number(coupon.minOrderValue).toLocaleString('en-IN')}`,
      );
    }

    // Per-user limit check
    if (userId && coupon.perUserLimit) {
      const userUsageCount = await this.usageRepo.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        throw AppError.badRequest('You have already used this coupon the maximum number of times');
      }
    }

    let discount = 0;
    if (coupon.type === 'fixed') {
      discount = Math.min(Number(coupon.value), orderValue);
    } else {
      discount = orderValue * (Number(coupon.value) / 100);
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    }
    discount = Math.round(discount * 100) / 100;

    return { valid: true, discount, coupon };
  }
}
