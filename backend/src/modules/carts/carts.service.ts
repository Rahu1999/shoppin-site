import { AppDataSource } from '@config/database';
import { Cart } from '@entities/cart.entity';
import { CartItem } from '@entities/cart-item.entity';
import { Product } from '@entities/product.entity';
import { ProductVariant } from '@entities/product-variant.entity';
import { AppError } from '@utils/AppError';

export class CartsService {
  private cartRepo = AppDataSource.getRepository(Cart);
  private cartItemRepo = AppDataSource.getRepository(CartItem);
  private productRepo = AppDataSource.getRepository(Product);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  public async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) throw AppError.badRequest('Provide userId or sessionId');

    const where = userId ? { userId } : { sessionId };
    let cart = await this.cartRepo.findOne({
      where,
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepo.create(where);
      await this.cartRepo.save(cart);
    }
    return cart;
  }

  public async addItem(cartId: string, data: { productId: string; variantId?: string; quantity: number }) {
    const product = await this.productRepo.findOneBy({ id: data.productId, isActive: true });
    if (!product) throw AppError.notFound('Product');

    let price = product.basePrice;

    if (data.variantId) {
      const variant = await this.variantRepo.findOneBy({ id: data.variantId, productId: data.productId, isActive: true });
      if (!variant) throw AppError.notFound('Product variant');
      price = variant.price;
    }

    const existingItem = await this.cartItemRepo.findOneBy({
      cartId,
      productId: data.productId,
      variantId: data.variantId || undefined,
    });

    if (existingItem) {
      existingItem.quantity += data.quantity;
      await this.cartItemRepo.save(existingItem);
    } else {
      const newItem = this.cartItemRepo.create({
        cartId,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price,
      });
      await this.cartItemRepo.save(newItem);
    }

    return this.cartRepo.findOne({ where: { id: cartId }, relations: ['items', 'items.product', 'items.variant'] });
  }

  public async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    const item = await this.cartItemRepo.findOneBy({ id: itemId, cartId });
    if (!item) throw AppError.notFound('Cart item');

    item.quantity = quantity;
    await this.cartItemRepo.save(item);
    
    return this.cartRepo.findOne({ where: { id: cartId }, relations: ['items', 'items.product', 'items.variant'] });
  }

  public async removeItem(cartId: string, itemId: string) {
    const result = await this.cartItemRepo.delete({ id: itemId, cartId });
    if (result.affected === 0) throw AppError.notFound('Cart item');
  }

  public async clearCart(cartId: string) {
    await this.cartItemRepo.delete({ cartId });
  }

  public async mergeSessionCart(userId: string, sessionId: string) {
    const sessionCart = await this.cartRepo.findOne({ where: { sessionId }, relations: ['items'] });
    if (!sessionCart || sessionCart.items.length === 0) return;

    let userCart = await this.cartRepo.findOne({ where: { userId }, relations: ['items'] });
    if (!userCart) {
      userCart = this.cartRepo.create({ userId });
      await this.cartRepo.save(userCart);
    }

    // Move items to user cart
    for (const item of sessionCart.items) {
      await this.addItem(userCart.id, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    await this.cartRepo.delete(sessionCart.id);
  }
}
