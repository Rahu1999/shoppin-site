import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('tax_config')
export class TaxConfig extends BaseEntity {
  @Column({ length: 50 })
  name!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
