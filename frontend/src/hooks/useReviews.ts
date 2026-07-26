import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  user?: { id: string; firstName?: string; lastName?: string };
}

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const useProductReviews = (productId?: string) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => apiGet<PaginatedResponse<Review>>(`/reviews/product/${productId}`),
    enabled: !!productId,
  });
};

interface ReviewEligibility {
  canReview: boolean;
  alreadyReviewed: boolean;
  hasDeliveredPurchase: boolean;
}

export const useReviewEligibility = (productId?: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['review-eligibility', productId],
    queryFn: () => apiGet<ReviewEligibility>(`/reviews/eligibility/${productId}`),
    enabled: isAuthenticated && !!productId,
  });
};

export const useMyReviewedProductIds = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['my-reviewed-product-ids'],
    queryFn: () => apiGet<{ productIds: string[] }>('/reviews/mine'),
    enabled: isAuthenticated,
  });
};

interface SubmitReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  body: string;
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const mutation = useMutation({
    mutationFn: (data: SubmitReviewPayload) => apiPost<Review>('/reviews', data),
    onSuccess: (review, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['my-reviewed-product-ids'] });
      toast.success(review.isApproved ? 'Review published — thanks for sharing!' : 'Review submitted — pending approval');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
    },
  });

  const submit = (data: SubmitReviewPayload) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to write a review');
      router.push('/login');
      return;
    }
    mutation.mutate(data);
  };

  return { submit, isPending: mutation.isPending };
};
