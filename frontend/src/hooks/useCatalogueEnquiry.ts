import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/services/apiClient';

export interface SubmitEnquiryPayload {
  catalogueItemId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
}

export const useSubmitEnquiry = () => {
  const mutation = useMutation({
    mutationFn: (data: SubmitEnquiryPayload) => apiPost('/catalogue-enquiries', data),
    onSuccess: () => {
      toast.success("Enquiry sent — we'll get back to you shortly.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
    },
  });

  return { submit: mutation.mutate, isPending: mutation.isPending, isSuccess: mutation.isSuccess, reset: mutation.reset };
};
