import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from './reviews.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class ReviewsController {
  private reviewsService = new ReviewsService();

  public getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.reviewsService.getProductReviews(req.params.productId as string, req.query);
      return successResponse(res, { items, meta }, 'Reviews fetched');
    } catch (error) {
      next(error);
    }
  };

  public getReviewEligibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eligibility = await this.reviewsService.getReviewEligibility(req.user!.sub, req.params.productId as string);
      return successResponse(res, eligibility, 'Review eligibility fetched');
    } catch (error) {
      next(error);
    }
  };

  public getMyReviewedProductIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productIds = await this.reviewsService.getMyReviewedProductIds(req.user!.sub);
      return successResponse(res, { productIds }, 'Reviewed product ids fetched');
    } catch (error) {
      next(error);
    }
  };

  public createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await this.reviewsService.createReview(req.user!.sub, req.body);
      return createdResponse(res, review, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.reviewsService.deleteReview(req.params.id as string);
      return successResponse(res, null, 'Review deleted');
    } catch (error) {
      next(error);
    }
  };

  public getPendingReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.reviewsService.getPendingReviews(req.query);
      return successResponse(res, { items, meta }, 'Pending reviews fetched');
    } catch (error) {
      next(error);
    }
  };

  public approveReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await this.reviewsService.approveReview(req.params.id as string);
      return successResponse(res, review, 'Review approved');
    } catch (error) {
      next(error);
    }
  };
}
