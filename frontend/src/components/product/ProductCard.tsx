import Link from 'next/link';
import { ShoppingCart, Star, Heart, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { formatPrice } from '@/utils/price';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    comparePrice?: number;
    images: { url: string; isPrimary: boolean }[];
    category: { name: string };
  };
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  isWishlisted?: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted = false }: ProductCardProps) {
  const { currency, exchangeRate } = useSettingsStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const primaryImage = product?.images?.find((img: any) => img.isPrimary)?.url || product?.images?.[0]?.url || 'https://placehold.co/400x500/slate/white?text=No+Image';

  const discount = (product?.comparePrice && product?.basePrice)
    ? Math.round(((Number(product.comparePrice) - Number(product.basePrice)) / Number(product.comparePrice)) * 100)
    : 0;

  return (
    <>
      <div 
        className="group relative flex flex-col rounded-3xl bg-white p-3 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,112,184,0.1)] hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Quick Action: Wishlist */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            if(onToggleWishlist) onToggleWishlist(product.id);
          }}
          className={`absolute right-6 top-6 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm ${
            isWishlisted 
              ? 'bg-rose-500 text-white scale-110' 
              : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:scale-110'
          } ${isHovered ? 'opacity-100' : 'md:opacity-0 group-hover:opacity-100'}`}
        >
          <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Action: Quick View */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            setIsQuickViewOpen(true);
          }}
          className={`absolute left-6 top-6 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm bg-white/80 text-slate-400 hover:text-primary hover:scale-110 ${isHovered ? 'opacity-100' : 'md:opacity-0 group-hover:opacity-100'}`}
          title="Quick View"
        >
          <Eye className="h-4.5 w-4.5" />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-6 top-16 z-20 rounded-full bg-slate-900/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
            {discount}% OFF
          </span>
        )}
        
        {/* Product Image */}
        <Link href={`/products/${product?.slug}`} className="relative aspect-4/5 overflow-hidden rounded-2xl bg-slate-50 mb-5 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImage}
            alt={product?.name || 'Product'}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Quick Add Overlay (Mobile Always/Desktop Hover) */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className={`absolute inset-x-4 bottom-4 z-20 transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'md:translate-y-4 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
            <Button 
              className="w-full rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white font-bold py-6 shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
              onClick={(e) => {
                e.preventDefault();
                if(onAddToCart) onAddToCart(product.id);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Quick Add
            </Button>
          </div>
        </Link>

        {/* Content */}
        <div className="px-2 pb-2">
          <div className="flex items-center justify-between mb-2">
             <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/70">
              {product.category?.name || 'Accessories'}
            </span>
            <div className="flex items-center gap-1">
               <div className="flex text-amber-400">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-current' : 'opacity-30'}`} />
                 ))}
               </div>
               <span className="text-[10px] font-bold text-slate-400">4.9</span>
            </div>
          </div>

          <Link href={`/products/${product?.slug}`} className="block mb-3">
            <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
              {product?.name || 'Premium Device'}
            </h3>
          </Link>

          <div className="flex items-end gap-3">
            <span className="text-lg font-black text-slate-900 tracking-tight">
              {formatPrice(product?.basePrice || 0, currency, exchangeRate)}
            </span>
            {product?.comparePrice && (
              <span className="text-sm font-medium text-slate-400 line-through mb-0.5">
                {formatPrice(product.comparePrice, currency, exchangeRate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} title="Quick View">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-4/5 bg-slate-50 rounded-2xl overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
              {product.category?.name || 'Category'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mb-4">{product.name}</h2>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {formatPrice(product.basePrice || 0, currency, exchangeRate)}
              </span>
              {product.comparePrice && (
                <span className="text-lg font-medium text-slate-400 line-through mb-1">
                  {formatPrice(product.comparePrice, currency, exchangeRate)}
                </span>
              )}
            </div>
            <p className="text-slate-600 mb-8 leading-relaxed">
              This is a quick preview of this premium product. For more details, specifications, and customer reviews, please view the full product page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 h-14 rounded-2xl shadow-xl shadow-primary/20 font-bold"
                onClick={() => {
                  setIsQuickViewOpen(false);
                  if (onAddToCart) onAddToCart(product.id);
                }}
              >
                Add to Cart
              </Button>
              <Link href={`/products/${product.slug}`} className="flex-1">
                 <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-slate-200" onClick={() => setIsQuickViewOpen(false)}>
                   Full Details
                 </Button>
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

