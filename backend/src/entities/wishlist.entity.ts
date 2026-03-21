import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { WishlistItem } from './wishlist-item.entity';

@Entity('wishlists')
@Index(['userId'], { unique: true })
export class Wishlist extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => WishlistItem, (item) => item.wishlist, { cascade: true })
  items!: WishlistItem[];
}
