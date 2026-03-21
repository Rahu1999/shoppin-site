import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class ProductsController {
  private productsService = new ProductsService();

  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.productsService.getProducts(req.query);
      return successResponse(res, { items, meta }, 'Products fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  public getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productsService.getProductBySlug(req.params.slug as string);
      return successResponse(res, product);
    } catch (error) {
      next(error);
    }
  };

  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productsService.createProduct(req.body);
      return createdResponse(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productsService.updateProduct(req.params.id as string, req.body);
      return successResponse(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productsService.deleteProduct(req.params.id as string);
      return successResponse(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
