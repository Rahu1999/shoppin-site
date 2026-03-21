import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reviews')
@Index(['productId', 'isApproved'])
export class Review extends BaseEntity {
  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'int' })
  rating!: number; // 1 to 5

  @Column({ length: 200, nullable: true })
  title?: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'is_verified_purchase', default: false })
  isVerifiedPurchase!: boolean;

  @Column({ name: 'is_approved', default: false })
  isApproved!: boolean;

  @ManyToOne(() => Product, (p) => p.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => User, (u) => u.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
