'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/services/apiClient';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { AccountLayout } from '@/components/account/AccountLayout';

function FeaturedSuggestions() {
  const { data, isLoading } = useProducts({ isFeatured: 'true', limit: 4 });
  const products = data?.items || [];
  const { mutate: addToCart } = useAddToCart();
  const { toggle: toggleWishlist } = useToggleWishlist();

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <span className="text-slate-400 font-medium italic text-sm">Curating recommendations...</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p as any}
          onAddToCart={handleAddToCart}
          onToggleWishlist={toggleWishlist}
        />
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { mutate: addToCart } = useAddToCart();
  const { toggle: toggleWishlist } = useToggleWishlist();

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  const { data: wishlist, isLoading } = useWishlist();

  // `isAuthenticated` (and therefore the wishlist query's enabled/loading state)
  // comes from a client-persisted store, so it can legitimately differ between
  // the server-rendered HTML and the browser's very first hydration pass. Gate
  // on mount so both render the identical loading skeleton until the client
  // has settled, avoiding a hydration mismatch.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const showLoading = !hasMounted || isLoading;

  const clearWishlist = useMutation({
    mutationFn: () => apiDelete('/wishlists'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    }
  });

  const items = wishlist?.items || [];

  return (
    <AccountLayout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500" /> My Wishlist
        </h1>
        {!showLoading && items.length > 0 && (
          <Button variant="outline" onClick={() => clearWishlist.mutate()} disabled={clearWishlist.isPending} className="text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
            Clear Wishlist
          </Button>
        )}
      </div>

      {showLoading ? (
        <div className="flex justify-center py-24"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : items.length === 0 ? (
        <div className="space-y-20">
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-6">
              <Heart className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Your wishlist is empty</h2>
            <p className="text-slate-500 max-w-md mx-auto mt-2">Save items you love so you can easily find them later. Discover our premium collection below.</p>
            <Link href="/products" className="inline-block mt-8">
              <Button size="lg" className="px-8 h-14">Explore Catalog</Button>
            </Link>
          </div>

          {/* Featured Suggestions */}
          <div>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Hand-picked for You</h3>
                <Link href="/products" className="text-sm font-bold text-primary hover:underline">View All</Link>
             </div>
             <FeaturedSuggestions />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {items.map((item: any) => (
            <ProductCard
              key={item.id}
              product={item.product}
              onAddToCart={handleAddToCart}
              isWishlisted
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
