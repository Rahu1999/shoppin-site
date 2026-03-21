import { Router } from 'express';
import authRoutes from '@modules/auth/auth.routes';
import userRoutes from '@modules/users/users.routes';
import uploadRoutes from '@modules/upload/upload.routes';
import productRoutes from '@modules/products/products.routes';
import cartRoutes from '@modules/carts/carts.routes';
import orderRoutes from '@modules/orders/orders.routes';
import categoryRoutes from '@modules/categories/categories.routes';
import reviewRoutes from '@modules/reviews/reviews.routes';
import inventoryRoutes from '@modules/inventory/inventory.routes';
import paymentRoutes from '@modules/payments/payments.routes';
import wishlistRoutes from '@modules/wishlists/wishlists.routes';
import couponRoutes from '@modules/coupons/coupons.routes';
import shippingRoutes from '@modules/shipping/shipping.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/carts', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlists', wishlistRoutes);
router.use('/coupons', couponRoutes);
router.use('/shipping', shippingRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', timestamp: new Date() });
});

export default router;
