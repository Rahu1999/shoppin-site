import { Entity, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  EXPORT = 'EXPORT',
}

@Entity('audit_logs')
@Index(['entityName', 'entityId'])
@Index(['userId', 'createdAt'])
export class AuditLog {
  @Column({ primary: true, generated: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ name: 'entity_name', length: 150 })
  entityName!: string;

  @Column({ name: 'entity_id', length: 36, nullable: true })
  entityId?: string;

  @Column({ type: 'json', nullable: true })
  changes?: Record<string, unknown>; // Stores before/after payload

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (u) => u.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
