import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogPostStatus } from './blog-post-status.enum';

@Entity('blog_posts')
@Index(['status'])
@Index(['publishedAt'])
export class BlogPost extends BaseEntity {
  @Column({ length: 300 })
  title!: string;

  @Column({ unique: true, length: 350 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'longtext' })
  content!: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ name: 'author_name', nullable: true, length: 150 })
  authorName?: string;

  @Column({ type: 'enum', enum: BlogPostStatus, default: BlogPostStatus.DRAFT })
  status!: BlogPostStatus;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt?: Date;

  @Column({ name: 'meta_title', nullable: true, length: 255 })
  metaTitle?: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription?: string;

  @Column({ type: 'json', nullable: true })
  tags?: string[];
}
