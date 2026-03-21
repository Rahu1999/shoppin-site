import { AppDataSource } from './src/config/database';
import { Product } from './src/entities/product.entity';

async function verifyImages() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const productRepo = AppDataSource.getRepository(Product);
    const latestProducts = await productRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['images']
    });

    console.log('--- Latest 5 Products and their images ---');
    latestProducts.forEach(p => {
      console.log(`Product: ${p.name} (ID: ${p.id})`);
      console.log(`Images (${p.images?.length || 0}):`, p.images?.map(img => img.url));
      console.log('-----------------------------------------');
    });

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

verifyImages();
