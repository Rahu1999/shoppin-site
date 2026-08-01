import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('module_settings')
export class ModuleSetting extends BaseEntity {
  @Column({ name: 'module_key', unique: true, length: 50 })
  moduleKey!: string;

  @Column({ length: 100 })
  label!: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled!: boolean;
}
