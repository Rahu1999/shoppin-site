import { AppDataSource } from '@config/database';
import { Order } from '@entities/order.entity';
import { OrderItem } from '@entities/order-item.entity';
import { OrderStatusHistory } from '@entities/order-status-history.entity';
import { Cart } from '@entities/cart.entity';
import { Address } from '@entities/address.entity';
import { Coupon } from '@entities/coupon.entity';
import { Inventory } from '@entities/inventory.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';
import { OrderStatus } from '@entities/order-status.enum';

export class OrdersService {
  private orderRepo = AppDataSource.getRepository(Order);
  private orderHistoryRepo = AppDataSource.getRepository(OrderStatusHistory);
  private cartRepo = AppDataSource.getRepository(Cart);
  private addressRepo = AppDataSource.getRepository(Address);
  private couponRepo = AppDataSource.getRepository(Coupon);
  private inventoryRepo = AppDataSource.getRepository(Inventory);

  public async checkout(userId: string, data: Record<string, any>) {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'items.variant'],
    });

    if (!cart || cart.items.length === 0) {
      throw AppError.badRequest('Cart is empty');
    }

    // Resolve Addresses
    let shippingAddress = data.shippingAddress;
    if (data.shippingAddressId) {
      const savedAddress = await this.addressRepo.findOneBy({ id: data.shippingAddressId, userId });
      if (!savedAddress) throw AppError.notFound('Shipping address not found');
      shippingAddress = { ...savedAddress };
    }

    let billingAddress = data.billingAddress || shippingAddress;

    // Calculate Totals
    let subtotal = 0;
    console.log('Cart Items in Checkout:', JSON.stringify(cart.items.map(i => ({ id: i.id, pId: i.productId, p: !!i.product, v: !!i.variant })), null, 2));
    
    cart.items.forEach(item => {
      // Refresh price from DB entities to avoid cart tampering
      if (!item.product && !item.variant) {
        console.error('Item product or variant is missing:', item.id);
        // Fallback to item.price if product relation failed to load
        subtotal += Number(item.price || 0) * item.quantity;
        return;
      }
      const price = item.variant ? item.variant.price : item.product?.basePrice;
      subtotal += Number(price || item.price || 0) * item.quantity;
    });

    let discount = 0;
    let coupon: Coupon | null = null;
    
    if (data.couponCode) {
      coupon = await this.couponRepo.findOneBy({ code: data.couponCode, isActive: true });
      if (!coupon || !coupon.isValid) {
        throw AppError.badRequest('Invalid or expired coupon', undefined);
      }
      
      if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
        throw AppError.badRequest(`Minimum order value is ${coupon.minOrderValue}`);
      }

      if (coupon.type === 'fixed') {
        discount = Number(coupon.value);
      } else {
        discount = subtotal * (Number(coupon.value) / 100);
      }
      
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    }

    const shippingFee = 0; // Matching frontend "Free" shipping
    const tax = 0; // Matching frontend "No Tax" display
    const total = subtotal - discount + shippingFee + tax;

    // Transaction to safely create order, deduct inventory, and clear cart
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check and deduct inventory
      for (const item of cart.items) {
        const inventory = await queryRunner.manager.findOne(Inventory, {
          where: { productId: item.productId, variantId: item.variantId || undefined },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inventory || inventory.available < item.quantity) {
          throw AppError.insufficientStock();
        }

        inventory.quantity -= item.quantity;
        await queryRunner.manager.save(inventory);
      }

      // 2. Create Order
      const order = queryRunner.manager.create(Order, {
        userId,
        status: OrderStatus.PENDING,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        couponId: coupon?.id,
        shippingAddress,
        billingAddress,
        notes: data.notes,
      });
      await queryRunner.manager.save(order);

      // 3. Create Order Items
      const orderItems = cart.items.map(item => {
        const name = item.variant 
          ? `${item.product?.name || 'Unknown'} - ${item.variant.name}` 
          : (item.product?.name || 'Product ' + item.productId);
        
        const sku = item.variant ? item.variant.sku : item.product?.sku;
        const price = item.variant ? item.variant.price : (item.product?.basePrice || item.price);

        return queryRunner.manager.create(OrderItem, {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          name,
          sku,
          quantity: item.quantity,
          price,
        });
      });
      await queryRunner.manager.save(orderItems);

      // 4. Create History Log
      const history = queryRunner.manager.create(OrderStatusHistory, {
        orderId: order.id,
        status: OrderStatus.PENDING,
        notes: 'Order placed successfully',
        changedById: userId,
      });
      await queryRunner.manager.save(history);

      // 5. Update Coupon Usage
      if (coupon) {
        coupon.usesCount += 1;
        await queryRunner.manager.save(coupon);
      }

      // 6. Clear Cart
      await queryRunner.manager.delete(Cart, { id: cart.id });

      await queryRunner.commitTransaction();
      return this.orderRepo.findOne({ where: { id: order.id }, relations: ['items'] });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async getUserOrders(userId: string, query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const [items, total] = await this.orderRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['items'],
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async getOrderById(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) where.userId = userId;

    const order = await this.orderRepo.findOne({
      where,
      relations: ['items', 'items.product', 'history', 'payments'],
    });

    if (!order) throw AppError.notFound('Order');
    return order;
  }

  // Admin Methods
  public async getAllOrders(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    const where: any = {};
    if (query.status) where.status = query.status;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['user'],
    });

    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus, adminId: string, notes?: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) throw AppError.notFound('Order');

    order.status = status;
    await this.orderRepo.save(order);

    const history = this.orderHistoryRepo.create({
      orderId,
      status,
      notes,
      changedById: adminId,
    });
    await this.orderHistoryRepo.save(history);

    return order;
  }
}
