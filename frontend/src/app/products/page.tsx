'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts, useCategoriesTree } from '@/hooks/useProducts';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, SlidersHorizontal, Loader2, ChevronDown, Check, Star, AlertCircle } from 'lucide-react';
import { useAddToCart } from '@/hooks/useCart';

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || null;

  const [search, setSearch] = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState<string | null>(urlCategory);

  // Sync with URL changes
  useEffect(() => {
    setSearch(urlSearch);
    if (urlCategory) setActiveCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  const { data, isLoading, isError } = useProducts({
    search: search || undefined,
    category: activeCategory || undefined,
    limit: 15,
  });

  const { data: categories } = useCategoriesTree();
  const { mutate: addToCart } = useAddToCart();

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  return (
    <div className="bg-surface min-h-screen pb-20">
      
      {/* Search Header Banner */}
      <div className="bg-slate-900 py-12 relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/90 to-slate-800 z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 -mt-20 -mr-20 z-0" />
        
        <div className="container mx-auto px-4 relative z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white capitalize">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <p className="text-slate-300 mt-2 text-lg">
              {isLoading ? 'Searching catalog...' : `${data?.items?.length || 0} items found`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..." 
                className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 rounded-xl transition-all"
              />
            </div>
            <Button size="lg" className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Horizontal Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-wrap items-center gap-3 md:gap-4 sticky top-20 z-30">
          <div className="hidden sm:flex items-center gap-2 text-slate-700 font-bold mr-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Filters
          </div>

          {/* Category Dropdown Stub */}
          <div className="relative group">
            <button className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
              Category <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
               <button 
                  onClick={() => setActiveCategory(null)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${!activeCategory ? 'text-primary font-bold' : 'text-slate-700'}`}
                >
                  All Categories {!activeCategory && <Check className="h-4 w-4" />}
                </button>
               {categories?.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${activeCategory === cat.id ? 'text-primary font-bold' : 'text-slate-700'}`}
                  >
                    {cat.name} {activeCategory === cat.id && <Check className="h-4 w-4" />}
                  </button>
                ))}
            </div>
          </div>

          {/* Price Filter Stub */}
          <button className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
            Price <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

           {/* Rating Filter Stub */}
          <button className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
            Rating <Star className="h-4 w-4 text-yellow-500 fill-current" /> <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Availability Stub */}
          <button className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 flex items-center gap-2 hover:border-primary hover:text-primary transition-colors">
            Availability <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          <div className="flex-1 md:hidden" /> {/* Spacer for mobile */}
          
          <button className="text-xs font-bold text-slate-500 hover:text-red-500 hover:underline px-2 transition-colors">
            Clear All
          </button>

          <div className="ml-auto hidden xl:flex items-center gap-3">
             <span className="text-sm font-semibold text-slate-500">Sort by:</span>
             <select className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer">
               <option>Recommended</option>
               <option>Price: Low to High</option>
               <option>Price: High to Low</option>
               <option>Newest Arrivals</option>
             </select>
          </div>
        </div>

        {/* Product Grid Layout */}
        <main className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center p-32">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="p-16 text-center border rounded-2xl bg-red-50 border-red-100 max-w-2xl mx-auto mt-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl text-red-800 font-bold mb-2">Failed to load products</h3>
              <p className="text-red-600">Please try refreshing the page or check your connection.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 border-red-200 text-red-700 hover:bg-red-100">Try Again</Button>
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="p-20 text-center border border-dashed rounded-3xl bg-white shadow-sm max-w-3xl mx-auto mt-12">
              <div className="inline-flex h-24 w-24 bg-slate-50 rounded-full items-center justify-center mb-6">
                 <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No matching products</h3>
              <p className="text-slate-500 text-lg max-w-md mx-auto">We couldn't find anything matching your search &quot;{search}&quot; or current filters.</p>
              <Button 
                onClick={() => { setSearch(''); setActiveCategory(null); }} 
                className="mt-8 h-12 px-8 rounded-xl font-bold"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 gap-y-10">
              {data?.items?.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {/* Premium Pagination */}
          {(data?.items?.length ?? 0) > 0 && (data?.meta?.totalPages ?? 0) > 1 && (
            <div className="mt-20 border-t border-slate-200 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 pb-12">
              <p className="text-slate-500 font-medium text-sm">
                Showing page <span className="font-bold text-slate-900">{data?.meta?.page}</span> of <span className="font-bold text-slate-900">{data?.meta?.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={!data?.meta?.hasPrev} className="h-12 px-6 rounded-xl font-bold hover:border-primary hover:text-primary transition-colors">
                  Previous Page
                </Button>
                <Button variant="outline" disabled={!data?.meta?.hasNext} className="h-12 px-6 rounded-xl font-bold border-primary text-primary hover:bg-primary/5 transition-colors">
                  Next Page
                </Button>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="bg-surface min-h-screen pb-20 p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
