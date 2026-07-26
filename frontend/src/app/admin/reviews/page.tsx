'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiDelete } from '@/services/apiClient';
import { toast } from 'sonner';
import { MessageSquareText, Check, X } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminPendingReviews'],
    queryFn: () => apiGet<any>('/reviews/admin/pending?limit=100'),
  });

  const approve = useMutation({
    mutationFn: (id: string) => apiPatch(`/reviews/admin/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingReviews'] });
      toast.success('Review approved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve review');
    },
  });

  const reject = useMutation({
    mutationFn: (id: string) => apiDelete(`/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingReviews'] });
      toast.success('Review rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject review');
    },
  });

  if (isLoading) {
    return <div className="p-24 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const reviews: any[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Review Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">Approve or reject reviews awaiting publication.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <MessageSquareText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No reviews are awaiting approval.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <StarRating rating={review.rating} count={1} size="sm" />
                  {review.product?.slug && (
                    <Link
                      href={`/products/${review.product.slug}`}
                      target="_blank"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  )}
                  <span className="text-xs text-slate-400">
                    by {review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}
                  </span>
                </div>
                {review.title && <h4 className="font-semibold text-slate-900 mb-1">{review.title}</h4>}
                <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => approve.mutate(review.id)}
                  disabled={approve.isPending || reject.isPending}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  onClick={() => reject.mutate(review.id)}
                  disabled={approve.isPending || reject.isPending}
                  size="sm"
                  variant="danger"
                  className="rounded-lg"
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
