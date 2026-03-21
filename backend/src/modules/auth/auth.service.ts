import { AppDataSource } from '@config/database';
import { User } from '@entities/user.entity';
import { Role } from '@entities/role.entity';
import { UserRole } from '@entities/user-role.entity';
import { AppError } from '@utils/AppError';
import { hashPassword, comparePassword } from '@utils/bcrypt';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@utils/jwt';
import { logAuth } from '@config/logger';

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);
  private roleRepo = AppDataSource.getRepository(Role);
  private userRoleRepo = AppDataSource.getRepository(UserRole);

  public async register(dto: Record<string, any>) {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw AppError.conflict('Email already in use');

    const hashedPassword = await hashPassword(dto.password);
    
    // Default role 'customer'
    let customerRole = await this.roleRepo.findOneBy({ name: 'customer' });
    if (!customerRole) {
      customerRole = this.roleRepo.create({ name: 'customer', description: 'Standard user' });
      await this.roleRepo.save(customerRole);
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: hashedPassword,
      });
      await queryRunner.manager.save(user);

      const userRole = queryRunner.manager.create(UserRole, {
        userId: user.id,
        roleId: customerRole.id,
      });
      await queryRunner.manager.save(userRole);

      await queryRunner.commitTransaction();
      
      logAuth('REGISTER_SUCCESS', user.id, { email: user.email });
      
      const tokens = await this.generateTokens(user.id, ['customer'], user.email);
      return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, ...tokens };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async login(dto: Record<string, any>) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'status'],
    });

    if (!user || !(await comparePassword(dto.password, user.passwordHash))) {
      logAuth('LOGIN_FAILED', undefined, { email: dto.email });
      throw AppError.unauthorized('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw AppError.forbidden(`User account is ${user.status}`);
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) || ['customer'];
    const tokens = await this.generateTokens(user.id, roles, user.email);

    user.lastLoginAt = new Date();
    user.refreshToken = tokens.refreshToken; // save active session
    await this.userRepo.save(user);

    logAuth('LOGIN_SUCCESS', user.id);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, roles },
      ...tokens,
    };
  }

  public async refresh(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['userRoles', 'userRoles.role'],
        select: ['id', 'email', 'refreshToken', 'status'],
      });

      if (!user || user.refreshToken !== token) {
        throw AppError.unauthorized('Invalid refresh token');
      }

      if (user.status !== 'active') throw AppError.forbidden('Account inactive');

      const roles = user.userRoles?.map((ur) => ur.role.name) || ['customer'];
      const tokens = await this.generateTokens(user.id, roles, user.email);

      user.refreshToken = tokens.refreshToken;
      await this.userRepo.save(user);

      logAuth('REFRESH_SUCCESS', user.id);
      return tokens;
    } catch (err) {
      throw AppError.unauthorized('Token expired or invalid');
    }
  }

  public async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: undefined });
    logAuth('LOGOUT', userId);
  }

  private async generateTokens(userId: string, roles: string[], email: string) {
    return {
      accessToken: signAccessToken({ sub: userId, roles, email }),
      refreshToken: signRefreshToken(userId),
    };
  }
}
