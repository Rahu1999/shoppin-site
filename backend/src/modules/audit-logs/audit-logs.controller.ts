import { Request, Response, NextFunction } from 'express';
import { AuditLogsService } from './audit-logs.service';
import { successResponse } from '@utils/apiResponse';

export class AuditLogsController {
  private auditLogsService = new AuditLogsService();

  public getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.auditLogsService.getLogs(req.query);
      return successResponse(res, items, 'Audit logs fetched', 200, meta);
    } catch (error) {
      next(error);
    }
  };
}
