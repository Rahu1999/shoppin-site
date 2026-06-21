import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('payment_gateway_providers')
export class PaymentGatewayProvider extends BaseEntity {
  @Column({ length: 50, unique: true })
  slug!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ default: false })
  isEnabled!: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ default: true })
  isActive!: boolean;
}
