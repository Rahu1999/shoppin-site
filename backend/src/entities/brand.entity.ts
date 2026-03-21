import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('brands')
export class Brand extends BaseEntity {
  @Column({ length: 150 })
  name!: string;

  @Column({ unique: true, length: 200 })
  slug!: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => Product, (p) => p.brand)
  products!: Product[];
}
