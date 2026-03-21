import { AppDataSource } from '@config/database';
import { AuditLog } from '@entities/audit-log.entity';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class AuditLogsService {
  private logRepo = AppDataSource.getRepository(AuditLog);

  public async getLogs(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.entityName) where.entityName = query.entityName;
    if (query.entityId) where.entityId = query.entityId;

    const [items, total] = await this.logRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'], // Might want to omit loading full user object for heavy logging
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }
}
