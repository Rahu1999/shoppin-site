import { AppDataSource } from '@config/database';
import { PaymentGatewayConfig } from '@entities/payment-gateway-config.entity';
import { AppError } from '@utils/AppError';

export class PaymentGatewayService {
  private repo = AppDataSource.getRepository(PaymentGatewayConfig);

  public async getConfig(): Promise<PaymentGatewayConfig> {
    let config = await this.repo.findOneBy({ isActive: true });
    if (!config) {
      config = this.repo.create({ name: 'Razorpay', rate: 2, taxRate: 18, isEnabled: true, isActive: true });
      await this.repo.save(config);
    }
    return config;
  }

  public async updateConfig(data: {
    name?: string;
    rate?: number;
    taxRate?: number;
    isEnabled?: boolean;
  }): Promise<PaymentGatewayConfig> {
    if (data.rate !== undefined && (data.rate < 0 || data.rate > 10)) {
      throw AppError.badRequest('Gateway fee rate must be between 0 and 10%');
    }
    if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
      throw AppError.badRequest('GST on gateway fee must be between 0 and 100%');
    }
    const config = await this.getConfig();
    Object.assign(config, data);
    return this.repo.save(config);
  }
}
