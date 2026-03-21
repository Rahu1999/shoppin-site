import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class AuthController {
  private authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.authService.register(req.body);
      return createdResponse(res, data, 'Registration successful');
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.authService.login(req.body);
      return successResponse(res, data, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refresh(refreshToken);
      return successResponse(res, tokens, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user) await this.authService.logout(req.user.sub);
      return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };
}
