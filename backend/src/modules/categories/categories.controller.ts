import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class CategoriesController {
  private categoriesService = new CategoriesService();

  public getTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminView = req.query.adminView === 'true';
      const tree = await this.categoriesService.getCategoriesTree(adminView);
      return successResponse(res, tree);
    } catch (error) {
      next(error);
    }
  };

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoriesService.getCategoryBySlug(req.params.slug as string);
      return successResponse(res, category);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoriesService.createCategory(req.body);
      return createdResponse(res, category);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoriesService.updateCategory(req.params.id as string, req.body);
      return successResponse(res, category);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoriesService.deleteCategory(req.params.id as string);
      return successResponse(res, null, 'Deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
