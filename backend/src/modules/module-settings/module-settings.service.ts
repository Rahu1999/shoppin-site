import { AppDataSource } from '@config/database';
import { ModuleSetting } from '@entities/module-setting.entity';
import { AppError } from '@utils/AppError';
import { In } from 'typeorm';

const DEFAULT_MODULES = [
  { moduleKey: 'blog', label: 'Blog' },
  { moduleKey: 'catalogue', label: 'Catalogue' },
  { moduleKey: 'coupons', label: 'Coupons' },
  { moduleKey: 'reviews', label: 'Reviews' },
];

// Modules whose flag also gates public routes (vs. admin-nav-only)
const PUBLIC_GATED_MODULES = ['blog', 'catalogue'];

export class ModuleSettingsService {
  private settingRepo = AppDataSource.getRepository(ModuleSetting);

  // Dev relies on TypeORM `synchronize` for schema, which does not run the
  // migration's seed INSERTs — so lazily backfill any missing default rows.
  private async ensureDefaults() {
    const count = await this.settingRepo.count();
    if (count >= DEFAULT_MODULES.length) return;

    for (const def of DEFAULT_MODULES) {
      const existing = await this.settingRepo.findOneBy({ moduleKey: def.moduleKey });
      if (!existing) {
        await this.settingRepo.save(this.settingRepo.create({ ...def, isEnabled: true }));
      }
    }
  }

  public async getAllAdmin() {
    await this.ensureDefaults();
    return this.settingRepo.find({ order: { moduleKey: 'ASC' } });
  }

  public async getPublicFlags() {
    await this.ensureDefaults();
    const settings = await this.settingRepo.find({
      where: { moduleKey: In(PUBLIC_GATED_MODULES) },
    });

    const flags: Record<string, boolean> = {};
    for (const key of PUBLIC_GATED_MODULES) {
      flags[key] = settings.find((s) => s.moduleKey === key)?.isEnabled ?? true;
    }
    return flags;
  }

  public async updateModule(moduleKey: string, isEnabled: boolean) {
    await this.ensureDefaults();
    const existing = await this.settingRepo.findOneBy({ moduleKey });
    if (!existing) throw AppError.notFound('Module setting');

    existing.isEnabled = isEnabled;
    return this.settingRepo.save(existing);
  }
}
