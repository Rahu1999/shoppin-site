import { AppDataSource } from '@config/database';
import { Inventory } from '@entities/inventory.entity';
import { InventoryLog, InventoryChangeReason } from '@entities/inventory-log.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

export class InventoryService {
  private inventoryRepo = AppDataSource.getRepository(Inventory);
  private logRepo = AppDataSource.getRepository(InventoryLog);

  public async getInventoryItems(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where: any = {};
    if (query.productId) where.productId = query.productId;

    const [items, total] = await this.inventoryRepo.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['product', 'variant'],
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async updateInventory(inventoryId: string, quantity: number, adminId: string, notes?: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { id: inventoryId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) throw AppError.notFound('Inventory record');

      const oldQuantity = inventory.quantity;
      const difference = quantity - oldQuantity;

      inventory.quantity = quantity;
      await queryRunner.manager.save(inventory);

      if (difference !== 0) {
        const log = queryRunner.manager.create(InventoryLog, {
          inventoryId,
          changeQty: difference,
          quantityBefore: oldQuantity,
          quantityAfter: quantity,
          reason: InventoryChangeReason.ADJUSTMENT,
          notes,
          userId: adminId,
        });
        await queryRunner.manager.save(log);
      }

      await queryRunner.commitTransaction();
      return inventory;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async getInventoryLogs(inventoryId: string, query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [items, total] = await this.logRepo.findAndCount({
      where: { inventoryId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['changedBy'],
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }
}
