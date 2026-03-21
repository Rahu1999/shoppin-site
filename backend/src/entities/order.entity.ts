import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Payment } from './payment.entity';
import { Coupon } from './coupon.entity';

import { OrderStatus } from './order-status.enum';

@Entity('orders')
@Index(['userId', 'status'])
export class Order extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingFee!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total!: number;

  @Column({ name: 'coupon_id', nullable: true })
  couponId?: string;

  @Column({ name: 'shipping_address', type: 'json' })
  shippingAddress!: Record<string, any>;

  @Column({ name: 'billing_address', type: 'json' })
  billingAddress!: Record<string, any>;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => User, (u) => u.orders)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Coupon, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: Coupon;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (h) => h.order, { cascade: true })
  history!: OrderStatusHistory[];

  @OneToMany(() => Payment, (p) => p.order)
  payments!: Payment[];
}
