import { Request, Response, NextFunction } from 'express';
import { CatalogueItemsService } from './catalogue-items.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class CatalogueItemsController {
  private itemsService = new CatalogueItemsService();

  public getPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.itemsService.getPublicItems();
      return successResponse(res, items);
    } catch (error) {
      next(error);
    }
  };

  public getPublicOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.itemsService.getPublicItemBySlug(req.params.slug as string);
      return successResponse(res, item);
    } catch (error) {
      next(error);
    }
  };

  public getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.itemsService.getItemsAdmin(req.query);
      return successResponse(res, { items, meta }, 'Catalogue items fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.itemsService.createItem(req.body);
      return createdResponse(res, item, 'Catalogue item created successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.itemsService.updateItem(req.params.id as string, req.body);
      return successResponse(res, item, 'Catalogue item updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.itemsService.deleteItem(req.params.id as string);
      return successResponse(res, null, 'Catalogue item deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
