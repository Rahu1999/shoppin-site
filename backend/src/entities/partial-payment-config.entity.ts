import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('partial_payment_config')
export class PartialPaymentConfig extends BaseEntity {
  @Column({ name: 'is_enabled', default: false })
  isEnabled!: boolean;

  @Column({ name: 'deposit_type', length: 20, default: 'percentage' })
  depositType!: string;

  @Column({ name: 'deposit_value', type: 'decimal', precision: 12, scale: 2, default: 30 })
  depositValue!: number;

  @Column({ name: 'minimum_order_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  minimumOrderValue!: number;

  @Column({ length: 200, default: 'Pay 30% Now, Rest Before Dispatch' })
  label!: string;

  @Column({ name: 'preferred_gateway', length: 50, nullable: true })
  preferredGateway?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
