import { AppDataSource } from '../config/database';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ShippingMethod } from '../entities/shipping-method.entity';
import { ShippingRate } from '../entities/shipping-rate.entity';
// @ts-ignore
import * as bcrypt from 'bcryptjs';

export async function seedDatabase() {
  await AppDataSource.initialize();
  console.log('Database connected for seeding...');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Seed Categories
    const categoryRepository = queryRunner.manager.getRepository(Category);
    let electronics = await categoryRepository.findOneBy({ slug: 'electronics' });
    if (!electronics) {
      electronics = categoryRepository.create({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        isActive: true,
      });
      await categoryRepository.save(electronics);
    }

    let clothing = await categoryRepository.findOneBy({ slug: 'clothing' });
    if (!clothing) {
      clothing = categoryRepository.create({
        name: 'Clothing',
        slug: 'clothing',
        description: 'Apparel for men and women',
        isActive: true,
      });
      await categoryRepository.save(clothing);
    }

    // 2. Seed Roles
    const roleRepo = queryRunner.manager.getRepository(Role);
    let adminRole = await roleRepo.findOneBy({ name: 'admin' });
    if (!adminRole) {
      adminRole = roleRepo.create({ name: 'admin', description: 'Administrator' });
      await roleRepo.save(adminRole);
    }

    // 3. Seed Admin User
    const userRepository = queryRunner.manager.getRepository(User);
    let admin = await userRepository.findOneBy({ email: 'admin@modernshop.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      admin = userRepository.create({
        email: 'admin@modernshop.com',
        passwordHash: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        isVerified: true,
      });
      await userRepository.save(admin);

      // assign admin role
      const userRoleRepo = queryRunner.manager.getRepository(UserRole);
      await userRoleRepo.save(userRoleRepo.create({
        userId: admin.id,
        roleId: adminRole.id
      }));
    }

    // 4. Seed Products
    const productRepository = queryRunner.manager.getRepository(Product);
    const prod1 = await productRepository.findOneBy({ sku: 'PROD-ELEC-1' });
    if (!prod1) {
      const product = productRepository.create({
        sku: 'PROD-ELEC-1',
        name: 'Wireless Noise-Canceling Headphones',
        slug: 'wireless-noise-canceling-headphones',
        description: 'Premium wireless headphones with active noise cancellation.',
        basePrice: 299.99,
        category: electronics,
        isActive: true,
      });
      await productRepository.save(product);
    }

    // 5. Seed Shipping Methods
    const shippingMethodRepo = queryRunner.manager.getRepository(ShippingMethod);
    let stdShipping = await shippingMethodRepo.findOneBy({ name: 'Standard Shipping' });
    if (!stdShipping) {
      stdShipping = shippingMethodRepo.create({
        name: 'Standard Shipping',
        description: 'Delivery in 5-7 business days',
        isActive: true,
        estimatedDaysMin: 5,
        estimatedDaysMax: 7
      });
      await shippingMethodRepo.save(stdShipping);

      const rateRepo = queryRunner.manager.getRepository(ShippingRate);
      await rateRepo.save(rateRepo.create({
        method: stdShipping,
        minOrderValue: 0,
        rate: 5.99
      }));
       await rateRepo.save(rateRepo.create({
        method: stdShipping,
        minOrderValue: 50,
        rate: 0 // free shipping over $50
      }));
    }

    await queryRunner.commitTransaction();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

// Ensure this script can be run directly via node
if (require.main === module) {
  seedDatabase().catch(console.error);
}
