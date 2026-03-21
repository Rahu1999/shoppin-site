import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ name: 'product_id', nullable: true })
  productId?: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: string;

  @Column({ length: 300 })
  name!: string;

  @Column({ length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @ManyToOne(() => Order, (o) => o.items)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => Product, (p) => p.orderItems, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @ManyToOne(() => ProductVariant, (v) => v.orderItems, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariant;
}
