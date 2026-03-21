'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Package, MapPin, CreditCard, ChevronLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settingsStore';
import { formatPrice } from '@/utils/price';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { currency, exchangeRate } = useSettingsStore();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiGet<any>(`/orders/${orderId}`),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-green-100 text-green-700 shadow-sm border border-green-200 uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Delivered</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-blue-100 text-blue-700 shadow-sm border border-blue-200 uppercase tracking-widest"><Package className="w-4 h-4" /> Shipped</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-rose-100 text-rose-700 shadow-sm border border-rose-200 uppercase tracking-widest"><AlertCircle className="w-4 h-4" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-amber-100 text-amber-700 shadow-sm border border-amber-200 uppercase tracking-widest"><Clock className="w-4 h-4" /> Processing</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-primary rounded-full" />
          <p className="text-slate-500 font-semibold animate-pulse">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return <div className="p-24 text-center font-bold text-slate-500">Order not found</div>;

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <Link href="/orders" className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary mb-8 w-fit transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md">
          <ChevronLeft className="h-4 w-4" /> Back to Orders
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
             <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">
               Order #{order.id.slice(0, 8).toUpperCase()}
             </h1>
             <p className="text-slate-500 font-medium text-lg">
               Placed on <span className="font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
             </p>
          </div>
          <div className="shrink-0 flex items-center justify-start md:justify-end">
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {/* Summary Cards */}
           <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500"><MapPin className="w-24 h-24" /></div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl w-fit mb-5 shadow-inner ring-4 ring-blue-50/50"><MapPin className="h-6 w-6" /></div>
              <h3 className="font-black text-lg text-slate-900 mb-2">Shipping Address</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                <span className="text-slate-900 font-bold block mb-1">{order.shippingAddress?.fullName || 'Customer Name'}</span>
                {order.shippingAddress?.line1 || '123 Delivery Ln'}<br/>
                {order.shippingAddress?.city || 'New York'}, {order.shippingAddress?.state || 'NY'} {order.shippingAddress?.postalCode || '10001'}<br/>
                {order.shippingAddress?.country || 'US'}
              </p>
           </div>
           
           <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500"><CreditCard className="w-24 h-24" /></div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-5 shadow-inner ring-4 ring-emerald-50/50"><CreditCard className="h-6 w-6" /></div>
              <h3 className="font-black text-lg text-slate-900 mb-2">Payment Method</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                <span className="text-slate-900 font-bold block mb-1">Credit Card</span>
                Ends in **** 4242<br/>
                Status: <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded ml-1">Paid</span>
              </p>
           </div>

           <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500"><Package className="w-24 h-24" /></div>
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl w-fit mb-5 shadow-inner ring-4 ring-purple-50/50"><Package className="h-6 w-6" /></div>
              <h3 className="font-black text-lg text-slate-900 mb-2">Shipping Details</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                <span className="text-slate-900 font-bold block mb-1">Express Courier</span>
                Fully Insured Delivery<br/>
                Tracking: <span className="text-primary font-bold">TRK-{order.id.slice(0, 6).toUpperCase()}</span>
              </p>
           </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Items Ordered</h2>
          </div>
          
          <ul className="divide-y divide-slate-100">
            {order.items?.map((item: any) => (
              <li key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-slate-50/30 transition-colors">
                <div className="h-24 w-24 bg-slate-50 rounded-2xl relative overflow-hidden shrink-0 border border-slate-100">
                  <Image src={(item.product as any)?.imageUrl || (item.product as any)?.images?.[0]?.url || '/placeholder.png'} alt={item.product?.name || 'Product'} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                     {(item.product as any)?.category?.name || 'Premium Item'}
                  </span>
                  <Link href={`/products/${item.productId}`} className="font-bold text-lg text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {item.product?.name}
                  </Link>
                  <p className="text-slate-500 text-sm mt-2 font-medium">
                    {formatPrice(Number(item.price), currency, exchangeRate)} <span className="opacity-50">×</span> {item.quantity}
                  </p>
                </div>
                <div className="font-black text-slate-900 text-xl pt-2 sm:pt-0 shrink-0">
                  {formatPrice(Number(item.price) * item.quantity, currency, exchangeRate)}
                </div>
              </li>
            ))}
          </ul>

          <div className="p-6 sm:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
             <div className="w-full sm:w-auto text-sm font-medium text-slate-500 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Secure digital invoice
             </div>
             
             <div className="w-full sm:w-80 space-y-4">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatPrice(Number(order.totalAmount), currency, exchangeRate)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span className="font-medium">Shipping & Handling</span>
                  <span className="font-bold text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-slate-200">
                  <span className="font-black text-slate-900 text-lg uppercase tracking-widest text-[11px]">Total Paid</span>
                  <span className="font-black text-primary text-3xl tracking-tight">{formatPrice(Number(order.totalAmount), currency, exchangeRate)}</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
