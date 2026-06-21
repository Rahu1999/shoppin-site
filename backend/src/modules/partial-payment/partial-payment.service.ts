import { AppDataSource } from '@config/database';
import { PartialPaymentConfig } from '@entities/partial-payment-config.entity';
import { AppError } from '@utils/AppError';

export class PartialPaymentService {
  private repo = AppDataSource.getRepository(PartialPaymentConfig);

  public async getConfig(): Promise<PartialPaymentConfig> {
    let config = await this.repo.findOneBy({ isActive: true });
    if (!config) {
      config = this.repo.create({
        isEnabled: false,
        depositType: 'percentage',
        depositValue: 30,
        minimumOrderValue: 0,
        label: 'Pay 30% Now, Rest Before Dispatch',
        isActive: true,
      });
      await this.repo.save(config);
    }
    return config;
  }

  public async updateConfig(data: {
    isEnabled?: boolean;
    depositType?: string;
    depositValue?: number;
    minimumOrderValue?: number;
    label?: string;
    preferredGateway?: string | null;
  }): Promise<PartialPaymentConfig> {
    if (data.depositType !== undefined && !['percentage', 'fixed'].includes(data.depositType)) {
      throw AppError.badRequest('depositType must be "percentage" or "fixed"');
    }
    if (data.depositValue !== undefined) {
      if (data.depositType === 'percentage' || (!data.depositType && (await this.getConfig()).depositType === 'percentage')) {
        if (data.depositValue <= 0 || data.depositValue >= 100) {
          throw AppError.badRequest('Deposit percentage must be between 1 and 99');
        }
      } else if (data.depositValue <= 0) {
        throw AppError.badRequest('Deposit amount must be greater than 0');
      }
    }
    if (data.minimumOrderValue !== undefined && data.minimumOrderValue < 0) {
      throw AppError.badRequest('Minimum order value cannot be negative');
    }
    const VALID_GATEWAY_SLUGS = ['razorpay', 'stripe', 'payunow'];
    if (data.preferredGateway && !VALID_GATEWAY_SLUGS.includes(data.preferredGateway)) {
      throw AppError.badRequest(`Unknown payment gateway: ${data.preferredGateway}`);
    }
    const config = await this.getConfig();
    Object.assign(config, data);
    return this.repo.save(config);
  }

  public calculateDeposit(orderTotal: number, config: PartialPaymentConfig): number {
    if (config.depositType === 'percentage') {
      return Math.round(orderTotal * (Number(config.depositValue) / 100) * 100) / 100;
    }
    return Math.min(Number(config.depositValue), orderTotal);
  }
}
