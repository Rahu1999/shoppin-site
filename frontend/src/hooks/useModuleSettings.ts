import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

export interface ModuleSetting {
  id: string;
  moduleKey: string;
  label: string;
  isEnabled: boolean;
}

export const useAdminModuleSettings = () => {
  return useQuery({
    queryKey: ['adminModuleSettings'],
    queryFn: () => apiGet<ModuleSetting[]>('/module-settings/admin'),
  });
};

export const usePublicModuleFlags = () => {
  return useQuery({
    queryKey: ['publicModuleFlags'],
    queryFn: () => apiGet<Record<string, boolean>>('/module-settings/public'),
    staleTime: 60000,
  });
};
