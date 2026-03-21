import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity('coupon_usages')
export class CouponUsage {
  @Column({ primary: true, generated: 'uuid' })
  id!: string;

  @Column({ name: 'coupon_id' })
  couponId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discountApplied!: number;

  @CreateDateColumn({ name: 'used_at' })
  usedAt!: Date;

  @ManyToOne(() => Coupon, (c) => c.usages)
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;
}
