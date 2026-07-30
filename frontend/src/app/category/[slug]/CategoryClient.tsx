'use client';

import { Search } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useAddToCart } from '@/hooks/useCart';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';

interface CategoryClientProps {
  category: {
    id: string;
    name: string;
    description?: string;
  };
  initialProducts: any[];
}

export default function CategoryClient({ category, initialProducts }: CategoryClientProps) {
  const { mutate: addToCart } = useAddToCart();
  const { data: wishlist } = useWishlist();
  const { toggle: toggleWishlist } = useToggleWishlist();
  const wishlistedIds = new Set((wishlist?.items || []).map((i: any) => i.productId));

  const handleAddToCart = (productId: string) => {
    addToCart({ productId, quantity: 1 });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-500 text-sm max-w-2xl">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {initialProducts.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products in this category yet</h3>
            <p className="text-gray-500">Check back soon, or browse all products.</p>
          </div>
        ) : (
          <ProductGrid>
            {initialProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isWishlisted={wishlistedIds.has(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
