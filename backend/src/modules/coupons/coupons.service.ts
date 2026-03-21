import { AppDataSource } from '@config/database';
import { Coupon } from '@entities/coupon.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class CouponsService {
  private couponRepo = AppDataSource.getRepository(Coupon);

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
    const coupon = await this.couponRepo.findOneBy({ code });
    if (!coupon) throw AppError.notFound('Coupon');
    return coupon;
  }

  public async createCoupon(data: Record<string, any>) {
    const existing = await this.couponRepo.findOneBy({ code: data.code });
    if (existing) throw AppError.conflict('Coupon code already exists');

    const coupon = this.couponRepo.create(data);
    return this.couponRepo.save(coupon);
  }

  public async updateCoupon(id: string, data: Record<string, any>) {
    const coupon = await this.couponRepo.findOneBy({ id });
    if (!coupon) throw AppError.notFound('Coupon');

    Object.assign(coupon, data);
    return this.couponRepo.save(coupon);
  }

  public async deleteCoupon(id: string) {
    const result = await this.couponRepo.delete(id);
    if (result.affected === 0) throw AppError.notFound('Coupon');
  }

  public async validateCoupon(code: string, orderValue: number) {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon.isValid) {
      throw AppError.badRequest('Coupon is invalid or expired');
    }

    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      throw AppError.badRequest(`Minimum order value for this coupon is ${coupon.minOrderValue}`);
    }

    let discount = 0;
    if (coupon.type === 'fixed') {
      discount = Number(coupon.value);
    } else {
      discount = orderValue * (Number(coupon.value) / 100);
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    }

    return { valid: true, discount, coupon };
  }
}
