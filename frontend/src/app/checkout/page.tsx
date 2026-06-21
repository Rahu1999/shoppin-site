'use client';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/price';
import Image from 'next/image';
import { ShieldCheck, Lock, Tag } from 'lucide-react';
import { useTaxConfig } from '@/hooks/useTaxConfig';
import { calculateGST } from '@/utils/tax';
import { useShippingConfig } from '@/hooks/useShippingConfig';
import { calculateShipping } from '@/utils/shipping';
import { usePaymentGatewayConfig } from '@/hooks/usePaymentGatewayConfig';
import { calculateGatewayFee, gatewayFeeLabel } from '@/utils/gatewayFee';
import { usePartialPaymentConfig } from '@/hooks/usePartialPaymentConfig';
import { calculateDeposit, calculateBalance, isPartialPaymentEligible } from '@/utils/partialPayment';

export default function CheckoutPage() {
  const { items, total, appliedCoupon } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE' | 'PARTIAL'>('ONLINE');

  const { data: taxConfig } = useTaxConfig();
  const gstRate = taxConfig?.rate ?? 12;
  const { data: shippingConfig } = useShippingConfig();
  const { data: gatewayConfig } = usePaymentGatewayConfig();
  const { data: partialConfig } = usePartialPaymentConfig();

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const postDiscountTotal = Math.max(0, total - couponDiscount);
  const shippingFee = shippingConfig ? calculateShipping(postDiscountTotal, shippingConfig) : 99;
  const estimatedTax = calculateGST(postDiscountTotal, gstRate);
  const preGatewayTotal = postDiscountTotal + shippingFee + estimatedTax;
  const estimatedGatewayFee = (paymentMethod === 'ONLINE' || paymentMethod === 'PARTIAL') && gatewayConfig
    ? calculateGatewayFee(preGatewayTotal, gatewayConfig)
    : 0;
  const orderTotal = preGatewayTotal + estimatedGatewayFee;

  const partialEligible = partialConfig ? isPartialPaymentEligible(preGatewayTotal, partialConfig) : false;
  const depositForSidebar = paymentMethod === 'PARTIAL' && partialConfig
    ? calculateDeposit(orderTotal, partialConfig)
    : 0;
  const balanceForSidebar = paymentMethod === 'PARTIAL'
    ? calculateBalance(orderTotal, depositForSidebar)
    : 0;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login?redirect=/checkout');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2 text-center md:text-left">Secure Checkout</h1>
        <p className="text-slate-500 mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-1.5 font-medium">
          <Lock className="h-4 w-4" /> 256-bit SSL encrypted checkout
        </p>

        <div className={`lg:grid lg:gap-10 xl:gap-14 lg:items-start ${items.length > 0 ? 'lg:grid-cols-12' : ''}`}>
          <div className={items.length > 0 ? 'lg:col-span-7 space-y-6' : 'max-w-xl mx-auto w-full'}>
            <CheckoutForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          </div>

          {/* Order Summary Sidebar — hidden after order is placed */}
          {items.length > 0 && <div className="lg:col-span-5 mt-8 lg:mt-0">
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
                      {formatPrice(Number(item.price) * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>

               <div className="p-6 sm:p-8 bg-white space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-900">{formatPrice(total)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-700">
                      <span className="font-medium flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}
                      </span>
                      <span className="font-bold">-{formatPrice(appliedCoupon.discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{shippingConfig?.name ?? 'Shipping'}</span>
                    <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                      {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{taxConfig?.name ?? 'GST'} ({gstRate}%)</span>
                    <span className="font-bold text-slate-900">{formatPrice(estimatedTax)}</span>
                  </div>

                  {estimatedGatewayFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium text-xs leading-tight">
                        {gatewayConfig ? gatewayFeeLabel(gatewayConfig) : 'Gateway Charges'}
                        <span className="block text-slate-400 font-normal">Online payment only</span>
                      </span>
                      <span className="font-bold text-slate-900">{formatPrice(estimatedGatewayFee)}</span>
                    </div>
                  )}

                  {paymentMethod === 'PARTIAL' && partialEligible && (
                    <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Partial Payment</p>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Pay Now (Deposit)</span>
                        <span className="font-black text-indigo-600">{formatPrice(depositForSidebar)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Balance Due Later</span>
                        <span className="font-bold text-slate-500">{formatPrice(balanceForSidebar)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <span className="text-base font-bold text-slate-900">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-primary tracking-tight">{formatPrice(orderTotal)}</span>
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
          </div>}
        </div>
      </div>
    </div>
  );
}
