import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

export interface TaxConfig {
  name: string;
  rate: number;
  isActive: boolean;
}

export function useTaxConfig() {
  return useQuery<TaxConfig>({
    queryKey: ['tax-config'],
    queryFn: () => apiGet<TaxConfig>('/tax/config'),
    staleTime: 10 * 60 * 1000,
    placeholderData: { name: 'GST', rate: 18, isActive: true },
  });
}
