import { Request, Response, NextFunction } from 'express';
import { PartialPaymentService } from './partial-payment.service';
import { successResponse } from '@utils/apiResponse';

export class PartialPaymentController {
  private service = new PartialPaymentService();

  public getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.service.getConfig();
      return successResponse(res, {
        isEnabled: config.isEnabled,
        depositType: config.depositType,
        depositValue: Number(config.depositValue),
        minimumOrderValue: Number(config.minimumOrderValue),
        label: config.label,
        preferredGateway: config.preferredGateway ?? null,
        isActive: config.isActive,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isEnabled, depositType, depositValue, minimumOrderValue, label, preferredGateway } = req.body;
      const config = await this.service.updateConfig({
        isEnabled,
        depositType,
        depositValue: depositValue !== undefined ? Number(depositValue) : undefined,
        minimumOrderValue: minimumOrderValue !== undefined ? Number(minimumOrderValue) : undefined,
        label,
        preferredGateway: preferredGateway !== undefined ? (preferredGateway || null) : undefined,
      });
      return successResponse(res, {
        isEnabled: config.isEnabled,
        depositType: config.depositType,
        depositValue: Number(config.depositValue),
        minimumOrderValue: Number(config.minimumOrderValue),
        label: config.label,
        preferredGateway: config.preferredGateway ?? null,
        isActive: config.isActive,
      }, 'Partial payment config updated');
    } catch (error) {
      next(error);
    }
  };
}
