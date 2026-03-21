import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @Column({ primary: true, name: 'role_id' })
  roleId!: string;

  @Column({ primary: true, name: 'permission_id' })
  permissionId!: string;

  @ManyToOne(() => Role, (r) => r.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(() => Permission, (p) => p.rolePermissions)
  @JoinColumn({ name: 'permission_id' })
  permission!: Permission;
}
