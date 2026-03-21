import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { successResponse } from '@utils/apiResponse';

export class PaymentsController {
  private paymentsService = new PaymentsService();

  public processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.paymentsService.processOrderPayment(req.params.orderId as string, req.user!.sub, req.body);
      return successResponse(res, payment, 'Payment processed successfully');
    } catch (error) {
      next(error);
    }
  };

  public getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await this.paymentsService.getOrderPayments(req.params.orderId as string, req.user!.sub);
      return successResponse(res, payments, 'Payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
