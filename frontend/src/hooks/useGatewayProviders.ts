import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

export interface GatewayProvider {
  slug: string;
  name: string;
  isEnabled: boolean;
  isDefault: boolean;
  priority: number;
  credentialsConfigured: boolean;
}

export function useGatewayProviders() {
  return useQuery<GatewayProvider[]>({
    queryKey: ['gateway-providers'],
    queryFn: () => apiGet<GatewayProvider[]>('/gateway-providers'),
    staleTime: 5 * 60 * 1000,
    placeholderData: [
      { slug: 'razorpay', name: 'Razorpay', isEnabled: true, isDefault: true, priority: 0, credentialsConfigured: true },
      { slug: 'stripe', name: 'Stripe', isEnabled: false, isDefault: false, priority: 1, credentialsConfigured: false },
      { slug: 'payunow', name: 'PayUNow', isEnabled: false, isDefault: false, priority: 2, credentialsConfigured: false },
    ],
  });
}
