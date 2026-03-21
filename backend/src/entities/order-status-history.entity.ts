import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';

@Entity('order_status_history')
export class OrderStatusHistory {
  @Column({ primary: true, generated: 'uuid' })
  id!: string;

  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ type: 'enum', enum: OrderStatus })
  status!: OrderStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'changed_by_id', nullable: true })
  changedById?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Order, (o) => o.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;
}
