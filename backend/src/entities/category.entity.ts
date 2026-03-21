import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ length: 150 })
  name!: string;

  @Column({ unique: true, length: 200 })
  slug!: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, (c) => c.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (c) => c.parent)
  children!: Category[];

  @OneToMany(() => Product, (p) => p.category)
  products!: Product[];
}
