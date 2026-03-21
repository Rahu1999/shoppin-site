import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number;
  images: { url: string; isPrimary: boolean }[];
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string };
  isFeatured: boolean;
  stock?: number;
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

export const useProducts = (query: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => apiGet<PaginatedResponse<Product>>('/products', query),
    staleTime: 60000 * 5, // 5 minutes
  });
};

export const useProductDetail = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiGet<Product & { description: string; variants: any[]; reviews: any[] }>(`/products/${slug}`),
    enabled: !!slug,
  });
};

export const useCategoriesTree = () => {
  return useQuery({
    queryKey: ['categories-tree'],
    queryFn: () => apiGet<any[]>('/categories/tree'),
    staleTime: 60000 * 15, // 15 minutes
  });
};
