import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class OrdersController {
  private ordersService = new OrdersService();

  public checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.ordersService.checkout(req.user!.sub, req.body);
      return createdResponse(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  };

  public getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.ordersService.getUserOrders(req.user!.sub, req.query);
      return successResponse(res, { items, meta }, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  };

  public getMyOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.ordersService.getOrderById(req.params.id as string, req.user!.sub);
      return successResponse(res, order);
    } catch (error) {
      next(error);
    }
  };

  // ADMIN
  public getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.ordersService.getAllOrders(req.query);
      return successResponse(res, { items, meta }, 'Orders retrieved');
    } catch (error) {
      next(error);
    }
  };

  public getOrderAsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.ordersService.getOrderById(req.params.id as string);
      return successResponse(res, order);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, notes } = req.body;
      const order = await this.ordersService.updateOrderStatus(req.params.id as string, status, req.user!.sub, notes);
      return successResponse(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  };
}
