import { Request, Response, NextFunction } from 'express';
import { WishlistsService } from './wishlists.service';
import { successResponse } from '@utils/apiResponse';

export class WishlistsController {
  private wishlistsService = new WishlistsService();

  public getMyWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wishlist = await this.wishlistsService.getMyWishlist(req.user!.sub);
      return successResponse(res, wishlist);
    } catch (error) {
      next(error);
    }
  };

  public toggleItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.wishlistsService.toggleWishlistItem(req.user!.sub, req.body.productId);
      return successResponse(res, { added: result.added }, result.message);
    } catch (error) {
      next(error);
    }
  };

  public clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.wishlistsService.clearWishlist(req.user!.sub);
      return successResponse(res, null, 'Wishlist cleared');
    } catch (error) {
      next(error);
    }
  };
}
