import {
  Entity, Column, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { CatalogueItem } from './catalogue-item.entity';
import { EnquiryStatus } from './enquiry-status.enum';

@Entity('catalogue_enquiries')
@Index(['status'])
@Index(['catalogueItemId'])
export class CatalogueEnquiry extends BaseEntity {
  @Column({ name: 'catalogue_item_id', nullable: true })
  catalogueItemId?: string;

  @ManyToOne(() => CatalogueItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'catalogue_item_id' })
  catalogueItem?: CatalogueItem;

  @Column({ name: 'item_name_snapshot', length: 300 })
  itemNameSnapshot!: string;

  @Column({ name: 'customer_name', length: 150 })
  customerName!: string;

  @Column({ name: 'customer_phone', length: 20 })
  customerPhone!: string;

  @Column({ name: 'customer_email', length: 255, nullable: true })
  customerEmail?: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: EnquiryStatus, default: EnquiryStatus.NEW })
  status!: EnquiryStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ length: 30, default: 'catalogue' })
  source!: string;
}
