import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
import { CartItem } from './cart-item.entity';
import { OrderItem } from './order-item.entity';
import { Inventory } from './inventory.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ unique: true, length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ name: 'compare_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  comparePrice?: number;

  @Column({ type: 'json', nullable: true })
  attributes?: Record<string, string>;  // e.g. { color: "red", size: "XL" }

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => CartItem, (ci) => ci.variant)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (oi) => oi.variant)
  orderItems!: OrderItem[];

  @OneToMany(() => Inventory, (inv) => inv.variant)
  inventory!: Inventory[];
}
