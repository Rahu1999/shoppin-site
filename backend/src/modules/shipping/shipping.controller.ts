import { Request, Response, NextFunction } from 'express';
import { ShippingService } from './shipping.service';
import { successResponse } from '@utils/apiResponse';

export class ShippingController {
  private shippingService = new ShippingService();

  public getMethods = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const methods = await this.shippingService.getAvailableMethods();
      return successResponse(res, methods, 'Shipping methods retrieved');
    } catch (error) {
      next(error);
    }
  };

  public estimateRates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { country, state, cartValue, weight } = req.body;
      const rates = await this.shippingService.estimateRates({
        country,
        state,
        cartValue: Number(cartValue),
        weight: Number(weight),
      });
      return successResponse(res, rates, 'Shipping estimated');
    } catch (error) {
      next(error);
    }
  };

  public getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.shippingService.getConfig();
      return successResponse(res, {
        name: config.name,
        flatFee: Number(config.flatFee),
        freeAbove: config.freeAbove != null ? Number(config.freeAbove) : null,
        estimatedDaysMin: config.estimatedDaysMin ?? null,
        estimatedDaysMax: config.estimatedDaysMax ?? null,
        isActive: config.isActive,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, flatFee, freeAbove, estimatedDaysMin, estimatedDaysMax } = req.body;
      const config = await this.shippingService.updateConfig({
        name,
        flatFee: flatFee !== undefined ? Number(flatFee) : undefined,
        freeAbove: freeAbove === '' || freeAbove === null ? null : freeAbove !== undefined ? Number(freeAbove) : undefined,
        estimatedDaysMin: estimatedDaysMin !== undefined ? Number(estimatedDaysMin) : undefined,
        estimatedDaysMax: estimatedDaysMax !== undefined ? Number(estimatedDaysMax) : undefined,
      });
      return successResponse(res, {
        name: config.name,
        flatFee: Number(config.flatFee),
        freeAbove: config.freeAbove != null ? Number(config.freeAbove) : null,
        estimatedDaysMin: config.estimatedDaysMin ?? null,
        estimatedDaysMax: config.estimatedDaysMax ?? null,
        isActive: config.isActive,
      }, 'Shipping config updated');
    } catch (error) {
      next(error);
    }
  };
}
