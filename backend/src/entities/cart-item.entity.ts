import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @Column({ name: 'cart_id' })
  cartId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @ManyToOne(() => Cart, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @ManyToOne(() => Product, (p) => p.cartItems)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductVariant, (v) => v.cartItems, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariant;
}
