import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

@Entity('addresses')
export class Address extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.SHIPPING })
  type!: AddressType;

  @Column({ name: 'full_name', length: 150 })
  fullName!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 255 })
  line1!: string;

  @Column({ length: 255, nullable: true })
  line2?: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ length: 100 })
  state!: string;

  @Column({ length: 100 })
  country!: string;

  @Column({ name: 'postal_code', length: 20 })
  postalCode!: string;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @ManyToOne(() => User, (u) => u.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
