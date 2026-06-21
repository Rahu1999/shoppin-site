import { Request, Response, NextFunction } from 'express';
import { PaymentGatewayService } from './payment-gateway.service';
import { successResponse } from '@utils/apiResponse';

export class PaymentGatewayController {
  private service = new PaymentGatewayService();

  public getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.service.getConfig();
      return successResponse(res, {
        name: config.name,
        rate: Number(config.rate),
        taxRate: Number(config.taxRate),
        isEnabled: config.isEnabled,
        isActive: config.isActive,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, rate, taxRate, isEnabled } = req.body;
      const config = await this.service.updateConfig({
        name,
        rate: rate !== undefined ? Number(rate) : undefined,
        taxRate: taxRate !== undefined ? Number(taxRate) : undefined,
        isEnabled,
      });
      return successResponse(res, {
        name: config.name,
        rate: Number(config.rate),
        taxRate: Number(config.taxRate),
        isEnabled: config.isEnabled,
        isActive: config.isActive,
      }, 'Payment gateway config updated');
    } catch (error) {
      next(error);
    }
  };
}
