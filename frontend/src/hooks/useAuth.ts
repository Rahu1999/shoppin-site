import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiPost<{ user: User, accessToken: string, refreshToken: string }>('/auth/login', data),
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      // Merge guest cart into user's cart (fire-and-forget)
      try { await apiPost('/carts/merge'); } catch { /* ignore */ }
      // Refetch cart so the navbar count reflects the merged user cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
