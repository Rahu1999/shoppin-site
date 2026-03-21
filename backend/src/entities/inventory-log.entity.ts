import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Inventory } from './inventory.entity';

export enum InventoryChangeReason {
  PURCHASE = 'purchase',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  DAMAGE = 'damage',
  RESERVATION = 'reservation',
  RESERVATION_RELEASE = 'reservation_release',
}

@Entity('inventory_logs')
export class InventoryLog {
  @Column({ primary: true, generated: 'uuid' })
  id!: string;

  @Column({ name: 'inventory_id' })
  inventoryId!: string;

  @Column({ name: 'change_qty', type: 'int' })
  changeQty!: number;

  @Column({ name: 'quantity_before', type: 'int' })
  quantityBefore!: number;

  @Column({ name: 'quantity_after', type: 'int' })
  quantityAfter!: number;

  @Column({ type: 'enum', enum: InventoryChangeReason })
  reason!: InventoryChangeReason;

  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => Inventory, (inv) => inv.logs)
  @JoinColumn({ name: 'inventory_id' })
  inventory!: Inventory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
