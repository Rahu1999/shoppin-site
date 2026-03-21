import { AppDataSource } from '@config/database';
import { User } from '@entities/user.entity';
import { Address } from '@entities/address.entity';
import { AppError } from '@utils/AppError';
import { getPaginationParams, buildPaginationMeta } from '@utils/pagination';
import { Like } from 'typeorm';

export class UsersService {
  private userRepo = AppDataSource.getRepository(User);
  private addressRepo = AppDataSource.getRepository(Address);

  public async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) throw AppError.notFound('User');
    const { passwordHash, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  public async updateProfile(userId: string, dto: Record<string, any>) {
    await this.userRepo.update(userId, dto);
    return this.getProfile(userId);
  }

  public async getAddresses(userId: string) {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  public async addAddress(userId: string, dto: Record<string, any>) {
    // If this is set to default, unset others of same type
    if (dto.isDefault) {
      await this.addressRepo.update(
        { userId, type: dto.type || 'shipping' },
        { isDefault: false }
      );
    }
    const address = this.addressRepo.create({ ...dto, userId });
    return this.addressRepo.save(address);
  }

  public async updateAddress(userId: string, addressId: string, dto: Record<string, any>) {
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
    if (!address) throw AppError.notFound('Address');

    if (dto.isDefault) {
      await this.addressRepo.update(
        { userId, type: dto.type || address.type },
        { isDefault: false }
      );
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  public async removeAddress(userId: string, addressId: string) {
    const result = await this.addressRepo.delete({ id: addressId, userId });
    if (result.affected === 0) throw AppError.notFound('Address');
  }

  // Admin Methods
  public async getAllUsers(query: Record<string, any>) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);
    
    const where: any = {};
    if (query.search) {
      where.email = Like(`%${query.search}%`);
      // Could also add firstName/lastName search with OR if needed
    }

    const [items, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'DESC' },
    });

    const safeItems = items.map((user: User) => {
      const { passwordHash, refreshToken, ...safeUser } = user;
      return {
        ...safeUser,
        roles: user.userRoles?.map((ur: any) => ur.role.name) || []
      };
    });

    return { items: safeItems, meta: buildPaginationMeta(page, limit, total) };
  }

  public async updateByAdmin(userId: string, data: Record<string, any>) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw AppError.notFound('User');

    // Handle status update
    if (data.status) {
      user.status = data.status;
    }
    
    // In a real app, role management would be more complex (updating UserRole junction table)
    // For now, we'll assume the prompt wants basic profile/status updates.
    // If role update is needed, we would need to delete existing UserRoles and add new ones.

    await this.userRepo.save(user);
    return this.getProfile(userId);
  }

  public async deleteByAdmin(userId: string) {
    const result = await this.userRepo.softDelete(userId);
    if (result.affected === 0) throw AppError.notFound('User');
  }
}
