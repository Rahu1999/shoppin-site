import { AppDataSource } from '@config/database';
import { logger } from '@config/logger';
import { Payment } from '@entities/payment.entity';
import { PaymentTransaction } from '@entities/payment-transaction.entity';
import { Order } from '@entities/order.entity';
import { Cart } from '@entities/cart.entity';
import { User } from '@entities/user.entity';
import { PartialPaymentConfig } from '@entities/partial-payment-config.entity';
import { AppError } from '@utils/AppError';
import { OrderStatus } from '@entities/order-status.enum';
import { PaymentStatus } from '@entities/payment-status.enum';
import { TransactionType } from '@entities/transaction-type.enum';
import { sendMail } from '@utils/emailService';
import { orderConfirmationEmail, partialPaymentDepositEmail } from '@utils/emailTemplates';
import { EmailJobs } from '../../jobs/email.jobs';
import { OrderStatusHistory } from '@entities/order-status-history.entity';
import { getGatewayProvider } from '../../providers/payment';
import { GatewayProvidersService } from '../gateway-providers/gateway-providers.service';

export class PaymentsService {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private transactionRepo = AppDataSource.getRepository(PaymentTransaction);
  private orderRepo = AppDataSource.getRepository(Order);
  private cartRepo = AppDataSource.getRepository(Cart);
  private userRepo = AppDataSource.getRepository(User);
  private orderHistoryRepo = AppDataSource.getRepository(OrderStatusHistory);
  private ppConfigRepo = AppDataSource.getRepository(PartialPaymentConfig);
  private gatewayProviderService = new GatewayProvidersService();

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

    // Legacy mock — kept for backward compat
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

  // ── Generic: create order via best available gateway ──────────────────────
  public async createOrder(orderId: string, userId: string, explicitGatewaySlug?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId } });
    if (!order) throw AppError.notFound('Order');
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PARTIALLY_PAID) {
      throw AppError.badRequest('Order is not in a payable state');
    }

    // Determine the charge amount for this payment step
    let chargeAmount: number;
    if (order.isPartialPayment && order.status === OrderStatus.PENDING) {
      chargeAmount = Number(order.depositAmount);
    } else if (order.isPartialPayment && order.status === OrderStatus.PARTIALLY_PAID) {
      chargeAmount = Math.round((Number(order.total) - Number(order.amountPaid)) * 100) / 100;
    } else {
      chargeAmount = Number(order.total);
    }

    if (!chargeAmount || chargeAmount <= 0 || isNaN(chargeAmount)) {
      throw AppError.badRequest('Payment amount is invalid. Please contact support.');
    }

    let gwResult;

    if (explicitGatewaySlug) {
      // Explicit gateway — no fallback
      const provider = getGatewayProvider(explicitGatewaySlug);
      if (!provider.isCredentialsConfigured()) {
        throw new AppError(`${explicitGatewaySlug} credentials are not configured on the server`, 503, 'GATEWAY_UNAVAILABLE');
      }
      gwResult = await provider.createOrder(orderId, chargeAmount);
    } else {
      // Auto-resolve with fallback cascade
      let preferredSlug: string | undefined;
      if (order.isPartialPayment) {
        const ppConfig = await this.ppConfigRepo.findOneBy({ isActive: true });
        if (ppConfig?.preferredGateway) preferredSlug = ppConfig.preferredGateway;
      }

      const enabledProviders = await this.gatewayProviderService.getEnabledByPriority();

      // Put preferred gateway first, then rest in priority order
      const ordered = preferredSlug
        ? [
            ...enabledProviders.filter(p => p.slug === preferredSlug),
            ...enabledProviders.filter(p => p.slug !== preferredSlug),
          ]
        : enabledProviders;

      let lastError: Error | null = null;
      for (const gp of ordered) {
        let provider;
        try { provider = getGatewayProvider(gp.slug); } catch { continue; }
        if (!provider.isCredentialsConfigured()) continue;
        try {
          gwResult = await provider.createOrder(orderId, chargeAmount);
          break;
        } catch (err: any) {
          lastError = err;
          logger.warn(`Gateway ${gp.slug} failed: ${err.message}. Trying next...`);
        }
      }
      if (!gwResult) {
        throw lastError ?? new AppError('No payment gateway available', 503, 'GATEWAY_UNAVAILABLE');
      }
    }

    // Upsert: reuse any pending payment record for this gateway, otherwise create new
    let payment = await this.paymentRepo.findOne({
      where: { orderId, provider: gwResult.gatewaySlug, status: PaymentStatus.PENDING },
    });
    if (payment) {
      payment.providerOrderId = gwResult.gatewayOrderId;
      payment.amount = chargeAmount;
      await this.paymentRepo.save(payment);
    } else {
      payment = this.paymentRepo.create({
        orderId,
        amount: chargeAmount,
        currency: 'INR',
        provider: gwResult.gatewaySlug,
        status: PaymentStatus.PENDING,
        providerOrderId: gwResult.gatewayOrderId,
      });
      await this.paymentRepo.save(payment);
    }

    return {
      gatewaySlug: gwResult.gatewaySlug,
      gatewayOrderId: gwResult.gatewayOrderId,
      amount: gwResult.amount,
      currency: gwResult.currency,
      key: gwResult.key,
      isPartialPayment: order.isPartialPayment,
      depositAmount: order.isPartialPayment ? chargeAmount : null,
      balanceDue: order.isPartialPayment
        ? Math.round((Number(order.total) - Number(order.amountPaid) - chargeAmount) * 100) / 100
        : null,
    };
  }

  // ── Backward compat: Razorpay create-order ────────────────────────────────
  public async createRazorpayOrder(orderId: string, userId: string) {
    const result = await this.createOrder(orderId, userId, 'razorpay');
    return {
      razorpayOrderId: result.gatewayOrderId,
      amount: result.amount,
      currency: result.currency,
      key: result.key,
      isPartialPayment: result.isPartialPayment,
      depositAmount: result.depositAmount,
      balanceDue: result.balanceDue,
    };
  }

  // ── Generic: verify payment ───────────────────────────────────────────────
  public async verifyPayment(
    data: {
      orderId: string;
      gatewaySlug: string;
      gatewayOrderId: string;
      [key: string]: string;
    },
    userId: string,
  ) {
    const order = await this.orderRepo.findOne({ where: { id: data.orderId, userId } });
    if (!order) throw AppError.notFound('Order');

    // Delegate signature/token verification to the gateway provider
    const provider = getGatewayProvider(data.gatewaySlug);
    await provider.verifyPayment(data);

    const payment = await this.paymentRepo.findOne({
      where: {
        orderId: data.orderId,
        provider: data.gatewaySlug,
        providerOrderId: data.gatewayOrderId,
      },
    });
    if (!payment) throw AppError.notFound('Payment record');

    // Idempotency guard — already verified
    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    payment.status = PaymentStatus.COMPLETED;
    await this.paymentRepo.save(payment);

    await this.transactionRepo.save(
      this.transactionRepo.create({
        paymentId: payment.id,
        type: TransactionType.CAPTURE,
        amount: payment.amount,
        providerReference: data.razorpay_payment_id || data.gatewayPaymentId || data.gatewayOrderId,
        status: PaymentStatus.COMPLETED,
        metadata: data,
      }),
    );

    // Update amountPaid and determine new order status
    const newAmountPaid = Math.round((Number(order.amountPaid) + Number(payment.amount)) * 100) / 100;
    order.amountPaid = newAmountPaid;
    const fullyPaid = newAmountPaid >= Number(order.total) - 0.01;
    order.status = fullyPaid ? OrderStatus.PROCESSING : OrderStatus.PARTIALLY_PAID;
    await this.orderRepo.save(order);

    await this.orderHistoryRepo.save(
      this.orderHistoryRepo.create({
        orderId: order.id,
        status: order.status,
        notes: !fullyPaid
          ? `Deposit of ₹${Number(payment.amount).toFixed(2)} received. Balance ₹${(Number(order.total) - newAmountPaid).toFixed(2)} pending.`
          : 'Full payment received. Order confirmed.',
        changedById: userId,
      }),
    );

    await this.cartRepo.delete({ userId });

    const fullOrder = await this.orderRepo.findOne({ where: { id: data.orderId }, relations: ['items'] });
    const user = await this.userRepo.findOneBy({ id: userId });
    const gwLabel = data.gatewaySlug.charAt(0).toUpperCase() + data.gatewaySlug.slice(1);

    if (fullOrder && user) {
      if (!fullyPaid) {
        const balanceDue = Math.round((Number(fullOrder.total) - newAmountPaid) * 100) / 100;
        const tpl = partialPaymentDepositEmail({
          firstName: user.firstName,
          orderId: fullOrder.id,
          items: (fullOrder.items || []).map(i => ({ name: i.name, quantity: i.quantity, price: Number(i.price) })),
          subtotal: Number(fullOrder.subtotal),
          shippingFee: Number(fullOrder.shippingFee),
          shippingMethodName: fullOrder.shippingMethodName,
          tax: Number(fullOrder.tax),
          taxRate: Number(fullOrder.taxRate),
          total: Number(fullOrder.total),
          depositAmount: Number(payment.amount),
          balanceDue,
          shippingAddress: fullOrder.shippingAddress as Record<string, string>,
        });
        sendMail({ to: user.email, subject: tpl.subject, html: tpl.html });
      } else {
        const tpl = orderConfirmationEmail({
          firstName: user.firstName,
          orderId: fullOrder.id,
          items: (fullOrder.items || []).map(i => ({ name: i.name, quantity: i.quantity, price: Number(i.price) })),
          subtotal: Number(fullOrder.subtotal),
          shippingFee: Number(fullOrder.shippingFee),
          shippingMethodName: fullOrder.shippingMethodName,
          tax: Number(fullOrder.tax),
          taxRate: Number(fullOrder.taxRate),
          total: Number(fullOrder.total),
          shippingAddress: fullOrder.shippingAddress as Record<string, string>,
          paymentMethod: gwLabel,
        });
        sendMail({ to: user.email, subject: tpl.subject, html: tpl.html });

        EmailJobs.sendAdminNewOrderNotification({
          orderId: fullOrder.id,
          customerName: `${user.firstName} ${user.lastName || ''}`.trim(),
          customerEmail: user.email,
          items: (fullOrder.items || []).map(i => ({ name: i.name, quantity: i.quantity, price: Number(i.price) })),
          subtotal: Number(fullOrder.subtotal),
          shippingFee: Number(fullOrder.shippingFee),
          shippingMethodName: fullOrder.shippingMethodName,
          tax: Number(fullOrder.tax),
          taxRate: Number(fullOrder.taxRate),
          discount: Number(fullOrder.discount),
          total: Number(fullOrder.total),
          shippingAddress: fullOrder.shippingAddress as Record<string, string>,
          paymentMethod: gwLabel,
        }).catch(() => {});
      }
    }

    return payment;
  }

  // ── Backward compat: Razorpay verify ─────────────────────────────────────
  public async verifyRazorpayPayment(
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      orderId: string;
    },
    userId: string,
  ) {
    return this.verifyPayment({
      orderId: data.orderId,
      gatewaySlug: 'razorpay',
      gatewayOrderId: data.razorpay_order_id,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
    }, userId);
  }

  // ── Get payments for an order ──────────────────────────────────────────────
  public async getOrderPayments(orderId: string, userId: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId, userId });
    if (!order) throw AppError.notFound('Order');
    return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }
}
