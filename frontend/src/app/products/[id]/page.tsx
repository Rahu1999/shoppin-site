'use client';

import { useParams } from 'next/navigation';
import { useProductDetail, useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, Minus, Plus, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/utils/price';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BRAND, buildProductWhatsAppLink } from '@/config/brand';

/** Splits description into bullet points (by . ! ? or newline) */
function extractBullets(description: string): string[] {
  if (!description) return [];
  return description
    .split(/[.\n!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, 6);
}

function getVariantStock(variant: any): number {
  if (!variant?.inventory) return 0;
  return variant.inventory.reduce(
    (s: number, i: any) => s + Math.max(0, (i.quantity || 0) - (i.reserved || 0)),
    0
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data: productData, isLoading, isError } = useProductDetail(productId);
  const product: any = productData;
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Related products
  const { data: relatedData } = useProducts({
    category: product?.category?.id,
    limit: 4,
  });
  const relatedProducts =
    relatedData?.items?.filter((p: any) => p.id !== product?.id).slice(0, 3) || [];

  // Set primary image on load
  useEffect(() => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img: any) => img.isPrimary);
      setSelectedImage(primary?.url || product.images[0].url);
    }
  }, [product]);

  // Auto-select first active variant when product loads
  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstActive = product.variants.find((v: any) => v.isActive);
      if (firstActive) setSelectedVariant(firstActive);
    }
  }, [product]);

  // Reset qty when variant changes
  useEffect(() => {
    setQty(1);
  }, [selectedVariant]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products">
          <Button className="bg-gray-900 text-white hover:bg-gray-700 px-8 h-11 rounded-xl font-semibold">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const activeVariants = (product.variants || []).filter((v: any) => v.isActive);
  const hasVariants = activeVariants.length > 0;

  // Price: selected variant > base product
  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice || 0);
  const displayComparePrice = selectedVariant
    ? (selectedVariant.comparePrice ? Number(selectedVariant.comparePrice) : null)
    : (product.comparePrice ? Number(product.comparePrice) : null);

  // Stock: per-variant or base product inventory
  const currentStock = hasVariants
    ? (selectedVariant ? getVariantStock(selectedVariant) : 0)
    : (product.stock || 0);

  const hasDiscount = displayComparePrice && displayComparePrice > displayPrice;
  const discount = hasDiscount
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
    : 0;

  const bullets = extractBullets(product.description || '');
  const isOutOfStock = currentStock === 0;
  const mustSelectVariant = hasVariants && !selectedVariant;
  const whatsappLink = buildProductWhatsAppLink(product.name);

  const handleAddToCart = () => {
    addToCart.mutate({
      productId: product.id,
      quantity: qty,
      variantId: selectedVariant?.id,
    });
  };

  return (
    <div className="bg-white pb-20 pt-6">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20">

          {/* ── LEFT: Image Gallery ─────────────────────────────────────── */}
          <div>
            {/* Main image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative">
              <Image
                src={selectedImage || product?.images?.[0]?.url || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
              {isOutOfStock && !mustSelectVariant && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img.url
                        ? 'border-gray-900 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt={`View ${idx + 1}`} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col">
            {/* Category badge */}
            {product.category?.name && (
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {product.category.name}
              </span>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through font-medium">
                  {formatPrice(displayComparePrice!)}
                </span>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed text-base mb-6">
                {product.shortDescription}
              </p>
            )}

            {/* ── Variant selector ─────────────────────────────────────── */}
            {hasVariants && (
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map((v: any) => {
                    const vStock = getVariantStock(v);
                    const isSelected = selectedVariant?.id === v.id;
                    const vOutOfStock = vStock === 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={vOutOfStock}
                        className={`relative px-5 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                            : vOutOfStock
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {v.attributes?.size || v.name}
                        {vOutOfStock && (
                          <span className="ml-1.5 text-[10px] font-normal normal-case no-underline">
                            (out of stock)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bullet features */}
            {bullets.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Key Features
                </h3>
                <ul className="space-y-2.5">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock indicator */}
            {!mustSelectVariant && currentStock > 0 && currentStock <= 10 && (
              <p className="text-sm font-medium text-orange-600 mb-4">
                Only {currentStock} left in stock
              </p>
            )}

            {/* Quantity + CTA */}
            <div className="border-t border-gray-100 pt-6 mt-auto">
              {/* Quantity */}
              {!isOutOfStock && !mustSelectVariant && (
                <div className="mb-4">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 w-32 h-11 justify-between px-2">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-gray-900 text-sm">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      disabled={qty >= currentStock}
                      className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || isOutOfStock || mustSelectVariant}
                  className="flex-1 h-12 bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {mustSelectVariant
                    ? 'Select a size first'
                    : isOutOfStock
                    ? 'Out of Stock'
                    : addToCart.isPending
                    ? 'Adding...'
                    : 'Add to Cart'}
                </Button>

                {/* WhatsApp Enquire */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors hover:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enquire on WhatsApp
                </a>
              </div>
            </div>

            {/* Full description below CTA */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  About this product
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More Products</h2>
            <ProductGrid cols={3}>
              {relatedProducts.map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(id) => addToCart.mutate({ productId: id, quantity: 1 })}
                />
              ))}
            </ProductGrid>
          </div>
        )}

      </div>
    </div>
  );
}
