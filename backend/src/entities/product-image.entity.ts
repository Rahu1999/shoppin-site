import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Column({ name: 'product_id' })
  productId!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  alt?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary!: boolean;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
