'use client';

import { useParams } from 'next/navigation';
import { useProductDetail, useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { Star, ShieldCheck, Truck, ArrowLeft, Plus, Minus, ShoppingCart, Heart, Share2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { formatPrice } from '@/utils/price';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const { currency, exchangeRate } = useSettingsStore();
  const params = useParams();
  const productId = params.id as string;
  
  const { data: productData, isLoading, isError } = useProductDetail(productId);
  const product: any = productData;
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');

  // Related products query (mocking using category or general if no category)
  const { data: relatedData } = useProducts({ 
    category: product?.category?.id, 
    limit: 5 
  });
  const relatedProducts = relatedData?.items?.filter((p: any) => p.id !== product?.id).slice(0, 4) || [];

  // Initialize selected image with primary or first available
  useEffect(() => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img: any) => img.isPrimary);
      setSelectedImage(primary?.url || product.images[0].url);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary mb-4"></div>
        <p className="text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Not Found</h2>
        <p className="text-slate-500 mt-2 text-lg">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/products" className="mt-8 inline-block">
          <Button size="lg" className="rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate({ productId: product.id, quantity: qty });
  };
  
  const discount = (product.comparePrice && product.basePrice)
    ? Math.round(((Number(product.comparePrice) - Number(product.basePrice)) / Number(product.comparePrice)) * 100)
    : 0;

  return (
    <div className="bg-surface pt-8 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer w-fit">
          <Link href="/products" className="flex items-center gap-2">
             <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-slate-100 mb-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-20">
            
            {/* Image Gallery */}
            <div className="mb-10 lg:mb-0">
              <div className="aspect-4/5 sm:aspect-square bg-slate-50 rounded-2xl relative overflow-hidden group border border-slate-100">
                <Image 
                  src={selectedImage || product?.images?.[0]?.url || '/placeholder.png'} 
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  priority
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {discount}% OFF
                    </span>
                  )}
                  {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                      Only {product.stockQuantity} Left
                    </span>
                  )}
                </div>

                {/* Top Right Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                   <button className="h-10 w-10 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                     <Heart className="h-5 w-5" />
                   </button>
                   <button className="h-10 w-10 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors">
                     <Share2 className="h-5 w-5" />
                   </button>
                </div>
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                  {product.images.map((img: any, idx: number) => (
                    <button 
                      key={img.id || idx} 
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-2 overflow-hidden transition-all duration-300 ${selectedImage === img.url ? 'border-primary shadow-md ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <Image src={img.url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col pt-2">
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-xs font-black uppercase tracking-widest text-primary/80 bg-primary/5 px-2.5 py-1 rounded-md">
                   {product.category?.name || 'Premium Collection'}
                 </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-5">
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <span className="text-amber-600 font-bold text-sm leading-none pt-0.5">4.9</span>
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                </div>
                <span className="text-slate-400 text-sm font-medium hover:text-slate-600 hover:underline cursor-pointer">Read 128 Reviews</span>
              </div>

              <div className="mt-8 flex items-end gap-4">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {formatPrice(product.basePrice || 0, currency, exchangeRate)}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-slate-400 line-through font-medium mb-1.5">
                    {formatPrice(product.comparePrice, currency, exchangeRate)}
                  </span>
                )}
              </div>

              <p className="mt-6 text-slate-600 leading-relaxed text-lg min-h-16">
                {product.description || 'Experience premium quality with this exceptionally crafted product. Designed to elevate your daily routine, combining sleek aesthetics with unparalleled functionality.'}
              </p>

              <div className="mt-10 pt-8 border-t border-slate-100">
                 <p className="text-sm font-semibold text-slate-900 mb-4">Quantity</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 w-full sm:w-36 h-14 justify-between px-2">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors disabled:opacity-50" disabled={qty <= 1}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-slate-900">{qty}</span>
                      <button onClick={() => setQty(q => q + 1)} className="p-2 text-slate-500 hover:text-primary hover:bg-white rounded-lg transition-colors disabled:opacity-50" disabled={product.stockQuantity === 0}>
                        <Plus className="h-4 w-4" />
                      </button>
                   </div>

                   <Button 
                     onClick={handleAddToCart} 
                     disabled={addToCart.isPending || product.stockQuantity === 0}
                     className="flex-1 h-14 text-base font-bold shadow-xl shadow-primary/20 rounded-xl"
                   >
                     <ShoppingCart className="h-5 w-5 mr-2" />
                     {product.stockQuantity === 0 ? 'Out of Stock' : (addToCart.isPending ? 'Adding...' : 'Add to Cart')}
                   </Button>
                   
                   <Button 
                     variant="outline"
                     disabled={product.stockQuantity === 0}
                     className="flex-1 h-14 text-base font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                   >
                     <Zap className="h-5 w-5 mr-2 fill-current" />
                     Buy Now
                   </Button>
                 </div>
              </div>

               {/* Perks */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="bg-white p-2.5 rounded-lg shadow-sm">
                     <Truck className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-slate-900">Free Shipping</p>
                     <p className="text-xs text-slate-500 font-medium mt-0.5">On orders over $50</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="bg-white p-2.5 rounded-lg shadow-sm">
                     <ShieldCheck className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-slate-900">Secure Payment</p>
                     <p className="text-xs text-slate-500 font-medium mt-0.5">256-bit encryption</p>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tabbed Info Section */}
        <div className="mb-16">
          <div className="flex border-b border-slate-200 gap-8 overflow-x-auto custom-scrollbar">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-base font-bold capitalize whitespace-nowrap transition-colors relative ${
                  activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
          
          <div className="py-8 text-slate-600 leading-relaxed max-w-4xl">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description || 'This premium item combines functional intelligence with elegant design, suitable for any environment. The careful selection of materials ensures long-lasting durability, while the meticulously crafted exterior provides a striking visual profile.'}</p>
                <p>Designed with your lifestyle in mind, it seamlessly integrates into daily routines, offering enhanced comfort and usability. The intuitive features allow for effortless operation, making it a reliable companion for both work and play.</p>
                <ul className="list-disc pl-5 mt-6 space-y-2 text-slate-700 font-medium">
                  <li>Premium materials construction</li>
                  <li>Ergonomic and modern aesthetic</li>
                  <li>Industry-leading performance standards</li>
                  <li>Extended warranty included</li>
                </ul>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden max-w-2xl">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="py-3 px-4 bg-slate-50 font-semibold w-1/3">Brand</td><td className="py-3 px-4 font-medium text-slate-900">ModernShop</td></tr>
                    <tr><td className="py-3 px-4 bg-slate-50 font-semibold w-1/3">Model</td><td className="py-3 px-4 font-medium text-slate-900">P-{product.id?.slice(0,6).toUpperCase() || 'MOD'}</td></tr>
                    <tr><td className="py-3 px-4 bg-slate-50 font-semibold w-1/3">Weight</td><td className="py-3 px-4 font-medium text-slate-900">1.2 lbs</td></tr>
                    <tr><td className="py-3 px-4 bg-slate-50 font-semibold w-1/3">Dimensions</td><td className="py-3 px-4 font-medium text-slate-900">8.5" x 4.2" x 2.1"</td></tr>
                    <tr><td className="py-3 px-4 bg-slate-50 font-semibold w-1/3">Material</td><td className="py-3 px-4 font-medium text-slate-900">Aluminum alloy, Premium polymer</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
                 <div className="flex flex-col items-center">
                    <h3 className="text-5xl font-black text-slate-900 mb-2">4.9</h3>
                    <div className="flex text-amber-400 mb-2">
                      <Star className="h-6 w-6 fill-current" /><Star className="h-6 w-6 fill-current" /><Star className="h-6 w-6 fill-current" /><Star className="h-6 w-6 fill-current" /><Star className="h-6 w-6 fill-current opacity-30" />
                    </div>
                    <p className="text-slate-500 font-medium mb-8">Based on 128 Reviews</p>
                    <Button variant="outline" className="font-bold border-2 text-slate-700 hover:text-primary transition-colors hover:border-primary">Write a Review</Button>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-200 pt-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8 text-center sm:text-left">
              Customers Also Bought
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAddToCart={(id) => addToCart.mutate({ productId: id, quantity: 1 })}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

