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

  @Column({ name: 'shipping_method_name', length: 100, nullable: true })
  shippingMethodName?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax!: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate!: number;

  @Column({ name: 'gateway_fee', type: 'decimal', precision: 12, scale: 2, default: 0 })
  gatewayFee!: number;

  @Column({ name: 'gateway_fee_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  gatewayFeeRate!: number;

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

  @Column({ name: 'is_partial_payment', default: false })
  isPartialPayment!: boolean;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  depositAmount!: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountPaid!: number;

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
