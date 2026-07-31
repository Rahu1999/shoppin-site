import { AppDataSource } from '@config/database';
import { BlogPost } from '@entities/blog-post.entity';
import { BlogPostStatus } from '@entities/blog-post-status.enum';
import { AppError } from '@utils/AppError';
import { sanitizeHtml } from '@utils/sanitizeHtml';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';

const LIST_COLUMNS = [
  'post.id', 'post.createdAt', 'post.updatedAt',
  'post.title', 'post.slug', 'post.excerpt', 'post.coverImageUrl',
  'post.authorName', 'post.status', 'post.publishedAt', 'post.tags',
];

export class BlogService {
  private blogRepo = AppDataSource.getRepository(BlogPost);

  public async getPublishedPosts(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const queryBuilder = this.blogRepo.createQueryBuilder('post')
      .select(LIST_COLUMNS)
      .where('post.status = :status', { status: BlogPostStatus.PUBLISHED })
      .orderBy('post.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.tag) {
      queryBuilder.andWhere('JSON_CONTAINS(post.tags, :tag)', { tag: JSON.stringify(query.tag) });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async getPublishedPostBySlug(slug: string) {
    const post = await this.blogRepo.findOne({
      where: { slug, status: BlogPostStatus.PUBLISHED },
    });
    if (!post) throw AppError.notFound('Blog post');
    return post;
  }

  public async getAllPostsAdmin(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const queryBuilder = this.blogRepo.createQueryBuilder('post')
      .select(LIST_COLUMNS)
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status) {
      queryBuilder.andWhere('post.status = :status', { status: query.status });
    }
    if (query.search) {
      queryBuilder.andWhere('post.title LIKE :search', { search: `%${query.search}%` });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  public async getPostByIdAdmin(id: string) {
    const post = await this.blogRepo.findOneBy({ id });
    if (!post) throw AppError.notFound('Blog post');
    return post;
  }

  public async createPost(data: Record<string, any>) {
    const existing = await this.blogRepo.findOneBy({ slug: data.slug });
    if (existing) throw AppError.conflict('Slug already exists');

    const payload: Record<string, any> = {
      ...data,
      content: sanitizeHtml(data.content),
    };
    if (payload.status === BlogPostStatus.PUBLISHED) {
      payload.publishedAt = new Date();
    }

    const post = this.blogRepo.create(payload);
    return this.blogRepo.save(post);
  }

  public async updatePost(id: string, data: Record<string, any>) {
    const existing = await this.blogRepo.findOneBy({ id });
    if (!existing) throw AppError.notFound('Blog post');

    const payload: Record<string, any> = { ...data };
    if (typeof payload.content === 'string') {
      payload.content = sanitizeHtml(payload.content);
    }
    if (payload.status === BlogPostStatus.PUBLISHED && !existing.publishedAt) {
      payload.publishedAt = new Date();
    }

    await this.blogRepo.update(id, payload);
    return this.blogRepo.findOneBy({ id });
  }

  public async deletePost(id: string) {
    const result = await this.blogRepo.softDelete(id);
    if (result.affected === 0) throw AppError.notFound('Blog post');
  }
}
