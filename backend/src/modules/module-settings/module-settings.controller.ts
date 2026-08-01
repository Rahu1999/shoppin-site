import { Request, Response, NextFunction } from 'express';
import { ModuleSettingsService } from './module-settings.service';
import { successResponse } from '@utils/apiResponse';

export class ModuleSettingsController {
  private settingsService = new ModuleSettingsService();

  public getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingsService.getAllAdmin();
      return successResponse(res, settings);
    } catch (error) {
      next(error);
    }
  };

  public getPublicFlags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const flags = await this.settingsService.getPublicFlags();
      return successResponse(res, flags);
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const setting = await this.settingsService.updateModule(req.params.moduleKey as string, req.body.isEnabled);
      return successResponse(res, setting, 'Module setting updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
