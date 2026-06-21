import crypto from 'crypto';
import Razorpay from 'razorpay';
import { AppDataSource } from '@config/database';
import { Payment } from '@entities/payment.entity';
import { PaymentTransaction } from '@entities/payment-transaction.entity';
import { Order } from '@entities/order.entity';
import { Cart } from '@entities/cart.entity';
import { User } from '@entities/user.entity';
import { AppError } from '@utils/AppError';
import { OrderStatus } from '@entities/order-status.enum';
import { PaymentStatus } from '@entities/payment-status.enum';
import { TransactionType } from '@entities/transaction-type.enum';
import { sendMail } from '@utils/emailService';
import { orderConfirmationEmail } from '@utils/emailTemplates';
import { EmailJobs } from '../../jobs/email.jobs';

export class PaymentsService {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private transactionRepo = AppDataSource.getRepository(PaymentTransaction);
  private orderRepo = AppDataSource.getRepository(Order);
  private cartRepo = AppDataSource.getRepository(Cart);
  private userRepo = AppDataSource.getRepository(User);

  private getRazorpayInstance(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new AppError('Razorpay credentials are not configured on the server', 500, 'RAZORPAY_CONFIG_ERROR');
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  // ── COD / legacy mock ──────────────────────────────────────────────────────
  public async processOrderPayment(orderId: string, userId: string, data: Record<string, any>) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId } });
    if (!order) throw AppError.notFound('Order');
    if (order.status !== OrderStatus.PENDING) {
      throw AppError.badRequest('Order is not in a pending state for payment');
    }

    if (Math.abs(data.amount - Number(order.total)) > 0.01) {
      throw AppError.badRequest('Payment amount does not match order total');
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (data.paymentMethod === 'COD') {
      const payment = this.paymentRepo.create({
        orderId,
        amount: data.amount,
        currency: data.currency || 'INR',
        provider: 'cod',
        status: PaymentStatus.PENDING,
        transactions: [{
          type: TransactionType.CAPTURE,
          amount: data.amount,
          providerReference: `cod_${transactionId}`,
          status: PaymentStatus.PENDING,
          metadata: { source: 'cod_checkout' },
        }],
      });
      await this.paymentRepo.save(payment);
      order.status = OrderStatus.PROCESSING;
      await this.orderRepo.save(order);
      return payment;
    }

    // Legacy mock — kept for backward compat; should not be reached in production
    const payment = this.paymentRepo.create({
      orderId,
      amount: data.amount,
      currency: data.currency,
      provider: 'MockGateway',
      providerOrderId: `mock_req_${transactionId}`,
      status: PaymentStatus.COMPLETED,
      transactions: [{
        type: TransactionType.CAPTURE,
        amount: data.amount,
        providerReference: transactionId,
        status: PaymentStatus.COMPLETED,
        metadata: { source: 'mock_gateway' },
      }],
    });
    await this.paymentRepo.save(payment);
    order.status = OrderStatus.PROCESSING;
    await this.orderRepo.save(order);
    return payment;
  }

  // ── Razorpay: Step 1 — create order ───────────────────────────────────────
  public async createRazorpayOrder(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId } });
    if (!order) throw AppError.notFound('Order');
    if (order.status !== OrderStatus.PENDING) {
      throw AppError.badRequest('Order is not in a pending state');
    }

    const razorpay = this.getRazorpayInstance();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100), // convert to paise (integer)
      currency: 'INR',
      receipt: order.id, // UUID is 36 chars, within Razorpay's 40-char limit
    });

    // Upsert: if a previous attempt left a pending Razorpay payment, reuse the
    // record and update its providerOrderId so there's never more than one
    let payment = await this.paymentRepo.findOne({
      where: { orderId, provider: 'razorpay', status: PaymentStatus.PENDING },
    });

    if (payment) {
      payment.providerOrderId = rzpOrder.id;
      await this.paymentRepo.save(payment);
    } else {
      payment = this.paymentRepo.create({
        orderId,
        amount: Number(order.total),
        currency: 'INR',
        provider: 'razorpay',
        status: PaymentStatus.PENDING,
        providerOrderId: rzpOrder.id,
      });
      await this.paymentRepo.save(payment);
    }

    return {
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,   // already in paise
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID!,
    };
  }

  // ── Razorpay: Step 2 — verify payment ─────────────────────────────────────
  public async verifyRazorpayPayment(
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      orderId: string;
    },
    userId: string,
  ) {
    const order = await this.orderRepo.findOne({ where: { id: data.orderId, userId } });
    if (!order) throw AppError.notFound('Order');

    // HMAC-SHA256 verification — critical security check
    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== data.razorpay_signature) {
      throw AppError.badRequest('Payment verification failed: signature mismatch');
    }

    const payment = await this.paymentRepo.findOne({
      where: {
        orderId: data.orderId,
        provider: 'razorpay',
        providerOrderId: data.razorpay_order_id,
      },
    });
    if (!payment) throw AppError.notFound('Payment record');

    // Mark payment complete and record the transaction
    payment.status = PaymentStatus.COMPLETED;
    await this.paymentRepo.save(payment);

    await this.transactionRepo.save(
      this.transactionRepo.create({
        paymentId: payment.id,
        type: TransactionType.CAPTURE,
        amount: payment.amount,
        providerReference: data.razorpay_payment_id,
        status: PaymentStatus.COMPLETED,
        metadata: {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        },
      }),
    );

    order.status = OrderStatus.PROCESSING;
    await this.orderRepo.save(order);

    // Clear the user's cart now that payment is confirmed
    await this.cartRepo.delete({ userId });

    // Send order confirmation email now that payment is verified (fire and forget)
    const fullOrder = await this.orderRepo.findOne({ where: { id: data.orderId }, relations: ['items'] });
    const user = await this.userRepo.findOneBy({ id: userId });
    if (fullOrder && user) {
      const tpl = orderConfirmationEmail({
        firstName: user.firstName,
        orderId: fullOrder.id,
        items: (fullOrder.items || []).map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        subtotal: Number(fullOrder.subtotal),
        shippingFee: Number(fullOrder.shippingFee),
        shippingMethodName: fullOrder.shippingMethodName,
        tax: Number(fullOrder.tax),
        taxRate: Number(fullOrder.taxRate),
        total: Number(fullOrder.total),
        shippingAddress: fullOrder.shippingAddress as Record<string, string>,
        paymentMethod: 'Razorpay',
      });
      sendMail({ to: user.email, subject: tpl.subject, html: tpl.html });

      EmailJobs.sendAdminNewOrderNotification({
        orderId: fullOrder.id,
        customerName: `${user.firstName} ${user.lastName || ''}`.trim(),
        customerEmail: user.email,
        items: (fullOrder.items || []).map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
        })),
        subtotal: Number(fullOrder.subtotal),
        shippingFee: Number(fullOrder.shippingFee),
        shippingMethodName: fullOrder.shippingMethodName,
        tax: Number(fullOrder.tax),
        taxRate: Number(fullOrder.taxRate),
        discount: Number(fullOrder.discount),
        total: Number(fullOrder.total),
        shippingAddress: fullOrder.shippingAddress as Record<string, string>,
        paymentMethod: 'Razorpay',
      }).catch(() => {});
    }

    return payment;
  }

  // ── Get payments for an order ──────────────────────────────────────────────
  public async getOrderPayments(orderId: string, userId: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId, userId });
    if (!order) throw AppError.notFound('Order');
    return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }
}
