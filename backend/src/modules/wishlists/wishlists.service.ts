import { AppDataSource } from '@config/database';
import { Wishlist } from '@entities/wishlist.entity';
import { WishlistItem } from '@entities/wishlist-item.entity';
import { AppError } from '@utils/AppError';

export class WishlistsService {
  private wishlistRepo = AppDataSource.getRepository(Wishlist);
  private itemRepo = AppDataSource.getRepository(WishlistItem);

  public async getMyWishlist(userId: string) {
    let wishlist = await this.wishlistRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepo.create({ userId });
      await this.wishlistRepo.save(wishlist);
    }
    return wishlist;
  }

  public async toggleWishlistItem(userId: string, productId: string) {
    const wishlist = await this.getMyWishlist(userId);

    const existingItem = await this.itemRepo.findOneBy({ wishlistId: wishlist.id, productId });

    if (existingItem) {
      await this.itemRepo.remove(existingItem);
      return { added: false, message: 'Removed from wishlist' };
    } else {
      const newItem = this.itemRepo.create({ wishlistId: wishlist.id, productId });
      await this.itemRepo.save(newItem);
      return { added: true, message: 'Added to wishlist' };
    }
  }

  public async clearWishlist(userId: string) {
    const wishlist = await this.getMyWishlist(userId);
    await this.itemRepo.delete({ wishlistId: wishlist.id });
  }
}
