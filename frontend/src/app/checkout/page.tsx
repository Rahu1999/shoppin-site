'use client';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatPrice } from '@/utils/price';
import Image from 'next/image';
import { ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const { currency, exchangeRate } = useSettingsStore();

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2 text-center md:text-left">Secure Checkout</h1>
        <p className="text-slate-500 mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-1.5 font-medium">
          <Lock className="h-4 w-4" /> 256-bit SSL encrypted checkout
        </p>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14 lg:items-start">
          <div className="lg:col-span-7 space-y-6">
            <CheckoutForm />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white border text-left border-slate-100 rounded-3xl overflow-hidden shadow-sm sticky top-24">
              <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-black text-xl text-slate-900">Order Summary</h3>
                 <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{items.length} Items</span>
              </div>
              
              <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto px-6 sm:px-8 border-b border-slate-100 custom-scrollbar">
                {items.map(item => (
                  <li key={item.id} className="py-5 flex items-start gap-4">
                    <div className="relative h-20 w-20 bg-slate-50 rounded-xl border border-slate-100 shrink-0 overflow-hidden">
                      <Image src={(item.product as any)?.imageUrl || (item.product as any)?.images?.[0]?.url || '/placeholder.png'} alt={item.product?.name || ''} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pr-2 pt-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block line-clamp-1">
                           {(item.product as any)?.category?.name || 'Premium Item'}
                       </span>
                      <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{item.product?.name}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-black text-slate-900 pt-1 shrink-0">
                      {formatPrice(Number(item.price) * item.quantity, currency, exchangeRate)}
                    </div>
                  </li>
                ))}
              </ul>

               <div className="p-6 sm:p-8 bg-white">
                  <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(total, currency, exchangeRate)}</span>
                  </div>
                   <div className="flex justify-between items-center mb-5 text-sm">
                    <span className="text-slate-500 font-medium">Shipping</span>
                    <span className="font-bold text-green-600">Free Full Insured</span>
                  </div>
                  <div className="flex justify-between items-end pt-5 border-t border-slate-100">
                    <span className="text-base font-bold text-slate-900">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-primary tracking-tight">{formatPrice(total, currency, exchangeRate)}</span>
                    </div>
                  </div>
               </div>

               {/* Trust Badges */}
               <div className="px-8 pb-8 bg-white flex flex-col gap-3">
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                   <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                   <p className="text-xs text-slate-600 font-medium leading-tight">Your order is protected by our 100% satisfaction guarantee.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
