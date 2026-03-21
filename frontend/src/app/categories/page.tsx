'use client';

import { useCategoriesTree } from '@/hooks/useProducts';
import Link from 'next/link';
import { ChevronRight, Loader2, LayoutGrid } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategoriesTree();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Browse by Category</h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Explore our wide range of products organized into curated categories for your convenience.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="p-12 text-center border rounded-2xl bg-red-50 border-red-100 max-w-md mx-auto">
          <h3 className="text-red-800 font-bold text-xl mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-6">We couldn't load the categories at this time. Please try again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((category) => (
            <div key={category.id} className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   <LayoutGrid size={24} />
                </div>
                <Link href={`/category/${category.slug}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2 truncate group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 min-h-[40px]">
                {category.description || `Browse our exclusive collection of ${category.name.toLowerCase()} products selected just for you.`}
              </p>

              {category.children && category.children.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {category.children.slice(0, 4).map((child: any) => (
                    <Link 
                      key={child.id} 
                      href={`/category/${child.slug}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors font-medium border border-slate-200"
                    >
                      {child.name}
                    </Link>
                  ))}
                  {category.children.length > 4 && (
                    <span className="text-xs text-slate-400 italic flex items-center px-2">
                      +{category.children.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
