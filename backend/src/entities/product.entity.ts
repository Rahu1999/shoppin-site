import {
  Entity, Column, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Inventory } from './inventory.entity';
import { Review } from './review.entity';
import { CartItem } from './cart-item.entity';
import { OrderItem } from './order-item.entity';

@Entity('products')
@Index(['categoryId'])
@Index(['brandId'])
@Index(['isActive'])
export class Product extends BaseEntity {
  @Column({ length: 300 })
  name!: string;

  @Column({ unique: true, length: 350 })
  slug!: string;

  @Column({ unique: true, length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice!: number;

  @Column({ name: 'compare_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  comparePrice?: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice?: number;

  @Column({ name: 'weight_grams', type: 'int', nullable: true })
  weightGrams?: number;

  @Column({ type: 'json', nullable: true })
  attributes?: Record<string, unknown>;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured!: boolean;

  @Column({ name: 'meta_title', nullable: true, length: 255 })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;

  @Column({ name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => Category, (c) => c.products)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ name: 'brand_id', nullable: true })
  brandId?: string;

  @ManyToOne(() => Brand, (b) => b.products, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand?: Brand;

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: true })
  images!: ProductImage[];

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
  variants!: ProductVariant[];

  @OneToMany(() => Inventory, (inv) => inv.product, { cascade: true })
  inventory!: Inventory[];

  @OneToMany(() => Review, (r) => r.product)
  reviews!: Review[];

  @OneToMany(() => CartItem, (ci) => ci.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (oi) => oi.product)
  orderItems!: OrderItem[];
}
