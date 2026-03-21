import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ShippingRate } from './shipping-rate.entity';

@Entity('shipping_methods')
export class ShippingMethod extends BaseEntity {
  @Column({ length: 150 })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'estimated_days_min', type: 'int', nullable: true })
  estimatedDaysMin?: number;

  @Column({ name: 'estimated_days_max', type: 'int', nullable: true })
  estimatedDaysMax?: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => ShippingRate, (sr) => sr.method, { cascade: true })
  rates!: ShippingRate[];
}
