import { Request, Response, NextFunction } from 'express';
import { GatewayProvidersService } from './gateway-providers.service';
import { successResponse } from '@utils/apiResponse';

export class GatewayProvidersController {
  private service = new GatewayProvidersService();

  public getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = await this.service.getAvailableGateways();
      return successResponse(res, providers);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const { isEnabled, isDefault, priority } = req.body;
      const provider = await this.service.updateProvider(slug, {
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
        priority: priority !== undefined ? Number(priority) : undefined,
      });
      return successResponse(res, provider, 'Gateway provider updated');
    } catch (error) {
      next(error);
    }
  };
}
