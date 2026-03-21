import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { InventoryLog } from './inventory-log.entity';

@Entity('inventory')
export class Inventory extends BaseEntity {
  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'int', default: 0 })
  reserved!: number;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 5 })
  lowStockThreshold!: number;

  @ManyToOne(() => Product, (p) => p.inventory)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductVariant, (v) => v.inventory, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariant;

  @OneToMany(() => InventoryLog, (log) => log.inventory)
  logs!: InventoryLog[];

  get available(): number {
    return Math.max(0, this.quantity - this.reserved);
  }
}
