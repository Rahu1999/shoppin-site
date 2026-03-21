import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Wishlist } from './wishlist.entity';
import { Product } from './product.entity';

@Entity('wishlist_items')
export class WishlistItem extends BaseEntity {
  @Column({ name: 'wishlist_id' })
  wishlistId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @ManyToOne(() => Wishlist, (w) => w.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist!: Wishlist;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
