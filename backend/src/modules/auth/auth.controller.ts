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

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.forgotPassword(req.body.email);
      // Always return 200 — never reveal whether the email exists
      return successResponse(res, null, 'If an account with that email exists, a reset link has been sent.');
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      const result = await this.authService.resetPassword(token, newPassword);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };
}
