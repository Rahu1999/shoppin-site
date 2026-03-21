import { Request, Response, NextFunction } from 'express';
import { CouponsService } from './coupons.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class CouponsController {
  private couponsService = new CouponsService();

  public getAdminCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.couponsService.getCoupons(req.query);
      return successResponse(res, items, 'Coupons fetched', 200, meta);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await this.couponsService.createCoupon(req.body);
      return createdResponse(res, coupon);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupon = await this.couponsService.updateCoupon(req.params.id as string, req.body);
      return successResponse(res, coupon);
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.couponsService.deleteCoupon(req.params.id as string);
      return successResponse(res, null, 'Coupon deleted');
    } catch (error) {
      next(error);
    }
  };

  public validate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, orderValue } = req.body;
      const result = await this.couponsService.validateCoupon(code, Number(orderValue));
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };
}
