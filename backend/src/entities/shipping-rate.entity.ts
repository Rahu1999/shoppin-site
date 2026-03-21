import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ShippingMethod } from './shipping-method.entity';

@Entity('shipping_rates')
export class ShippingRate extends BaseEntity {
  @Column({ name: 'method_id' })
  methodId!: string;

  @Column({ name: 'min_weight_grams', type: 'int', default: 0 })
  minWeightGrams!: number;

  @Column({ name: 'max_weight_grams', type: 'int', nullable: true })
  maxWeightGrams?: number;

  // Added ability to filter rates by order value
  @Column({ name: 'min_order_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  minOrderValue!: number;

  @Column({ name: 'max_order_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxOrderValue?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  rate!: number;

  @ManyToOne(() => ShippingMethod, (sm) => sm.rates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'method_id' })
  method!: ShippingMethod;
}
