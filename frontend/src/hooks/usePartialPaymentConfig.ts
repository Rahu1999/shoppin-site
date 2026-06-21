import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

export interface PartialPaymentConfig {
  isEnabled: boolean;
  depositType: 'percentage' | 'fixed';
  depositValue: number;
  minimumOrderValue: number;
  label: string;
  isActive: boolean;
}

export function usePartialPaymentConfig() {
  return useQuery<PartialPaymentConfig>({
    queryKey: ['partial-payment-config'],
    queryFn: () => apiGet<PartialPaymentConfig>('/partial-payment/config'),
    staleTime: 10 * 60 * 1000,
    placeholderData: {
      isEnabled: false,
      depositType: 'percentage',
      depositValue: 30,
      minimumOrderValue: 0,
      label: 'Pay 30% Now, Rest Before Dispatch',
      isActive: true,
    },
  });
}
