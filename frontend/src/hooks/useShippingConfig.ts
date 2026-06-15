import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

export interface ShippingConfig {
  name: string;
  flatFee: number;
  freeAbove: number | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
  isActive: boolean;
}

export function useShippingConfig() {
  return useQuery<ShippingConfig>({
    queryKey: ['shipping-config'],
    queryFn: () => apiGet<ShippingConfig>('/shipping/config'),
    staleTime: 10 * 60 * 1000,
    placeholderData: {
      name: 'Standard Delivery',
      flatFee: 99,
      freeAbove: 999,
      estimatedDaysMin: 5,
      estimatedDaysMax: 7,
      isActive: true,
    },
  });
}
