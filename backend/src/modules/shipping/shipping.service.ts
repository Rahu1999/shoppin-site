import { AppDataSource } from '@config/database';
import { ShippingMethod } from '@entities/shipping-method.entity';
import { ShippingRate } from '@entities/shipping-rate.entity';

export class ShippingService {
  private methodRepo = AppDataSource.getRepository(ShippingMethod);
  private rateRepo = AppDataSource.getRepository(ShippingRate);

  public async getAvailableMethods() {
    return this.methodRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

  public async estimateRates(data: { country: string; state?: string | null; cartValue: number; weight: number }) {
    // In actual routing, country/state might be in another table, or we just rely on weight/order matching.
    const rates = await this.rateRepo.createQueryBuilder('rate')
      .leftJoinAndSelect('rate.method', 'method')
      .where('method.isActive = true')
      .andWhere('rate.minWeightGrams <= :weight', { weight: data.weight })
      .andWhere('(rate.maxWeightGrams >= :weight OR rate.maxWeightGrams IS NULL)', { weight: data.weight })
      .andWhere('rate.minOrderValue <= :cartValue', { cartValue: data.cartValue })
      .andWhere('(rate.maxOrderValue >= :cartValue OR rate.maxOrderValue IS NULL)', { cartValue: data.cartValue })
      .orderBy('rate.rate', 'ASC')
      .getMany();

    return rates.map(r => {
      return {
        methodId: r.methodId,
        methodName: r.method.name,
        currency: 'USD',
        price: Number(r.rate),
        estimatedDaysMin: r.method.estimatedDaysMin,
        estimatedDaysMax: r.method.estimatedDaysMax,
      };
    });
  }
}
