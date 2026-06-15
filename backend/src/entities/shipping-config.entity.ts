import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('shipping_config')
export class ShippingConfig extends BaseEntity {
  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'flat_fee', type: 'decimal', precision: 12, scale: 2, default: 99 })
  flatFee!: number;

  @Column({ name: 'free_above', type: 'decimal', precision: 12, scale: 2, nullable: true })
  freeAbove?: number | null;

  @Column({ name: 'estimated_days_min', type: 'int', nullable: true })
  estimatedDaysMin?: number;

  @Column({ name: 'estimated_days_max', type: 'int', nullable: true })
  estimatedDaysMax?: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
