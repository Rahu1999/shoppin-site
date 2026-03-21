import { Entity, Column, OneToMany, ManyToMany, JoinTable, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from './user-role.entity';
import { Address } from './address.entity';
import { Order } from './order.entity';
import { Cart } from './cart.entity';
import { Review } from './review.entity';
import { Wishlist } from './wishlist.entity';
import { AuditLog } from './audit-log.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({ name: 'refresh_token', nullable: true, select: false })
  refreshToken?: string;

  @Column({ name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true, type: 'datetime', select: false })
  passwordResetExpires?: Date;

  @Column({ name: 'last_login_at', nullable: true, type: 'datetime' })
  lastLoginAt?: Date;

  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  userRoles!: UserRole[];

  @OneToMany(() => Address, (a) => a.user)
  addresses!: Address[];

  @OneToMany(() => Order, (o) => o.user)
  orders!: Order[];

  @OneToMany(() => Review, (r) => r.user)
  reviews!: Review[];

  @OneToMany(() => AuditLog, (al) => al.user)
  auditLogs!: AuditLog[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
