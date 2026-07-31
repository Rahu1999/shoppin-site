import { Request, Response, NextFunction } from 'express';
import { BlogService } from './blog.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class BlogController {
  private blogService = new BlogService();

  public getPublished = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.blogService.getPublishedPosts(req.query);
      return successResponse(res, { items, meta }, 'Blog posts fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  public getPublishedOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await this.blogService.getPublishedPostBySlug(req.params.slug as string);
      return successResponse(res, post);
    } catch (error) {
      next(error);
    }
  };

  public getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.blogService.getAllPostsAdmin(req.query);
      return successResponse(res, { items, meta }, 'Blog posts fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  public getOneAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await this.blogService.getPostByIdAdmin(req.params.id as string);
      return successResponse(res, post);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await this.blogService.createPost(req.body);
      return createdResponse(res, post, 'Blog post created successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await this.blogService.updatePost(req.params.id as string, req.body);
      return successResponse(res, post, 'Blog post updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.blogService.deletePost(req.params.id as string);
      return successResponse(res, null, 'Blog post deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
