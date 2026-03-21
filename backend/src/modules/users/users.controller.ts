import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { successResponse, createdResponse } from '@utils/apiResponse';

export class UsersController {
  private usersService = new UsersService();

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.getProfile(req.user!.sub);
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  };

  public updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.updateProfile(req.user!.sub, req.body);
      return successResponse(res, user, 'Profile updated');
    } catch (error) {
      next(error);
    }
  };

  public getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addresses = await this.usersService.getAddresses(req.user!.sub);
      return successResponse(res, addresses);
    } catch (error) {
      next(error);
    }
  };

  public addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await this.usersService.addAddress(req.user!.sub, req.body);
      return createdResponse(res, address, 'Address added');
    } catch (error) {
      next(error);
    }
  };

  public updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await this.usersService.updateAddress(
        req.user!.sub,
        req.params.id as string,
        req.body
      );
      return successResponse(res, address, 'Address updated');
    } catch (error) {
      next(error);
    }
  };

  public removeAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.usersService.removeAddress(req.user!.sub, req.params.id as string);
      return successResponse(res, null, 'Address removed');
    } catch (error) {
      next(error);
    }
  };

  // Admin Methods
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items, meta } = await this.usersService.getAllUsers(req.query);
      return successResponse(res, { items, meta }, 'Users fetched');
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.usersService.updateByAdmin(req.params.id as string, req.body);
      return successResponse(res, user, 'User updated');
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.usersService.deleteByAdmin(req.params.id as string);
      return successResponse(res, null, 'User deleted');
    } catch (error) {
      next(error);
    }
  };
}
