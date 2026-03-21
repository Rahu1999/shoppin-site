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
        weight: Number(weight)
      });
      return successResponse(res, rates, 'Shipping estimated');
    } catch (error) {
      next(error);
    }
  };
}
