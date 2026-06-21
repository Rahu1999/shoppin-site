import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

export interface PaymentGatewayConfig {
  name: string;
  rate: number;
  taxRate: number;
  isEnabled: boolean;
  isActive: boolean;
}

export function usePaymentGatewayConfig() {
  return useQuery<PaymentGatewayConfig>({
    queryKey: ['payment-gateway-config'],
    queryFn: () => apiGet<PaymentGatewayConfig>('/payment-gateway/config'),
    staleTime: 10 * 60 * 1000,
    placeholderData: { name: 'Razorpay', rate: 2, taxRate: 18, isEnabled: true, isActive: true },
  });
}
