'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { ProductCard } from '@/components/product/ProductCard';
import { 
  Filter, ChevronRight, Hash, ChevronDown, 
  SlidersHorizontal, Star 
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// Mock UI components for filters
const CheckboxItem = ({ label, count }: { label: string, count?: number }) => (
  <label className="flex items-center space-x-3 cursor-pointer group">
    <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center group-hover:border-primary transition-colors">
      <div className="w-3 h-3 rounded-[2px] bg-primary scale-0 group-hover:scale-50 transition-transform" />
    </div>
    <span className="text-slate-600 text-sm font-medium group-hover:text-slate-900 transition-colors">{label}</span>
    {count !== undefined && <span className="text-xs text-slate-400 ml-auto">({count})</span>}
  </label>
);

const FilterSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="mt-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: categoryData, isLoading: catLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => apiGet<any>(`/categories/${slug}`),
  });

  // Reusing products query with category filter
  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'category', slug],
    queryFn: () => apiGet<any>(`/products?categorySlug=${slug}`),
  });

  if (catLoading || prodLoading) {
    return <div className="min-h-[60vh] flex justify-center items-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const category = categoryData || { name: slug.replace(/-/g, ' '), description: '' };
  const products = productsData?.items || [];

  return (
    <div className="bg-surface min-h-screen pb-20">
       {/* Category Header Banner */}
      <div className="relative bg-slate-900 py-16 lg:py-24 overflow-hidden mb-8 lg:mb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=2000&q=80" 
            alt="Category Banner" 
            className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-1000"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-white transition-colors">Categories</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-primary">{category.name}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight capitalize max-w-2xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <p className="font-bold text-slate-900">{products.length} Products</p>
            <Button variant="outline" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-72 shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" /> Filters
                </h2>
                <button className="text-xs font-semibold text-primary hover:underline">Clear All</button>
              </div>

              <FilterSection title="Availability">
                <CheckboxItem label="In Stock" count={products.length} />
                <CheckboxItem label="Out of Stock" count={0} />
              </FilterSection>

              <FilterSection title="Price Range">
                {/* Simulated range slider styling */}
                <div className="py-4">
                   <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                     <div className="absolute left-[20%] right-[30%] h-full bg-primary rounded-full" />
                     <div className="absolute left-[20%] top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-white border-2 border-primary rounded-full shadow-sm cursor-grab" />
                     <div className="absolute right-[30%] top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-white border-2 border-primary rounded-full shadow-sm cursor-grab" />
                   </div>
                   <div className="flex items-center justify-between mt-6 gap-4">
                      <div className="border border-slate-200 rounded-lg px-3 py-2 flex-1 relative">
                        <span className="text-xs text-slate-500 absolute -top-2 bg-white px-1 left-2">Min</span>
                        <span className="text-sm font-semibold text-slate-900">$20</span>
                      </div>
                      <span className="text-slate-400">-</span>
                      <div className="border border-slate-200 rounded-lg px-3 py-2 flex-1 relative">
                        <span className="text-xs text-slate-500 absolute -top-2 bg-white px-1 left-2">Max</span>
                        <span className="text-sm font-semibold text-slate-900">$850</span>
                      </div>
                   </div>
                </div>
              </FilterSection>

              <FilterSection title="Brand">
                <CheckboxItem label="Apple" count={24} />
                <CheckboxItem label="Samsung" count={18} />
                <CheckboxItem label="Sony" count={12} />
                <CheckboxItem label="Logitech" count={9} />
              </FilterSection>

              <FilterSection title="Rating">
                {[5, 4, 3].map(rating => (
                  <label key={rating} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center group-hover:border-primary transition-colors">
                      <div className="w-3 h-3 rounded-[2px] bg-primary scale-0 group-hover:scale-50 transition-transform" />
                    </div>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                      ))}
                      <span className="ml-2 text-sm text-slate-600">& Up</span>
                    </div>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sorting Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 hidden lg:flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{products.length}</span> premium products
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 font-semibold">Sort by:</span>
                <select className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 font-medium outline-none cursor-pointer">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>New Arrivals</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                 <div className="inline-flex h-20 w-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                    <Hash className="h-10 w-10 text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">No products found</h3>
                 <p className="text-slate-500 mt-2 text-lg max-w-md">We couldn't find anything matching your current filters in this category.</p>
                 <Button className="mt-8 rounded-xl h-12 px-8 font-bold">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Premium Pagination */}
            {products.length > 0 && (
              <div className="mt-16 flex justify-center pb-8">
                <nav className="flex items-center gap-1">
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20">1</button>
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors">2</button>
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors">3</button>
                  <span className="px-2 text-slate-400 font-bold">...</span>
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
