'use client';

import { useFetchCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Tag, ShoppingBag, X, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/services/apiClient';
import { toast } from 'sonner';

import { formatPrice } from '@/utils/price';
import { useTaxConfig } from '@/hooks/useTaxConfig';
import { calculateGST } from '@/utils/tax';
import { useShippingConfig } from '@/hooks/useShippingConfig';
import { calculateShipping } from '@/utils/shipping';

export default function CartPage() {
  useFetchCart();
  const { items, total, appliedCoupon, setCoupon, clearCoupon } = useCartStore();
  const updateQuantity = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const { data: taxConfig } = useTaxConfig();
  const gstRate = taxConfig?.rate ?? 18;
  const { data: shippingConfig } = useShippingConfig();
  const [promoInput, setPromoInput] = useState('');

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const postDiscountTotal = Math.max(0, total - couponDiscount);
  const estimatedShipping = shippingConfig ? calculateShipping(postDiscountTotal, shippingConfig) : 99;
  const estimatedTax = calculateGST(postDiscountTotal, gstRate);

  const validateCoupon = useMutation({
    mutationFn: () => apiPost<any>('/coupons/validate', { code: promoInput.trim().toUpperCase(), orderValue: total }),
    onSuccess: (data) => {
      setCoupon({
        code: data.coupon.code,
        discount: data.discount,
        type: data.coupon.type,
        name: data.coupon.code,
      });
      setPromoInput('');
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Invalid coupon code');
    },
  });


  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="h-32 w-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
           <ShoppingBag className="h-14 w-14 text-slate-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Your Cart is Empty</h1>
        <p className="text-slate-500 mt-4 text-lg max-w-md">Looks like you haven't added anything to your cart yet. Discover our premium collection and find something you love.</p>
        <Link href="/products" className="inline-block mt-10">
          <Button size="lg" className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-10 flex items-center gap-4">
          Shopping Cart <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">{items.length} Items</span>
        </h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border text-left border-slate-100 rounded-3xl overflow-hidden shadow-sm p-2 sm:p-4">
              
              <div className="hidden sm:grid sm:grid-cols-12 pb-4 pt-2 px-6 font-bold text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-6 relative group transition-colors hover:bg-slate-50/50 rounded-2xl">
                    
                    {/* Product Info */}
                    <div className="sm:col-span-6 flex items-center gap-5">
                      <div className="h-28 w-28 sm:h-24 sm:w-24 bg-slate-50 rounded-2xl overflow-hidden relative shrink-0 border border-slate-100">
                        <Image 
                          src={(item.product as any)?.imageUrl || (item.product as any)?.images?.[0]?.url || '/placeholder.png'} 
                          alt={item.product?.name || 'Product'} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 pr-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                           {(item.product as any)?.category?.name || 'Premium Item'}
                        </span>
                        <Link href={`/products/${item.productId}`} className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
                          {item.product?.name}
                        </Link>
                        <p className="font-semibold text-slate-500 mt-2">
                           {formatPrice(Number(item.price))} <span className="text-xs font-medium opacity-50 block sm:inline mt-1 sm:mt-0">each</span>
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3 flex justify-between sm:justify-center items-center">
                      <span className="sm:hidden font-semibold text-slate-400 text-xs uppercase tracking-widest">Quantity</span>
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden h-10 w-28">
                        <button 
                          onClick={() => {
                            if (item.quantity > 1) updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                          }}
                          className="px-3 h-full text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1 || updateQuantity.isPending}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex-1 text-center text-sm font-bold text-slate-900 border-x border-slate-100">&nbsp;{item.quantity}&nbsp;</span>
                        <button 
                           onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                           className="px-3 h-full text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors disabled:opacity-50"
                           disabled={updateQuantity.isPending}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total Price & Mobile Remove */}
                    <div className="sm:col-span-3 flex justify-between sm:justify-end items-center sm:items-end flex-row sm:flex-col gap-2">
                      <span className="sm:hidden font-semibold text-slate-400 text-xs uppercase tracking-widest">Total</span>
                      <div className="text-right font-black text-slate-900 text-lg">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </div>
                      
                      {/* Desktop Remove Button */}
                      <button 
                        onClick={() => removeItem.mutate(item.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg hidden sm:block transition-all sm:mt-2"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                       {/* Mobile Remove button */}
                        <button 
                          onClick={() => removeItem.mutate(item.id)}
                          className="text-rose-500 text-xs font-bold flex items-center gap-1.5 sm:hidden px-3 py-1.5 bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl p-6 lg:p-8 sticky top-24 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
              
              <dl className="space-y-5 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <dt className="font-medium">Subtotal ({items.length} items)</dt>
                  <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <dt className="font-medium">Estimated Shipping</dt>
                  <dd className={`font-bold ${estimatedShipping === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                    {estimatedShipping === 0 ? 'Free' : formatPrice(estimatedShipping)}
                  </dd>
                </div>
                {estimatedShipping > 0 && shippingConfig?.freeAbove != null && (
                  <div className="text-xs text-green-600 font-medium -mt-3">
                    Add {formatPrice(shippingConfig.freeAbove - postDiscountTotal)} more for free shipping
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600">
                  <dt className="font-medium">{taxConfig?.name ?? 'GST'} ({gstRate}%)</dt>
                  <dd className="font-bold text-slate-900">{formatPrice(estimatedTax)}</dd>
                </div>

                {/* Promo Code section */}
                <div className="pt-5 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" /> Promo Code
                  </p>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                          <p className="text-xs text-green-600">-{formatPrice(appliedCoupon.discount)} saved</p>
                        </div>
                      </div>
                      <button onClick={clearCoupon} className="text-green-500 hover:text-red-500 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && promoInput.trim() && validateCoupon.mutate()}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-11"
                      />
                      <Button
                        variant="outline"
                        className="rounded-xl font-bold bg-white h-11 border-slate-200 hover:border-primary hover:text-primary shrink-0"
                        disabled={!promoInput.trim() || validateCoupon.isPending}
                        onClick={() => validateCoupon.mutate()}
                      >
                        {validateCoupon.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Coupon discount line */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-700">
                    <dt className="font-medium text-sm">Discount ({appliedCoupon.code})</dt>
                    <dd className="font-bold">-{formatPrice(appliedCoupon.discount)}</dd>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-5 mt-5 flex justify-between items-end">
                  <dt className="text-base font-bold text-slate-900">Estimated Total</dt>
                  <div className="text-right">
                    <dd className="text-3xl font-black text-primary tracking-tight">{formatPrice(postDiscountTotal + estimatedShipping + estimatedTax)}</dd>
                    <p className="text-xs text-slate-400 mt-1">Incl. {taxConfig?.name ?? 'GST'} + Shipping</p>
                  </div>
                </div>
              </dl>

              <div className="mt-8 space-y-4">
                <Link href="/checkout" className="block w-full">
                  <Button className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform group overflow-hidden relative">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       Proceed to Checkout <ArrowRight className="h-5 w-5" />
                    </span>
                  </Button>
                </Link>
                
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium text-center mt-6 p-4 bg-slate-50 rounded-xl">
                  <ShieldCheck className="h-4.5 w-4.5 text-green-600 shrink-0" />
                  <span>Secure SSL encrypted checkout.<br/>Money-back guarantee.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
