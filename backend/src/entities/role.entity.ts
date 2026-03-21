import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true, length: 50 })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => UserRole, (ur) => ur.role)
  userRoles!: UserRole[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions!: RolePermission[];
}
