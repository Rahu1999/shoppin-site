import { AppDataSource } from '@config/database';
import { ShippingMethod } from '@entities/shipping-method.entity';
import { ShippingRate } from '@entities/shipping-rate.entity';
import { ShippingConfig } from '@entities/shipping-config.entity';
import { AppError } from '@utils/AppError';

export class ShippingService {
  private methodRepo = AppDataSource.getRepository(ShippingMethod);
  private rateRepo = AppDataSource.getRepository(ShippingRate);
  private shippingConfigRepo = AppDataSource.getRepository(ShippingConfig);

  public async getAvailableMethods() {
    return this.methodRepo.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

  public async estimateRates(data: { country: string; state?: string | null; cartValue: number; weight: number }) {
    const rates = await this.rateRepo.createQueryBuilder('rate')
      .leftJoinAndSelect('rate.method', 'method')
      .where('method.isActive = true')
      .andWhere('rate.minWeightGrams <= :weight', { weight: data.weight })
      .andWhere('(rate.maxWeightGrams >= :weight OR rate.maxWeightGrams IS NULL)', { weight: data.weight })
      .andWhere('rate.minOrderValue <= :cartValue', { cartValue: data.cartValue })
      .andWhere('(rate.maxOrderValue >= :cartValue OR rate.maxOrderValue IS NULL)', { cartValue: data.cartValue })
      .orderBy('rate.rate', 'ASC')
      .getMany();

    return rates.map(r => ({
      methodId: r.methodId,
      methodName: r.method.name,
      currency: 'INR',
      price: Number(r.rate),
      estimatedDaysMin: r.method.estimatedDaysMin,
      estimatedDaysMax: r.method.estimatedDaysMax,
    }));
  }

  public async getConfig(): Promise<ShippingConfig> {
    let config = await this.shippingConfigRepo.findOneBy({ isActive: true });
    if (!config) {
      config = this.shippingConfigRepo.create({
        name: 'Standard Delivery',
        flatFee: 99,
        freeAbove: 999,
        estimatedDaysMin: 5,
        estimatedDaysMax: 7,
        isActive: true,
      });
      await this.shippingConfigRepo.save(config);
    }
    return config;
  }

  public async updateConfig(data: {
    name?: string;
    flatFee?: number;
    freeAbove?: number | null;
    estimatedDaysMin?: number;
    estimatedDaysMax?: number;
  }): Promise<ShippingConfig> {
    if (data.flatFee !== undefined && data.flatFee < 0) {
      throw AppError.badRequest('Flat fee cannot be negative');
    }
    if (data.freeAbove !== undefined && data.freeAbove !== null && data.freeAbove < 0) {
      throw AppError.badRequest('Free above threshold cannot be negative');
    }
    const config = await this.getConfig();
    Object.assign(config, data);
    return this.shippingConfigRepo.save(config);
  }
}
