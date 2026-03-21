import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'session_id', nullable: true })
  sessionId?: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true })
  items!: CartItem[];
}
