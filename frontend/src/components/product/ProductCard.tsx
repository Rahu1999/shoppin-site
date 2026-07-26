import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '@/utils/price';
import { StarRating } from '@/components/ui/StarRating';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    comparePrice?: number;
    shortDescription?: string;
    description?: string;
    images: { url: string; isPrimary: boolean }[];
    category?: { name: string };
    averageRating?: number;
    reviewCount?: number;
  };
  onAddToCart?: (id: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

/** Extracts a short subtitle from description or shortDescription */
function getSubtitle(product: ProductCardProps['product']): string {
  if (product.shortDescription) return product.shortDescription;
  if (product.description) {
    // Take first sentence or first 80 chars
    const firstSentence = product.description.split(/[.!?\n]/)[0].trim();
    return firstSentence.length > 80
      ? firstSentence.slice(0, 77) + '...'
      : firstSentence;
  }
  return '';
}

export function ProductCard({ product, onAddToCart, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const primaryImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    '/placeholder-product.svg';

  const subtitle = getSubtitle(product);

  const hasDiscount =
    product?.comparePrice && Number(product.comparePrice) > Number(product.basePrice);
  const discount = hasDiscount
    ? Math.round(
        ((Number(product.comparePrice) - Number(product.basePrice)) /
          Number(product.comparePrice)) *
          100
      )
    : 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <Link
        href={`/products/${product?.slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={product?.name || 'Product'}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholder-product.svg';
          }}
        />
        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-gray-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            {discount}% OFF
          </span>
        )}

        {/* Wishlist toggle */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-400'
              }`}
            />
          </button>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        {product.category?.name && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product?.slug}`} className="block mb-1">
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 hover:text-gray-600 transition-colors">
            {product?.name || 'Product'}
          </h3>
        </Link>

        {/* Rating */}
        <StarRating
          rating={product.averageRating || 0}
          count={product.reviewCount || 0}
          size="sm"
          showCount
          className="mb-2"
        />

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
            {subtitle}
          </p>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product?.basePrice || 0)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(Number(product.comparePrice))}
              </span>
            )}
          </div>

          {onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product.id);
              }}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors active:scale-95"
              title="Add to Cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
