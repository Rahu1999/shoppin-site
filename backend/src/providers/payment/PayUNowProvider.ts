import { AppError } from '@utils/AppError';
import { IGatewayProvider, GatewayOrderResult } from './IGatewayProvider';

export class PayUNowProvider implements IGatewayProvider {
  readonly slug = 'payunow';

  isCredentialsConfigured(): boolean {
    return !!(process.env.PAYUNOW_MERCHANT_KEY && process.env.PAYUNOW_SALT);
  }

  async createOrder(_orderId: string, _chargeAmount: number): Promise<GatewayOrderResult> {
    throw new AppError('PayUNow payment gateway is not yet implemented', 501, 'GATEWAY_NOT_IMPLEMENTED');
  }

  async verifyPayment(_data: Record<string, string>): Promise<void> {
    throw new AppError('PayUNow payment gateway is not yet implemented', 501, 'GATEWAY_NOT_IMPLEMENTED');
  }
}
