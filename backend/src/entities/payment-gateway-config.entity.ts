import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('payment_gateway_config')
export class PaymentGatewayConfig extends BaseEntity {
  @Column({ length: 100, default: 'Razorpay' })
  name!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  rate!: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 18.0 })
  taxRate!: number;

  @Column({ name: 'is_enabled', default: true })
  isEnabled!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
