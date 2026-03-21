import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ length: 100 })
  resource!: string;

  @Column({ length: 50 })
  action!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions!: RolePermission[];
}
