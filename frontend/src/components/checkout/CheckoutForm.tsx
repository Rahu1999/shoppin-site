'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiPost } from '@/services/apiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, MapPin, Plus, Navigation } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getAddresses } from '@/services/userService';

export function CheckoutForm() {
  const { items, total, clear } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', zip: '', country: 'US', phone: ''
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PAYPAL' | 'COD'>('CREDIT_CARD');
  
  const { data: addresses = [], isSuccess } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: !!user,
  });

  // Set default address if available once addresses are loaded
  useEffect(() => {
    if (isSuccess && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault && a.type === 'shipping');
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setShowNewAddressForm(false);
      } else {
        setSelectedAddressId(addresses[0].id);
        setShowNewAddressForm(false);
      }
    } else if (isSuccess && addresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [addresses, isSuccess]);

  const createOrder = useMutation({
    mutationFn: async () => {
      const payload: any = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
      };

      if (!showNewAddressForm && selectedAddressId) {
        payload.shippingAddressId = selectedAddressId;
      } else {
        payload.shippingAddress = {
          fullName: user?.firstName + ' ' + user?.lastName,
          phone: shippingAddress.phone || '0000000000',
          line1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zip,
          country: shippingAddress.country
        };
      }

      const res: any = await apiPost('/orders', payload);
      
      await apiPost(`/payments/${res.id}/process`, {
        amount: total,
        paymentMethod: paymentMethod,
        providerToken: paymentMethod === 'COD' ? 'cod' : 'mock_stripe_token_abc123'
      });

      return res;
    },
    onSuccess: () => {
      clear();
      setStep(3);
    }
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCheckout = () => {
    createOrder.mutate();
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
         <p className="text-slate-500 mb-6">Please add items to your cart before checking out.</p>
         <Button onClick={() => router.push('/products')} size="lg" className="rounded-xl">Go to Shop</Button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center">
        <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-50/50">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Order Confirmed!</h2>
        <p className="text-slate-500 text-lg max-w-md mb-8">Thank you for your purchase. We've received your order and will begin processing it shortly. You will receive an email confirmation.</p>
        <Button onClick={() => router.push('/products')} size="lg" className="h-14 px-8 font-bold shadow-xl shadow-primary/20 rounded-2xl">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Modern Stepper Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
        <div className="flex items-center max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-200 text-slate-500'}`}>1</div>
             <span className={`text-xs font-bold uppercase tracking-widest ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>Shipping</span>
          </div>
          <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${step >= 2 ? 'bg-primary/30' : 'bg-slate-200'}`}>
            <div className={`h-full bg-primary rounded-full transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-200 text-slate-500'}`}>2</div>
             <span className={`text-xs font-bold uppercase tracking-widest ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>Payment</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" /> Delivery Address
              </h2>
              {addresses.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-lg transition-colors hover:bg-primary/10 w-fit"
                >
                  <Plus className="h-4 w-4" /> {showNewAddressForm ? 'Select Saved Address' : 'Add New Address'}
                </button>
              )}
            </div>
            
            {!showNewAddressForm && addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <label 
                    key={addr.id}
                    className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="address" 
                      className="peer hidden" 
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-lg">{addr.fullName}</p>
                        {addr.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-black uppercase tracking-widest">Default</span>}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAddressId === addr.id ? 'border-primary' : 'border-slate-300 peer-hover:border-slate-400'}`}>
                        {selectedAddressId === addr.id && <div className="w-3 h-3 bg-primary rounded-full animate-in zoom-in" />}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-[90%]">{addr.line1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-3 flex items-center gap-1.5"><Navigation className="h-4 w-4" /> {addr.phone}</p>
                  </label>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">Street Address</label>
                    <Input required value={shippingAddress.street} onChange={(e) => setShippingAddress(p => ({...p, street: e.target.value}))} placeholder="123 Main St" className="h-14 bg-white rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                    <Input required value={shippingAddress.phone} onChange={(e) => setShippingAddress(p => ({...p, phone: e.target.value}))} placeholder="+1 (555) 000-0000" className="h-14 bg-white rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">City</label>
                    <Input required value={shippingAddress.city} onChange={(e) => setShippingAddress(p => ({...p, city: e.target.value}))} placeholder="New York" className="h-14 bg-white rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">State / Province</label>
                    <Input required value={shippingAddress.state} onChange={(e) => setShippingAddress(p => ({...p, state: e.target.value}))} placeholder="NY" className="h-14 bg-white rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ZIP / Postal Code</label>
                    <Input required value={shippingAddress.zip} onChange={(e) => setShippingAddress(p => ({...p, zip: e.target.value}))} placeholder="10001" className="h-14 bg-white rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Country</label>
                    <Input required value={shippingAddress.country} onChange={(e) => setShippingAddress(p => ({...p, country: e.target.value}))} placeholder="US" className="h-14 bg-white rounded-xl border-slate-200" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" className="w-full sm:w-auto h-14 px-10 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-transform" disabled={!showNewAddressForm && !selectedAddressId}>
                Continue to Payment
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-2">
              <CreditCard className="h-6 w-6 text-primary" /> Select Payment Method
            </h2>

            <div className="space-y-4">
              <label 
                className={`flex gap-5 items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setPaymentMethod('CREDIT_CARD')}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'border-primary' : 'border-slate-300'}`}>
                  {paymentMethod === 'CREDIT_CARD' && <div className="w-3 h-3 bg-primary rounded-full animate-in zoom-in" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">Credit Card</p>
                  <p className="text-sm text-slate-500">Pay securely with Visa, Mastercard, American Express.</p>
                </div>
              </label>

               <label 
                className={`flex gap-5 items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'PAYPAL' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setPaymentMethod('PAYPAL')}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'PAYPAL' ? 'border-primary' : 'border-slate-300'}`}>
                  {paymentMethod === 'PAYPAL' && <div className="w-3 h-3 bg-primary rounded-full animate-in zoom-in" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">PayPal</p>
                  <p className="text-sm text-slate-500">Fast and secure checkout via PayPal.</p>
                </div>
              </label>

              <label 
                className={`flex gap-5 items-center p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary' : 'border-slate-300'}`}>
                  {paymentMethod === 'COD' && <div className="w-3 h-3 bg-primary rounded-full animate-in zoom-in" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-lg">Cash on Delivery</p>
                  <p className="text-sm text-slate-500">Pay with cash upon delivery of your order.</p>
                </div>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-sm">
                  0% Fee
                </div>
              </label>
            </div>
            
            <div className="pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full sm:w-1/3 h-14 rounded-xl font-bold border-2 border-slate-200" size="lg">Back to Shipping</Button>
              <Button type="button" onClick={handleCheckout} disabled={createOrder.isPending} className="w-full sm:w-2/3 h-14 rounded-xl font-bold shadow-xl shadow-primary/20 text-lg transition-transform hover:-translate-y-0.5" size="lg">
                {createOrder.isPending ? 'Processing Securely...' : `Pay $${total.toFixed(2)}`}
              </Button>
            </div>
            
            {createOrder.isError && (
              <p className="text-rose-500 text-sm font-bold mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 rotate-45" /> Failed to process order. Please try again or use a different payment method.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
