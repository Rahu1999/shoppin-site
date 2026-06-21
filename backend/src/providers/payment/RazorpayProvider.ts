import crypto from 'crypto';
import Razorpay from 'razorpay';
import { AppError } from '@utils/AppError';
import { IGatewayProvider, GatewayOrderResult } from './IGatewayProvider';

export class RazorpayProvider implements IGatewayProvider {
  readonly slug = 'razorpay';

  isCredentialsConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  private getInstance(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new AppError('Razorpay credentials are not configured on the server', 503, 'GATEWAY_UNAVAILABLE');
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createOrder(orderId: string, chargeAmount: number): Promise<GatewayOrderResult> {
    const razorpay = this.getInstance();
    let rzpOrder: any;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: Math.round(chargeAmount * 100),
        currency: 'INR',
        receipt: orderId,
      });
    } catch (err: any) {
      const msg = err?.error?.description || err?.message || 'Razorpay order creation failed';
      throw new AppError(msg, 502, 'GATEWAY_ERROR');
    }

    return {
      gatewayOrderId: rzpOrder.id,
      amount: rzpOrder.amount as number,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID!,
      gatewaySlug: this.slug,
    };
  }

  async verifyPayment(data: Record<string, string>): Promise<void> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new AppError('Razorpay credentials are not configured on the server', 503, 'GATEWAY_UNAVAILABLE');
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', keySecret).update(body).digest('hex');
    if (expected !== razorpay_signature) {
      throw AppError.badRequest('Payment verification failed: signature mismatch');
    }
  }
}
