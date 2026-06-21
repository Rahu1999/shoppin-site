import { AppDataSource } from '@config/database';
import { PaymentGatewayProvider } from '@entities/payment-gateway-provider.entity';
import { AppError } from '@utils/AppError';
import { getGatewayProvider, KNOWN_GATEWAYS } from '../../providers/payment';

export class GatewayProvidersService {
  private repo = AppDataSource.getRepository(PaymentGatewayProvider);

  private async seed(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;
    await this.repo.save(
      this.repo.create({
        slug: 'razorpay',
        name: 'Razorpay',
        isEnabled: true,
        isDefault: true,
        priority: 0,
        isActive: true,
      }),
    );
  }

  public async getAvailableGateways() {
    await this.seed();
    const rows = await this.repo.find({ where: { isActive: true }, order: { priority: 'ASC' } });

    return KNOWN_GATEWAYS.map(gw => {
      const row = rows.find(r => r.slug === gw.slug);
      const provider = getGatewayProvider(gw.slug);
      return {
        slug: gw.slug,
        name: gw.name,
        isEnabled: row?.isEnabled ?? false,
        isDefault: row?.isDefault ?? false,
        priority: row?.priority ?? 99,
        credentialsConfigured: provider.isCredentialsConfigured(),
      };
    });
  }

  public async getDefaultProvider(): Promise<PaymentGatewayProvider> {
    await this.seed();
    const row = await this.repo.findOne({ where: { isDefault: true, isActive: true } });
    if (!row) {
      const first = await this.repo.findOne({ where: { isEnabled: true, isActive: true }, order: { priority: 'ASC' } });
      if (!first) throw new AppError('No payment gateway configured', 503, 'GATEWAY_UNAVAILABLE');
      return first;
    }
    return row;
  }

  public async getEnabledByPriority(): Promise<PaymentGatewayProvider[]> {
    await this.seed();
    return this.repo.find({ where: { isEnabled: true, isActive: true }, order: { priority: 'ASC' } });
  }

  public async updateProvider(
    slug: string,
    data: { isEnabled?: boolean; isDefault?: boolean; priority?: number },
  ): Promise<PaymentGatewayProvider> {
    await this.seed();
    let row = await this.repo.findOneBy({ slug, isActive: true });
    if (!row) {
      const known = KNOWN_GATEWAYS.find(g => g.slug === slug);
      if (!known) throw AppError.badRequest(`Unknown gateway slug: ${slug}`);
      row = this.repo.create({ slug, name: known.name, isEnabled: false, isDefault: false, priority: 99, isActive: true });
    }

    if (data.isEnabled !== undefined) row.isEnabled = data.isEnabled;
    if (data.priority !== undefined) row.priority = data.priority;

    // Enforce single default — wrap in transaction to avoid a window with no default
    if (data.isDefault === true) {
      return AppDataSource.transaction(async (manager) => {
        await manager.update(PaymentGatewayProvider, { isActive: true }, { isDefault: false });
        row!.isDefault = true;
        row!.isEnabled = true; // default must be enabled
        return manager.save(PaymentGatewayProvider, row!);
      });
    } else if (data.isDefault === false && row.isDefault) {
      throw AppError.badRequest('Cannot unset the default gateway directly — set another gateway as default instead');
    }

    return this.repo.save(row);
  }
}
