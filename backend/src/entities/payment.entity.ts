import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { PaymentTransaction } from './payment-transaction.entity';

import { PaymentStatus } from './payment-status.enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ length: 100 })
  provider!: string; // e.g., 'razorpay', 'stripe'

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ length: 3, default: 'INR' })
  currency!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ name: 'provider_order_id', nullable: true })
  providerOrderId?: string;

  @ManyToOne(() => Order, (o) => o.payments)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @OneToMany(() => PaymentTransaction, (pt) => pt.payment, { cascade: true })
  transactions!: PaymentTransaction[];
}
