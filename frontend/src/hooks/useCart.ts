import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/apiClient';
import { useCartStore } from '@/store/cartStore';

export const useFetchCart = () => {
  const setCart = useCartStore((s) => s.setCart);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await apiGet<any>('/carts');
      setCart(cart.id, cart.items || []);
      return cart;
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);

  return useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      apiPost<any>('/carts/items', data),
    onSuccess: (updatedCart) => {
      setCart(updatedCart.id, updatedCart.items);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiPatch<any>(`/carts/items/${itemId}`, { quantity }),
    onSuccess: (updatedCart) => {
      setCart(updatedCart.id, updatedCart.items);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => apiDelete(`/carts/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
