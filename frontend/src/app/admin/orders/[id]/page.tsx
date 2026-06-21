'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/services/apiClient';
import { formatPrice } from '@/utils/price';
import { ChevronLeft, Package, MapPin, CreditCard, Clock, CheckCircle2, AlertCircle, Truck, Loader2, Banknote } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const ORDER_STATUSES = [
  { value: 'pending',        label: 'Pending',         color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'partially_paid', label: 'Deposit Paid',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'processing',     label: 'Processing',      color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'shipped',        label: 'Shipped',          color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'delivered',      label: 'Delivered',        color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'cancelled',      label: 'Cancelled',        color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'refunded',       label: 'Refunded',         color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

function getStatusMeta(status: string) {
  return ORDER_STATUSES.find(s => s.value === status?.toLowerCase()) || ORDER_STATUSES[0];
}

function StatusBadge({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  const icons: Record<string, React.ReactNode> = {
    delivered:      <CheckCircle2 className="w-4 h-4" />,
    shipped:        <Truck className="w-4 h-4" />,
    cancelled:      <AlertCircle className="w-4 h-4" />,
    refunded:       <AlertCircle className="w-4 h-4" />,
    pending:        <Clock className="w-4 h-4" />,
    processing:     <Clock className="w-4 h-4" />,
    partially_paid: <Banknote className="w-4 h-4" />,
  };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black border uppercase tracking-widest ${meta.color}`}>
      {icons[status?.toLowerCase()] || <Clock className="w-4 h-4" />}
      {meta.label}
    </span>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['adminOrder', orderId],
    queryFn: () => apiGet<any>(`/orders/admin/${orderId}`),
  });

  useEffect(() => {
    if (order && !selectedStatus) setSelectedStatus((order as any).status);
  }, [order, selectedStatus]);

  const updateStatus = useMutation({
    mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
      apiPatch(`/orders/admin/${orderId}/status`, { status, notes }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['adminOrder', orderId] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === order?.status) return;
    updateStatus.mutate({ status: selectedStatus, notes: adminNotes || undefined });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500 font-medium mb-4">Order not found.</p>
        <Link href="/admin/orders" className="text-primary font-bold hover:underline">Back to Orders</Link>
      </div>
    );
  }

  const currentStatusMeta = getStatusMeta(selectedStatus || order.status);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-black text-lg text-slate-900">Items Ordered</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {order.items?.map((item: any) => {
                const img = item.product?.images?.find((i: any) => i.isPrimary)?.url
                  || item.product?.images?.[0]?.url
                  || null;
                return (
                  <li key={item.id} className="p-5 flex items-center gap-5">
                    <div className="h-16 w-16 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm line-clamp-2">{item.name}</p>
                      {item.sku && <p className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</p>}
                      <p className="text-xs text-slate-500 mt-1">{formatPrice(Number(item.price))} × {item.quantity}</p>
                    </div>
                    <div className="font-black text-slate-900 shrink-0">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Totals */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold">{formatPrice(Number(order.subtotal || order.totalAmount || order.total))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-bold">-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span className="font-medium">Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200">
                <span className="font-black text-slate-900">Order Total</span>
                <span className="font-black text-slate-900 text-xl">{formatPrice(Number(order.total || order.totalAmount))}</span>
              </div>
              {order.isPartialPayment && (
                <>
                  <div className="flex justify-between text-sm text-indigo-600">
                    <span className="font-medium">Deposit</span>
                    <span className="font-bold">{formatPrice(Number(order.depositAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-emerald-600">Paid So Far</span>
                    <span className="font-bold text-emerald-600">{formatPrice(Number(order.amountPaid))}</span>
                  </div>
                  {Number(order.total) - Number(order.amountPaid) > 0.01 && (
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-indigo-700">Balance Due</span>
                      <span className="font-bold text-indigo-700">
                        {formatPrice(Math.round((Number(order.total) - Number(order.amountPaid)) * 100) / 100)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Status History */}
          {order.history && order.history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-black text-lg text-slate-900">Status History</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {order.history.map((h: any) => {
                  const meta = getStatusMeta(h.status);
                  return (
                    <li key={h.id} className="p-5 flex items-start gap-4">
                      <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <div className="flex-1">
                        {h.notes && <p className="text-sm text-slate-700 font-medium">{h.notes}</p>}
                        <p className="text-xs text-slate-400 mt-1">{new Date(h.createdAt).toLocaleString()}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Info + Status Update */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-slate-900">Customer</h3>
            <div>
              <p className="font-bold text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-sm text-slate-500">{order.user?.email}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <h3 className="font-black text-slate-900">Shipping Address</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900 block">{order.shippingAddress?.fullName}</span>
              {order.shippingAddress?.line1}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              {order.shippingAddress?.country}
              {order.shippingAddress?.phone && (
                <><br /><span className="text-slate-500">📞 {order.shippingAddress.phone}</span></>
              )}
            </p>
          </div>

          {/* Payment Info */}
          {order.payments?.[0] && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <h3 className="font-black text-slate-900">Payment</h3>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Method</span>
                  <span className="font-bold text-slate-900 uppercase">{order.payments[0].provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status</span>
                  <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${order.payments[0].status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {order.payments[0].status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Currency</span>
                  <span className="font-bold text-slate-900">{order.payments[0].currency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Partial Payment Summary */}
          {order.isPartialPayment && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-indigo-600" />
                <h3 className="font-black text-indigo-900">Partial Payment</h3>
              </div>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-medium">Order Total</span>
                  <span className="font-bold text-indigo-900">{formatPrice(Number(order.total))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-medium">Deposit Amount</span>
                  <span className="font-bold text-indigo-900">{formatPrice(Number(order.depositAmount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-medium">Paid So Far</span>
                  <span className="font-bold text-emerald-600">{formatPrice(Number(order.amountPaid))}</span>
                </div>
                {Number(order.total) - Number(order.amountPaid) > 0.01 && (
                  <div className="flex justify-between border-t border-indigo-200 pt-1.5">
                    <span className="font-black text-indigo-900">Balance Due</span>
                    <span className="font-black text-indigo-700">
                      {formatPrice(Math.round((Number(order.total) - Number(order.amountPaid)) * 100) / 100)}
                    </span>
                  </div>
                )}
                {Number(order.total) - Number(order.amountPaid) <= 0.01 && (
                  <p className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5 text-center">
                    Fully Paid
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-slate-900">Update Status</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">New Status</label>
              <select
                value={selectedStatus || order.status}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Admin Notes (optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Dispatched via BlueDart, AWB 123456"
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
              />
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={updateStatus.isPending || (selectedStatus || order.status) === order.status}
              className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {updateStatus.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                <>Update to <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${currentStatusMeta.color}`}>{currentStatusMeta.label}</span></>
              )}
            </button>
            {(selectedStatus || order.status) === order.status && (
              <p className="text-xs text-slate-400 text-center">Select a different status to update</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
