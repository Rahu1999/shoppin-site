import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CouponUsage } from './coupon-usage.entity';

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ length: 50, unique: true })
  code!: string;

  @Column({ type: 'enum', enum: CouponType })
  type!: CouponType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value!: number;

  @Column({ name: 'min_order_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minOrderValue?: number;

  @Column({ name: 'max_discount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxDiscount?: number;

  @Column({ name: 'uses_count', type: 'int', default: 0 })
  usesCount!: number;

  @Column({ name: 'uses_limit', type: 'int', nullable: true })
  usesLimit?: number;

  @Column({ name: 'per_user_limit', type: 'int', default: 1 })
  perUserLimit!: number;

  @Column({ name: 'starts_at', type: 'datetime', nullable: true })
  startsAt?: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => CouponUsage, (cu) => cu.coupon)
  usages!: CouponUsage[];

  get isValid(): boolean {
    if (!this.isActive) return false;
    const now = new Date();
    if (this.startsAt && now < this.startsAt) return false;
    if (this.expiresAt && now > this.expiresAt) return false;
    if (this.usesLimit !== null && this.usesLimit !== undefined && this.usesCount >= this.usesLimit) return false;
    return true;
  }
}
