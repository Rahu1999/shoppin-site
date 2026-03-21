import { Request, Response, NextFunction } from 'express';
import { CartsService } from './carts.service';
import { successResponse } from '@utils/apiResponse';

export class CartsController {
  private cartsService = new CartsService();

  private getCartContext(req: Request) {
    return {
      userId: req.user?.sub,
      sessionId: req.headers['x-session-id'] as string | undefined,
    };
  }

  public getMyCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, sessionId } = this.getCartContext(req);
      const cart = await this.cartsService.getCart(userId, sessionId);
      return successResponse(res, cart);
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, sessionId } = this.getCartContext(req);
      const cart = await this.cartsService.getCart(userId, sessionId);
      const updatedCart = await this.cartsService.addItem(cart.id, req.body);
      return successResponse(res, updatedCart, 'Item added to cart');
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, sessionId } = this.getCartContext(req);
      const cart = await this.cartsService.getCart(userId, sessionId);
      const updatedCart = await this.cartsService.updateItemQuantity(cart.id, req.params.itemId as string, req.body.quantity);
      return successResponse(res, updatedCart, 'Cart updated');
    } catch (error) {
      next(error);
    }
  };

  public removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, sessionId } = this.getCartContext(req);
      const cart = await this.cartsService.getCart(userId, sessionId);
      await this.cartsService.removeItem(cart.id, req.params.itemId as string);
      return successResponse(res, null, 'Item removed');
    } catch (error) {
      next(error);
    }
  };

  public clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, sessionId } = this.getCartContext(req);
      const cart = await this.cartsService.getCart(userId, sessionId);
      await this.cartsService.clearCart(cart.id);
      return successResponse(res, null, 'Cart cleared');
    } catch (error) {
      next(error);
    }
  };

  public mergeCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return successResponse(res, null, 'Must be logged in to merge');
      const sessionId = req.headers['x-session-id'] as string;
      if (sessionId) {
        await this.cartsService.mergeSessionCart(req.user.sub, sessionId);
      }
      return successResponse(res, null, 'Cart merged successfully');
    } catch (error) {
      next(error);
    }
  };
}
