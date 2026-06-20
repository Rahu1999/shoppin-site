import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class PaymentsController {
  private paymentsService = new PaymentsService();

  public processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.paymentsService.processOrderPayment(
        req.params.orderId as string,
        req.user!.sub,
        req.body,
      );
      return successResponse(res, payment, 'Payment processed successfully');
    } catch (error) {
      next(error);
    }
  };

  public createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentsService.createRazorpayOrder(
        req.body.orderId,
        req.user!.sub,
      );
      return createdResponse(res, result, 'Razorpay order created');
    } catch (error) {
      next(error);
    }
  };

  public verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await this.paymentsService.verifyRazorpayPayment(req.body, req.user!.sub);
      return successResponse(res, payment, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  };

  public getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await this.paymentsService.getOrderPayments(
        req.params.orderId as string,
        req.user!.sub,
      );
      return successResponse(res, payments, 'Payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
