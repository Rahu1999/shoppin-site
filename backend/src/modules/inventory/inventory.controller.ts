import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { successResponse } from '@utils/apiResponse';

export class InventoryController {
  private inventoryService = new InventoryService();

  public getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.inventoryService.getInventoryItems(req.query);
      return successResponse(res, { items, meta }, 'Inventory fetched');
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quantity, notes } = req.body;
      const adminId = req.user!.sub;
      const inventory = await this.inventoryService.updateInventory(req.params.id as string, quantity, adminId, notes);
      return successResponse(res, inventory, 'Inventory updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.inventoryService.getInventoryLogs(req.params.id as string, req.query);
      return successResponse(res, { items, meta }, 'Inventory logs fetched');
    } catch (error) {
      next(error);
    }
  };
}
