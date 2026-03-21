import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentStatus } from './payment-status.enum';
import { TransactionType } from './transaction-type.enum';


@Entity('payment_transactions')
export class PaymentTransaction {
  @Column({ primary: true, generated: 'uuid' })
  id!: string;

  @Column({ name: 'payment_id' })
  paymentId!: string;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'provider_reference', nullable: true })
  providerReference?: string;

  @Column({ type: 'enum', enum: PaymentStatus })
  status!: PaymentStatus;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Payment, (p) => p.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;
}
