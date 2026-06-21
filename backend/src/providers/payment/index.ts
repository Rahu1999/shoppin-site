import { AppError } from '@utils/AppError';
import { IGatewayProvider } from './IGatewayProvider';
import { RazorpayProvider } from './RazorpayProvider';
import { StripeProvider } from './StripeProvider';
import { PayUNowProvider } from './PayUNowProvider';

export { IGatewayProvider };
export type { GatewayOrderResult } from './IGatewayProvider';

export function getGatewayProvider(slug: string): IGatewayProvider {
  switch (slug) {
    case 'razorpay': return new RazorpayProvider();
    case 'stripe':   return new StripeProvider();
    case 'payunow':  return new PayUNowProvider();
    default: throw AppError.badRequest(`Unknown payment gateway: ${slug}`);
  }
}

export const KNOWN_GATEWAYS: { slug: string; name: string }[] = [
  { slug: 'razorpay', name: 'Razorpay' },
  { slug: 'stripe',   name: 'Stripe' },
  { slug: 'payunow',  name: 'PayUNow' },
];
