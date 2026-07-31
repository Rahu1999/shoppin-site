import { z } from 'zod';
import { BlogPostStatus } from '@entities/blog-post-status.enum';

export const createBlogPostSchema = z.object({
  title: z.string().min(2).max(300),
  slug: z.string().min(2).max(350),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Post content cannot be empty'),
  coverImageUrl: z.string().url().optional(),
  authorName: z.string().max(150).optional(),
  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(255).optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const getBlogQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  tag: z.string().optional(),
});

export const getBlogAdminQuerySchema = getBlogQuerySchema.extend({
  status: z.nativeEnum(BlogPostStatus).optional(),
  search: z.string().optional(),
});
