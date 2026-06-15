'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import { Package, MapPin, CreditCard, ChevronLeft, CheckCircle2, AlertCircle, Clock, Truck, Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/utils/price';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: Clock },
  { key: 'processing', label: 'Processing',    icon: Package },
  { key: 'shipped',    label: 'Shipped',        icon: Truck },
  { key: 'delivered',  label: 'Delivered',      icon: CheckCircle2 },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

function StatusTimeline({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === 'cancelled' || s === 'refunded') {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
        <span className="font-bold text-rose-700 capitalize">{s === 'refunded' ? 'Order Refunded' : 'Order Cancelled'}</span>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(s);

  return (
    <div className="flex items-start gap-0 w-full">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const isLast = idx === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                active
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                  : done
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider text-center leading-tight max-w-[60px] ${
                done ? 'text-primary' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full ${done && currentIdx > idx ? 'bg-primary' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-green-100 text-green-700 border border-green-200 uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Delivered</span>;
    case 'shipped':
      return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-widest"><Truck className="w-4 h-4" /> Shipped</span>;
    case 'cancelled':
      return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-widest"><AlertCircle className="w-4 h-4" /> Cancelled</span>;
    case 'refunded':
      return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-widest"><AlertCircle className="w-4 h-4" /> Refunded</span>;
    case 'pending':
      return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-yellow-100 text-yellow-700 border border-yellow-200 uppercase tracking-widest"><Clock className="w-4 h-4" /> Pending</span>;
    default:
      return <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-widest"><Clock className="w-4 h-4" /> Processing</span>;
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiGet<any>(`/orders/${orderId}`),
  });

  useEffect(() => {
    if (isError && !isAuthenticated) {
      router.replace(`/login?redirect=/orders/${orderId}`);
    }
  }, [isError, isAuthenticated, router, orderId]);

  if (isLoading || (isError && !isAuthenticated)) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-slate-500 font-semibold animate-pulse">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-24 text-center">
        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <p className="font-bold text-slate-500 text-lg">Order not found</p>
        <Link href="/orders" className="text-primary font-bold hover:underline mt-4 inline-block">Back to Orders</Link>
      </div>
    );
  }

  const orderTotal = Number(order.total ?? order.totalAmount ?? 0);
  const payment = order.payments?.[0];

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">

        <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md">
          <ChevronLeft className="h-4 w-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-1">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-slate-500 font-medium">
              Placed on{' '}
              <span className="font-bold text-slate-700">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </p>
          </div>
          <div className="shrink-0">{getStatusBadge(order.status)}</div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-6">
          <h2 className="font-black text-slate-900 mb-6">Order Progress</h2>
          <StatusTimeline status={order.status} />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><MapPin className="h-5 w-5" /></div>
              <h3 className="font-black text-slate-900">Delivery Address</h3>
            </div>
            {order.shippingAddress ? (
              <div className="text-sm text-slate-600 leading-relaxed space-y-0.5">
                <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="flex items-center gap-1.5 mt-2 text-slate-500 font-medium">
                    <Phone className="h-3.5 w-3.5" /> {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No address on record</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard className="h-5 w-5" /></div>
              <h3 className="font-black text-slate-900">Payment</h3>
            </div>
            {payment ? (
              <div className="text-sm space-y-2">
                <p className="font-bold text-slate-900 capitalize">
                  {payment.provider === 'cod' ? 'Cash on Delivery' : payment.provider}
                </p>
                <p className="text-slate-500">Amount: <span className="font-bold text-slate-900">{formatPrice(Number(payment.amount))}</span></p>
                <p className="text-slate-500">Currency: <span className="font-bold text-slate-900">{payment.currency}</span></p>
                <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 ${
                  payment.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {payment.status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No payment on record</p>
            )}
          </div>

          {/* Shipping Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Truck className="h-5 w-5" /></div>
              <h3 className="font-black text-slate-900">Shipping</h3>
            </div>
            <div className="text-sm space-y-1.5">
              <p className="font-bold text-slate-900">
                {order.status === 'delivered' ? 'Delivered'
                  : order.status === 'shipped' ? 'In Transit'
                  : order.status === 'cancelled' ? 'Cancelled'
                  : 'Awaiting Dispatch'}
              </p>
              <p className="text-slate-500">
                {order.shippingMethodName || 'Standard Delivery'}
                {Number(order.shippingFee) === 0 && ' · Free'}
              </p>
              {(order.status === 'shipped' || order.status === 'delivered') && (
                <p className="text-slate-500 mt-1">
                  Ref: <span className="font-bold text-primary">RI-{order.id.slice(0, 8).toUpperCase()}</span>
                </p>
              )}
              {order.history?.find((h: any) => h.status === 'shipped' && h.notes) && (
                <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2">
                  {order.history.find((h: any) => h.status === 'shipped').notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Items Ordered</h2>
          </div>

          <ul className="divide-y divide-slate-100">
            {order.items?.map((item: any) => {
              const imgUrl = item.product?.images?.find((i: any) => i.isPrimary)?.url
                || item.product?.images?.[0]?.url;
              const productSlug = item.product?.slug;
              const itemTotal = Number(item.price) * item.quantity;

              return (
                <li key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:bg-slate-50/40 transition-colors">
                  <div className="h-20 w-20 bg-slate-50 rounded-2xl relative overflow-hidden shrink-0 border border-slate-100">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={item.name || 'Product'} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Steel Kitchen</p>
                    {productSlug ? (
                      <Link href={`/products/${productSlug}`} className="font-bold text-lg text-slate-900 hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {item.name}
                      </Link>
                    ) : (
                      <p className="font-bold text-lg text-slate-900 line-clamp-2 leading-snug">{item.name}</p>
                    )}
                    {item.sku && <p className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</p>}
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                      {formatPrice(Number(item.price))} <span className="opacity-40">×</span> {item.quantity}
                    </p>
                  </div>
                  <div className="font-black text-slate-900 text-xl shrink-0">
                    {formatPrice(itemTotal)}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Totals */}
          <div className="p-6 sm:p-10 bg-slate-50 border-t border-slate-100">
            <div className="sm:ml-auto sm:w-80 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-bold">−{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span className="font-medium">{order.shippingMethodName || 'Shipping'}</span>
                <span className={`font-bold ${Number(order.shippingFee) === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {Number(order.shippingFee) === 0 ? 'Free' : formatPrice(Number(order.shippingFee))}
                </span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span className="font-medium">GST ({Number(order.taxRate ?? 0).toFixed(0)}%)</span>
                  <span className="font-bold text-slate-900">{formatPrice(Number(order.tax))}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="font-black text-slate-900 text-base">Total Paid</span>
                <span className="font-black text-primary text-3xl tracking-tight">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status History */}
        {order.history && order.history.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
            <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Status History</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {order.history.map((h: any) => (
                <li key={h.id} className="p-5 sm:p-6 flex items-start gap-4">
                  {getStatusBadge(h.status)}
                  <div className="flex-1 min-w-0">
                    {h.notes && <p className="text-sm text-slate-700 font-medium">{h.notes}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(h.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
