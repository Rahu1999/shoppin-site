import { useMutation, useQuery } from '@tanstack/react-query';
import { apiPost, apiGet } from '@/services/apiClient';
import { useAuthStore, User } from '@/store/authStore';

export const useRegistration = () => {
  return useMutation({
    mutationFn: (data: any) => apiPost('/auth/register', data),
  });
};

export const useLogin = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: any) => apiPost<{ user: User, accessToken: string, refreshToken: string }>('/auth/login', data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
  });
};

export const useProfile = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const user = await apiGet<User>('/users/me');
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
  });
};
