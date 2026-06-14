import { AppDataSource } from '@config/database';
import { TaxConfig } from '@entities/tax-config.entity';
import { AppError } from '@utils/AppError';

export class TaxService {
  private taxConfigRepo = AppDataSource.getRepository(TaxConfig);

  public async getActiveConfig(): Promise<TaxConfig> {
    let config = await this.taxConfigRepo.findOneBy({ isActive: true });
    if (!config) {
      // Auto-seed default GST config if none exists
      config = this.taxConfigRepo.create({ name: 'GST', rate: 18, isActive: true });
      await this.taxConfigRepo.save(config);
    }
    return config;
  }

  public async updateRate(rate: number): Promise<TaxConfig> {
    if (rate < 0 || rate > 100) {
      throw AppError.badRequest('Tax rate must be between 0 and 100');
    }
    const config = await this.getActiveConfig();
    config.rate = rate;
    return this.taxConfigRepo.save(config);
  }
}
