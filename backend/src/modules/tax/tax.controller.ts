import { Request, Response, NextFunction } from 'express';
import { TaxService } from './tax.service';
import { successResponse } from '@utils/apiResponse';

export class TaxController {
  private taxService = new TaxService();

  public getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.taxService.getActiveConfig();
      return successResponse(res, { name: config.name, rate: Number(config.rate), isActive: config.isActive });
    } catch (error) {
      next(error);
    }
  };

  public updateRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.taxService.updateRate(Number(req.body.rate));
      return successResponse(res, { name: config.name, rate: Number(config.rate), isActive: config.isActive }, 'Tax rate updated');
    } catch (error) {
      next(error);
    }
  };
}
