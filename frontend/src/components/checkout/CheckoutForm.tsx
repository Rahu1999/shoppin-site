'use client';

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPost, apiDelete } from '@/services/apiClient';
import { formatPrice } from '@/utils/price';
import { useTaxConfig } from '@/hooks/useTaxConfig';
import { calculateGST } from '@/utils/tax';
import { useShippingConfig } from '@/hooks/useShippingConfig';
import { calculateShipping } from '@/utils/shipping';
import { loadRazorpayScript } from '@/utils/loadRazorpay';
import { usePaymentGatewayConfig } from '@/hooks/usePaymentGatewayConfig';
import { calculateGatewayFee, gatewayFeeLabel } from '@/utils/gatewayFee';
import { usePartialPaymentConfig } from '@/hooks/usePartialPaymentConfig';
import { calculateDeposit, calculateBalance, isPartialPaymentEligible } from '@/utils/partialPayment';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, MapPin, Navigation, Plus, Banknote,
  CreditCard, ChevronDown, ChevronUp, Loader2, Layers,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAddresses, addAddress, Address } from '@/services/userService';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  'Delhi','Chandigarh','Jammu & Kashmir','Ladakh','Puducherry',
  'Andaman & Nicobar Islands','Dadra & Nagar Haveli and Daman & Diu','Lakshadweep',
];

const FIELD = 'h-12 bg-white rounded-xl border-slate-200 text-sm';
const SELECT = 'w-full h-12 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

interface CheckoutFormProps {
  paymentMethod: 'COD' | 'ONLINE' | 'PARTIAL';
  setPaymentMethod: (m: 'COD' | 'ONLINE' | 'PARTIAL') => void;
}

export function CheckoutForm({ paymentMethod, setPaymentMethod }: CheckoutFormProps) {
  const { items, total, appliedCoupon, clearCoupon, clear } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { data: taxConfig } = useTaxConfig();
  const gstRate = taxConfig?.rate ?? 18;
  const { data: shippingConfig } = useShippingConfig();
  const { data: gatewayConfig } = usePaymentGatewayConfig();
  const { data: partialConfig } = usePartialPaymentConfig();
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const postDiscountTotal = Math.max(0, total - couponDiscount);
  const shippingFeeEstimate = shippingConfig ? calculateShipping(postDiscountTotal, shippingConfig) : 99;

  const [confirmed, setConfirmed] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{
    orderId: string;
    subtotal: number;
    shippingFee: number;
    shippingMethodName?: string;
    tax: number;
    taxRate: number;
    discount: number;
    gatewayFee: number;
    total: number;
    method: string;
    depositAmount?: number;
  } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);
  // Tracks the order ID created before the Razorpay modal opens so we can
  // cancel it if the user dismisses without paying.
  const pendingOnlineOrderId = useRef<string | null>(null);

  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const { data: addresses = [], isSuccess, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (user) {
      setNewAddr(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isSuccess) return;
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
      setShowNewForm(false);
    } else {
      setShowNewForm(true);
    }
  }, [addresses, isSuccess]);

  const placeOrder = useMutation({
    mutationFn: async () => {
      // Optionally save the new address before placing order
      if (showNewForm && saveToAccount) {
        try {
          await addAddress({
            ...newAddr,
            type: 'shipping',
            isDefault: addresses.length === 0,
          } as Omit<Address, 'id'>);
        } catch {
          // Don't block order if address save fails
        }
      }

      const payload: any = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        paymentMethod,
      };

      if (!showNewForm && selectedAddressId) {
        payload.shippingAddressId = selectedAddressId;
      } else {
        payload.shippingAddress = {
          fullName: newAddr.fullName,
          phone: newAddr.phone,
          line1: newAddr.line1,
          line2: newAddr.line2 || undefined,
          city: newAddr.city,
          state: newAddr.state,
          postalCode: newAddr.postalCode,
          country: newAddr.country,
        };
      }

      // Step 1: Create the app order
      const res: any = await apiPost('/orders', payload);
      const orderId: string = res.id;

      // ── COD path ──────────────────────────────────────────────────────────
      if (paymentMethod === 'COD') {
        pendingOnlineOrderId.current = null;
        await apiPost(`/payments/${orderId}/process`, {
          amount: Number(res.total),
          paymentMethod: 'COD',
          currency: 'INR',
        });
        return res;
      }

      // ── Razorpay online path ───────────────────────────────────────────────

      // Load Razorpay checkout.js dynamically
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Could not load the payment gateway. Please check your internet connection and try again.');
      }

      // Track this order so we can cancel it if the user closes the modal
      pendingOnlineOrderId.current = orderId;

      // Step 2: Create payment order on our backend (returns key + gateway order id)
      const gwOrderData: any = await apiPost('/payments/create-order', { orderId });

      if (gwOrderData.gatewaySlug !== 'razorpay') {
        throw new Error(`Payment gateway "${gwOrderData.gatewaySlug}" is not yet supported in the browser. Please contact support.`);
      }

      // Step 3: Open Razorpay popup — wrap callback in a Promise so we can await it
      const selectedAddr = !showNewForm && selectedAddressId
        ? addresses.find(a => a.id === selectedAddressId)
        : null;
      const contactPhone = selectedAddr?.phone || newAddr.phone || '';

      const rzpResponse = await new Promise<RazorpayResponse>((resolve, reject) => {
        const options: RazorpayOptions = {
          key: gwOrderData.key,
          amount: gwOrderData.amount,
          currency: gwOrderData.currency,
          name: 'Rajesh Industries',
          description: `Order #${orderId.slice(0, 8).toUpperCase()}`,
          order_id: gwOrderData.gatewayOrderId,
          prefill: {
            name: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
            email: (user as any)?.email ?? '',
            contact: contactPhone,
          },
          theme: { color: '#1C1C1E' },
          handler: (response: RazorpayResponse) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });

      // Step 4: Verify payment signature on our backend
      await apiPost('/payments/verify', {
        orderId,
        gatewaySlug: gwOrderData.gatewaySlug,
        gatewayOrderId: gwOrderData.gatewayOrderId,
        razorpay_order_id: rzpResponse.razorpay_order_id,
        razorpay_payment_id: rzpResponse.razorpay_payment_id,
        razorpay_signature: rzpResponse.razorpay_signature,
      });

      return res;
    },

    onSuccess: (res: any) => {
      pendingOnlineOrderId.current = null;
      setConfirmedData({
        orderId: res.id,
        subtotal: Number(res.subtotal ?? total),
        shippingFee: Number(res.shippingFee ?? 0),
        shippingMethodName: res.shippingMethodName,
        tax: Number(res.tax ?? 0),
        taxRate: Number(res.taxRate ?? gstRate),
        discount: Number(res.discount ?? 0),
        gatewayFee: Number(res.gatewayFee ?? 0),
        total: Number(res.total ?? res.totalAmount ?? total),
        method: paymentMethod,
        depositAmount: paymentMethod === 'PARTIAL' ? Number(res.depositAmount) : undefined,
      });
      clearCoupon();
      clear();
      setConfirmed(true);
    },

    onError: (err: any) => {
      if (err?.message === 'Payment cancelled') {
        // Cancel the pending order so inventory is restored and no ghost order
        // lingers in the user's order list.
        const orderId = pendingOnlineOrderId.current;
        pendingOnlineOrderId.current = null;
        if (orderId) {
          apiDelete(`/orders/${orderId}/cancel`).catch(() => {});
        }
        toast.info('Payment was cancelled. Your order has not been placed.');
        return;
      }
      pendingOnlineOrderId.current = null;
      const msg = err?.response?.data?.message || err?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    },
  });

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (items.length === 0 && !confirmed) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
        <p className="text-slate-500 mb-6">Please add items to your cart before checking out.</p>
        <Button onClick={() => router.push('/products')} size="lg" className="rounded-xl">Go to Shop</Button>
      </div>
    );
  }

  // ── Order confirmed ─────────────────────────────────────────────────────────
  if (confirmed && confirmedData) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-8 py-10 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md ring-4 ring-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
            {confirmedData.method === 'COD' ? 'Order Placed!'
              : confirmedData.method === 'PARTIAL' ? 'Deposit Received!'
              : 'Payment Successful!'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Order <span className="font-bold text-slate-700">#{confirmedData.orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        <div className="px-8 py-6 space-y-3 border-b border-slate-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-900">{formatPrice(confirmedData.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">{confirmedData.shippingMethodName || 'Shipping'}</span>
            <span className={`font-bold ${confirmedData.shippingFee === 0 ? 'text-green-600' : 'text-slate-900'}`}>
              {confirmedData.shippingFee === 0 ? 'Free' : formatPrice(confirmedData.shippingFee)}
            </span>
          </div>
          {confirmedData.discount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Discount</span>
              <span className="font-bold text-emerald-600">−{formatPrice(confirmedData.discount)}</span>
            </div>
          )}
          {confirmedData.tax > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">GST ({confirmedData.taxRate}%)</span>
              <span className="font-bold text-slate-900">{formatPrice(confirmedData.tax)}</span>
            </div>
          )}
          {confirmedData.gatewayFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Gateway Charges</span>
              <span className="font-bold text-slate-900">{formatPrice(confirmedData.gatewayFee)}</span>
            </div>
          )}
          {confirmedData.method === 'PARTIAL' ? (
            <>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900">Order Total</span>
                <span className="text-xl font-black text-slate-700 tracking-tight">{formatPrice(confirmedData.total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-600 font-medium">Deposit Paid Now</span>
                <span className="font-black text-emerald-600 text-lg">{formatPrice(confirmedData.depositAmount ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-indigo-600 font-medium">Balance Due Before Dispatch</span>
                <span className="font-bold text-indigo-600">
                  {formatPrice(confirmedData.total - (confirmedData.depositAmount ?? 0))}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">Total {confirmedData.method === 'COD' ? 'Payable' : 'Paid'}</span>
              <span className="text-2xl font-black text-primary tracking-tight">{formatPrice(confirmedData.total)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Payment</span>
            <span className="font-bold text-slate-700">
              {confirmedData.method === 'COD' ? 'Cash on Delivery'
                : confirmedData.method === 'PARTIAL' ? 'Partial Payment (Deposit + Balance)'
                : 'Paid Online (Razorpay)'}
            </span>
          </div>
        </div>

        <div className="px-8 py-6">
          <p className="text-sm text-slate-500 mb-5 text-center">
            {confirmedData.method === 'COD'
              ? "We'll notify you when your order is shipped. Pay in cash on delivery."
              : confirmedData.method === 'PARTIAL'
              ? "Deposit received! Pay the balance from your order details page before dispatch."
              : "Payment confirmed! We'll notify you when your order is shipped."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => router.push('/orders')} className="flex-1 h-12 rounded-xl font-bold">
              View My Orders
            </Button>
            <Button onClick={() => router.push('/products')} className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const newFormFilled = !!(
    newAddr.fullName && newAddr.phone && newAddr.line1 &&
    newAddr.city && newAddr.state && newAddr.postalCode
  );
  const canPlaceOrder = showNewForm ? newFormFilled : !!selectedAddressId;

  const preGatewayTotal = postDiscountTotal + shippingFeeEstimate + calculateGST(postDiscountTotal, gstRate);
  const gatewayFeeEstimate = (paymentMethod === 'ONLINE' || paymentMethod === 'PARTIAL') && gatewayConfig
    ? calculateGatewayFee(preGatewayTotal, gatewayConfig)
    : 0;
  const orderTotal = preGatewayTotal + gatewayFeeEstimate;

  // Partial payment is always charged online, so its preview must include the
  // gateway fee even while COD is the selected method — the backend computes
  // the deposit from the fee-inclusive total.
  const partialTotal = gatewayConfig
    ? preGatewayTotal + calculateGatewayFee(preGatewayTotal, gatewayConfig)
    : preGatewayTotal;
  const isPartialEligible = partialConfig ? isPartialPaymentEligible(preGatewayTotal, partialConfig) : false;
  const depositEstimate = partialConfig ? calculateDeposit(partialTotal, partialConfig) : 0;
  const balanceEstimate = calculateBalance(partialTotal, depositEstimate);

  const buttonLabel = placeOrder.isPending
    ? (paymentMethod === 'COD' ? 'Placing your order...' : 'Opening payment...')
    : (paymentMethod === 'COD'
        ? `Place Order · ${formatPrice(orderTotal)}`
        : paymentMethod === 'PARTIAL'
        ? `Pay Deposit · ${formatPrice(depositEstimate)}`
        : `Pay Online · ${formatPrice(orderTotal)}`);

  // ── Main checkout ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Delivery Address ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Delivery Address
          </h2>
          {addresses.length > 0 && (
            <button
              type="button"
              onClick={() => setShowNewForm(v => !v)}
              className="text-sm font-bold text-primary flex items-center gap-1.5 hover:underline"
            >
              {showNewForm ? (
                <><ChevronUp className="h-4 w-4" /> Saved addresses</>
              ) : (
                <><Plus className="h-4 w-4" /> Use different address</>
              )}
            </button>
          )}
        </div>

        <div className="p-6">
          {addressesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
              {[0, 1].map(i => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          )}

          {!addressesLoading && !showNewForm && addresses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {addresses.map(addr => (
                <label
                  key={addr.id}
                  className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="hidden"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{addr.fullName}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black uppercase tracking-widest">
                          Default
                        </span>
                      )}
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedAddressId === addr.id ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {selectedAddressId === addr.id && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}, {addr.state} – {addr.postalCode}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Navigation className="h-3 w-3" /> {addr.phone}
                  </p>
                </label>
              ))}
            </div>
          )}

          {!addressesLoading && showNewForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
                  <Input
                    value={newAddr.fullName}
                    onChange={e => setNewAddr(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Rahul Sharma"
                    className={FIELD}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mobile Number</label>
                  <Input
                    type="tel"
                    value={newAddr.phone}
                    onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="9870212660"
                    maxLength={10}
                    className={FIELD}
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Flat / House No., Street, Area</label>
                  <Input
                    value={newAddr.line1}
                    onChange={e => setNewAddr(p => ({ ...p, line1: e.target.value }))}
                    placeholder="12B, Sonawala Road, Goregaon East"
                    className={FIELD}
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Landmark <span className="text-slate-400 normal-case font-normal">(optional)</span>
                  </label>
                  <Input
                    value={newAddr.line2}
                    onChange={e => setNewAddr(p => ({ ...p, line2: e.target.value }))}
                    placeholder="Near Oberoi Mall"
                    className={FIELD}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">City</label>
                  <Input
                    value={newAddr.city}
                    onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))}
                    placeholder="Mumbai"
                    className={FIELD}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">PIN Code</label>
                  <Input
                    value={newAddr.postalCode}
                    onChange={e => setNewAddr(p => ({ ...p, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="400063"
                    maxLength={6}
                    className={FIELD}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">State</label>
                  <select
                    value={newAddr.state}
                    onChange={e => setNewAddr(p => ({ ...p, state: e.target.value }))}
                    className={SELECT}
                    required
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Country</label>
                  <div className="h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center text-sm text-slate-500 font-medium select-none">
                    🇮🇳 India
                  </div>
                </div>
              </div>

              {user && (
                <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                  <input
                    type="checkbox"
                    checked={saveToAccount}
                    onChange={e => setSaveToAccount(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary accent-primary cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                    Save this address to my account
                  </span>
                </label>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Payment Method
          </h2>
        </div>
        <div className="p-6 space-y-3">

          {/* COD */}
          <label
            onClick={() => setPaymentMethod('COD')}
            className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
              paymentMethod === 'COD'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              paymentMethod === 'COD' ? 'border-primary' : 'border-slate-300'
            }`}>
              {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
            </div>
            <Banknote className={`h-6 w-6 shrink-0 ${paymentMethod === 'COD' ? 'text-primary' : 'text-slate-400'}`} />
            <div className="flex-1">
              <p className="font-bold text-slate-900">Cash on Delivery</p>
              <p className="text-xs text-slate-500 mt-0.5">Pay in cash when your order arrives. No extra charges.</p>
            </div>
          </label>

          {/* Online (Razorpay) */}
          <label
            onClick={() => setPaymentMethod('ONLINE')}
            className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
              paymentMethod === 'ONLINE'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              paymentMethod === 'ONLINE' ? 'border-primary' : 'border-slate-300'
            }`}>
              {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
            </div>
            <CreditCard className={`h-6 w-6 shrink-0 ${paymentMethod === 'ONLINE' ? 'text-primary' : 'text-slate-400'}`} />
            <div className="flex-1">
              <p className="font-bold text-slate-900">Online Payment</p>
              <p className="text-xs text-slate-500 mt-0.5">UPI, Debit / Credit Card, Net Banking — powered by Razorpay.</p>
            </div>
            <span className="shrink-0 text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-wide">
              Recommended
            </span>
          </label>

          {paymentMethod === 'ONLINE' && (
            <div className="space-y-1.5 px-1">
              <p className="text-xs text-slate-400 leading-relaxed">
                You will be redirected to Razorpay&apos;s secure checkout after clicking &quot;Pay Online&quot;. Your card details are never stored on our servers.
              </p>
              {gatewayConfig && gatewayConfig.isEnabled && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  <span className="text-xs text-amber-700 font-medium">
                    {gatewayFeeLabel(gatewayConfig)}
                  </span>
                  <span className="text-xs font-bold text-amber-800">+{formatPrice(gatewayFeeEstimate)}</span>
                </div>
              )}
            </div>
          )}

          {/* Partial Payment (Deposit + Balance) */}
          {isPartialEligible && partialConfig && (
            <label
              onClick={() => setPaymentMethod('PARTIAL')}
              className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                paymentMethod === 'PARTIAL'
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                paymentMethod === 'PARTIAL' ? 'border-indigo-500' : 'border-slate-300'
              }`}>
                {paymentMethod === 'PARTIAL' && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
              </div>
              <Layers className={`h-6 w-6 shrink-0 ${paymentMethod === 'PARTIAL' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div className="flex-1">
                <p className="font-bold text-slate-900">{partialConfig.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pay {formatPrice(depositEstimate)} now,{' '}
                  {formatPrice(balanceEstimate)} before dispatch.
                </p>
              </div>
            </label>
          )}

          {paymentMethod === 'PARTIAL' && (
            <div className="space-y-2 px-1">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-indigo-700">Pay Now (Deposit)</span>
                  <span className="font-bold text-indigo-800">{formatPrice(depositEstimate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500">Balance Due Before Dispatch</span>
                  <span className="font-bold text-slate-700">{formatPrice(balanceEstimate)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay the deposit now to confirm your order. The remaining balance is due before we dispatch your items.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Place / Pay button ── */}
      <Button
        type="button"
        onClick={() => placeOrder.mutate()}
        disabled={!canPlaceOrder || placeOrder.isPending}
        className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:translate-y-0"
        size="lg"
      >
        {placeOrder.isPending && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
        {buttonLabel}
      </Button>

      {!canPlaceOrder && showNewForm && (
        <p className="text-center text-xs text-slate-400 -mt-2">Fill in all required address fields to continue.</p>
      )}
    </div>
  );
}
