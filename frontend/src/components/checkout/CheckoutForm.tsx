'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPost } from '@/services/apiClient';
import { formatPrice } from '@/utils/price';
import { useTaxConfig } from '@/hooks/useTaxConfig';
import { calculateGST } from '@/utils/tax';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Navigation, Plus, Banknote, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAddresses, addAddress, Address } from '@/services/userService';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  // UTs
  'Delhi','Chandigarh','Jammu & Kashmir','Ladakh','Puducherry',
  'Andaman & Nicobar Islands','Dadra & Nagar Haveli and Daman & Diu','Lakshadweep',
];

const FIELD = 'h-12 bg-white rounded-xl border-slate-200 text-sm';
const SELECT = 'w-full h-12 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

export function CheckoutForm() {
  const { items, total, clear } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { data: taxConfig } = useTaxConfig();
  const gstRate = taxConfig?.rate ?? 12;

  const [confirmed, setConfirmed] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{
    orderId: string;
    subtotal: number;
    tax: number;
    taxRate: number;
    discount: number;
    total: number;
    method: string;
  } | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');

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
    enabled: isAuthenticated,   // token is in localStorage immediately; user object may be null on refresh
  });

  // Pre-fill name from user account
  useEffect(() => {
    if (user) {
      setNewAddr(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
      }));
    }
  }, [user]);

  // Auto-select default / first saved address
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

      const res: any = await apiPost('/orders', payload);

      await apiPost(`/payments/${res.id}/process`, {
        amount: Number(res.total),
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'CREDIT_CARD',
        providerToken: paymentMethod === 'COD' ? 'cod' : 'mock_stripe_token_abc123',
      });

      return res;
    },
    onSuccess: (res: any) => {
      setConfirmedData({
        orderId: res.id,
        subtotal: Number(res.subtotal ?? total),
        tax: Number(res.tax ?? 0),
        taxRate: Number(res.taxRate ?? gstRate),
        discount: Number(res.discount ?? 0),
        total: Number(res.total ?? res.totalAmount ?? total),
        method: paymentMethod,
      });
      clear();
      setConfirmed(true);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to place order. Please try again.';
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

  // ── Confirmation ────────────────────────────────────────────────────────────
  if (confirmed && confirmedData) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Green header */}
        <div className="bg-green-50 border-b border-green-100 px-8 py-10 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-md ring-4 ring-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Order Confirmed!</h2>
          <p className="text-slate-500 text-sm font-medium">
            Order <span className="font-bold text-slate-700">#{confirmedData.orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* Summary rows */}
        <div className="px-8 py-6 space-y-3 border-b border-slate-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-900">{formatPrice(confirmedData.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Shipping</span>
            <span className="font-bold text-green-600">Free</span>
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
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="font-bold text-slate-900">Total Paid</span>
            <span className="text-2xl font-black text-primary tracking-tight">{formatPrice(confirmedData.total)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Payment</span>
            <span className="font-bold text-slate-700">
              {confirmedData.method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
            </span>
          </div>
        </div>

        <div className="px-8 py-6">
          <p className="text-sm text-slate-500 mb-5 text-center">
            You'll receive an email confirmation shortly. We'll notify you when your order ships.
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

  // ── Address validity check ──────────────────────────────────────────────────
  const newFormFilled = !!(
    newAddr.fullName && newAddr.phone && newAddr.line1 &&
    newAddr.city && newAddr.state && newAddr.postalCode
  );
  const canPlaceOrder = showNewForm ? newFormFilled : !!selectedAddressId;

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
          {/* Loading skeleton while addresses fetch */}
          {addressesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
              {[0, 1].map(i => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Saved address cards */}
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

          {/* New address form */}
          {!addressesLoading && showNewForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
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
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mobile Number</label>
                  <Input
                    type="tel"
                    value={newAddr.phone}
                    onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))}
                    placeholder="9870212660"
                    maxLength={10}
                    className={FIELD}
                    required
                  />
                </div>
                {/* Address line 1 */}
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
                {/* Address line 2 */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Landmark <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <Input
                    value={newAddr.line2}
                    onChange={e => setNewAddr(p => ({ ...p, line2: e.target.value }))}
                    placeholder="Near Oberoi Mall"
                    className={FIELD}
                  />
                </div>
                {/* City */}
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
                {/* Pincode */}
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
                {/* State */}
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
                {/* Country — locked */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Country</label>
                  <div className="h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center text-sm text-slate-500 font-medium select-none">
                    🇮🇳 India
                  </div>
                </div>
              </div>

              {/* Save to account checkbox */}
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
            <span className="shrink-0 text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase tracking-wide">
              Recommended
            </span>
          </label>

          {/* Online */}
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
              <p className="text-xs text-slate-500 mt-0.5">UPI, Debit / Credit Card, Net Banking.</p>
            </div>
          </label>
        </div>
      </div>

      {/* ── Place Order ── */}
      <Button
        type="button"
        onClick={() => placeOrder.mutate()}
        disabled={!canPlaceOrder || placeOrder.isPending}
        className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:translate-y-0"
        size="lg"
      >
        {placeOrder.isPending
          ? 'Placing your order...'
          : `Place Order · ${formatPrice(total + calculateGST(total, gstRate))}`}
      </Button>

      {!canPlaceOrder && showNewForm && (
        <p className="text-center text-xs text-slate-400 -mt-2">Fill in all required address fields to continue.</p>
      )}
    </div>
  );
}
