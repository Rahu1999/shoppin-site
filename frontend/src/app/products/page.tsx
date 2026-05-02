'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts, useCategoriesTree } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Loader2, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { useAddToCart } from '@/hooks/useCart';

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || null;

  const [search, setSearch] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState<string | null>(urlCategory);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(urlSearch);
    if (urlCategory) setActiveCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  const { data, isLoading, isError } = useProducts({
    search: search || undefined,
    category: activeCategory || undefined,
    limit: 12,
    page,
  });

  const { data: categories } = useCategoriesTree();
  const { mutate: addToCart } = useAddToCart();

  const products = data?.items || [];
  const meta = data?.meta;

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryChange = (catId: string | null) => {
    setActiveCategory(catId);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory(null);
    setPage(1);
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Page header */}
      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
            {search ? `Search: "${search}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLoading ? 'Loading...' : `${meta?.total ?? products.length} products`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-start sm:items-center">

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 h-10"
              />
            </div>
            <Button type="submit" className="h-10 px-4 bg-gray-900 text-white hover:bg-gray-700 rounded-lg text-sm font-medium">
              Search
            </Button>
          </form>

          {/* Category dropdown */}
          {categories && categories.length > 0 && (
            <div className="relative group">
              <button className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 flex items-center gap-2 hover:border-gray-400 transition-colors">
                {activeCategory
                  ? categories.find((c) => c.id === activeCategory)?.name ?? 'Category'
                  : 'All Categories'}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 py-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 ${!activeCategory ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                >
                  All Categories {!activeCategory && <Check className="h-3.5 w-3.5" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 ${activeCategory === cat.id ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                  >
                    {cat.name} {activeCategory === cat.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {(search || activeCategory) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-gray-700 font-medium underline-offset-2 hover:underline transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load products</h3>
            <p className="text-gray-500 mb-6">Please refresh the page or check your connection.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="font-medium">
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {search
                ? `We couldn't find anything for "${search}".`
                : 'No products match the selected filters.'}
            </p>
            <Button onClick={clearFilters} className="bg-gray-900 text-white hover:bg-gray-700 font-medium">
              View All Products
            </Button>
          </div>
        ) : (
          <>
            <ProductGrid>
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </ProductGrid>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page <span className="font-semibold text-gray-900">{meta.page}</span> of{' '}
                  <span className="font-semibold text-gray-900">{meta.totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!meta.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-10 px-5 rounded-lg font-medium text-sm border-gray-200 hover:border-gray-400 disabled:opacity-40"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!meta.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-10 px-5 rounded-lg font-medium text-sm border-gray-200 hover:border-gray-400 disabled:opacity-40"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
