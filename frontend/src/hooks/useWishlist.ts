import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiGet<any>('/wishlists'),
    enabled: isAuthenticated,
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const mutation = useMutation({
    mutationFn: (productId: string) =>
      apiPost<{ added: boolean }>('/wishlists/toggle', { productId }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(result.added ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.');
    },
  });

  const toggle = (productId: string) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to save items to your wishlist');
      router.push('/login');
      return;
    }
    mutation.mutate(productId);
  };

  return { toggle, isPending: mutation.isPending };
};
