import {
  Entity, Column, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('catalogue_items')
@Index(['categoryId'])
@Index(['isActive'])
export class CatalogueItem extends BaseEntity {
  @Column({ length: 300 })
  name!: string;

  @Column({ unique: true, length: 350 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json' })
  images!: { url: string; isPrimary: boolean }[];

  @Column({ type: 'json' })
  sizes!: string[];

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @Column({ name: 'source_product_id', nullable: true })
  sourceProductId?: string;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_product_id' })
  sourceProduct?: Product;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'meta_title', length: 255, nullable: true })
  metaTitle?: string;

  @Column({ name: 'meta_description', length: 255, nullable: true })
  metaDescription?: string;
}
