'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, Filter, Hash, Loader2 } from 'lucide-react';

import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => apiGet<any>(`/products?search=${query}`),
    enabled: !!query,
  });

  return (
    <div className="bg-surface min-h-[80vh] pt-8 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Search Header */}
        <div className="text-center py-10 lg:py-16">
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
             Search Results
           </h1>
           <p className="text-lg text-slate-500 mt-4">
             {query ? (
               <>Showing results for <span className="font-bold text-slate-900">"{query}"</span></>
             ) : (
               'Please enter a search query'
             )}
           </p>
        </div>

        {isLoading ? (
          <div className="p-24 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <>
            {query && (
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <Hash className="h-5 w-5 text-primary" /> {productsData?.items?.length || 0} Products Found
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors shadow-sm">
                  <Filter className="h-4 w-4" /> Filter
                </button>
              </div>
            )}

            {(!productsData?.items || productsData.items.length === 0) && query ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
                 <div className="inline-flex h-16 w-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">No matches found</h3>
                 <p className="text-slate-500">We couldn't find anything matching "{query}". Try checking your spelling or using more general terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                {productsData?.items?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
