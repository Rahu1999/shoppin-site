import { AppDataSource } from '@config/database';
import { Payment } from '@entities/payment.entity';
import { PaymentTransaction } from '@entities/payment-transaction.entity';
import { Order } from '@entities/order.entity';
import { AppError } from '@utils/AppError';
import { OrderStatus } from '@entities/order-status.enum';
import { PaymentStatus } from '@entities/payment-status.enum';
import { TransactionType } from '@entities/transaction-type.enum';

export class PaymentsService {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private orderRepo = AppDataSource.getRepository(Order);

  // Mocking an external Payment Gateway Integration
  public async processOrderPayment(orderId: string, userId: string, data: Record<string, any>) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId } });
    if (!order) throw AppError.notFound('Order');
    if (order.status !== OrderStatus.PENDING) throw AppError.badRequest('Order is not in a pending state for payment');

    // Simulate payment processing latency
    if (data.amount !== Number(order.total)) {
      throw AppError.badRequest('Payment amount does not match order total');
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Handle COD (Cash on Delivery)
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
          metadata: { source: 'cod_checkout' }
        }]
      });

      await this.paymentRepo.save(payment);
      
      order.status = OrderStatus.PROCESSING;
      await this.orderRepo.save(order);
      
      return payment;
    }

    // Fake external success (90% success rate mock for online payments)
    const isSuccess = Math.random() > 0.1;

    const payment = this.paymentRepo.create({
      orderId,
      amount: data.amount,
      currency: data.currency,
      provider: 'MockGateway',
      providerOrderId: `mock_req_${transactionId}`,
      status: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      transactions: [{
        type: TransactionType.CAPTURE,
        amount: data.amount,
        providerReference: transactionId,
        status: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        metadata: { source: 'mock_gateway' }
      }]
    });
    
    await this.paymentRepo.save(payment);

    if (isSuccess) {
      order.status = OrderStatus.PROCESSING;
      await this.orderRepo.save(order);
    } else {
      throw new AppError(payment.status, 402, `Payment failed (Mock txn: ${transactionId})`);
    }

    return payment;
  }

  public async getOrderPayments(orderId: string, userId: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId, userId });
    if (!order) throw AppError.notFound('Order');

    return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }
}
