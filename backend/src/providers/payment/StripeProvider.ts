import { AppError } from '@utils/AppError';
import { IGatewayProvider, GatewayOrderResult } from './IGatewayProvider';

export class StripeProvider implements IGatewayProvider {
  readonly slug = 'stripe';

  isCredentialsConfigured(): boolean {
    return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
  }

  async createOrder(_orderId: string, _chargeAmount: number): Promise<GatewayOrderResult> {
    throw new AppError('Stripe payment gateway is not yet implemented', 501, 'GATEWAY_NOT_IMPLEMENTED');
  }

  async verifyPayment(_data: Record<string, string>): Promise<void> {
    throw new AppError('Stripe payment gateway is not yet implemented', 501, 'GATEWAY_NOT_IMPLEMENTED');
  }
}
