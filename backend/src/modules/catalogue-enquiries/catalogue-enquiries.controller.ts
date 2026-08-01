import { Request, Response, NextFunction } from 'express';
import { CatalogueEnquiriesService } from './catalogue-enquiries.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class CatalogueEnquiriesController {
  private enquiriesService = new CatalogueEnquiriesService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enquiry = await this.enquiriesService.createEnquiry(req.body);
      return createdResponse(res, enquiry, 'Enquiry submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  public getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.enquiriesService.getEnquiriesAdmin(req.query);
      return successResponse(res, { items, meta }, 'Enquiries fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enquiry = await this.enquiriesService.updateEnquiryStatus(req.params.id as string, req.body);
      return successResponse(res, enquiry, 'Enquiry updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
