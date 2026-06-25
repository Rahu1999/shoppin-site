'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Search, Package, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/utils/price';
import Link from 'next/link';
import { useState } from 'react';

const PAYMENT_BADGE: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  failed:    'bg-red-100 text-red-700',
};

const STATUS_CLASS = (status: string) => {
  if (status === 'delivered')      return 'bg-green-100 text-green-700';
  if (status === 'shipped')        return 'bg-blue-100 text-blue-700';
  if (status === 'cancelled')      return 'bg-red-100 text-red-700';
  if (status === 'pending')        return 'bg-yellow-100 text-yellow-700';
  if (status === 'partially_paid') return 'bg-indigo-100 text-indigo-700';
  return 'bg-orange-100 text-orange-700';
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => apiGet<any>('/orders/admin/all?limit=100'),
  });

  if (isLoading) {
    return <div className="p-24 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const allOrders: any[] = ordersData?.items || [];
  const orders = search.trim()
    ? allOrders.filter(o => {
        const q = search.toLowerCase();
        const name = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          name.includes(q) ||
          (o.user?.email || '').toLowerCase().includes(q)
        );
      })
    : allOrders;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by order ID, customer..."
              className="pl-9 h-10 w-full bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {orders.map((order: any) => {
            const payment = order.payments?.[0];
            const payStatus = payment?.status || (payment?.provider === 'cod' ? 'cod' : 'pending');
            const payLabel = payStatus === 'completed' ? 'Paid' : payStatus === 'cod' ? 'COD' : payStatus.charAt(0).toUpperCase() + payStatus.slice(1);
            const payClass = PAYMENT_BADGE[payStatus] || 'bg-slate-100 text-slate-600';

            return (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-bold text-slate-900 hover:text-primary text-sm transition-colors">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${payClass}`}>{payLabel}</span>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{order.user?.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_CLASS(order.status)}`}>
                      {order.status === 'partially_paid' ? 'Deposit Paid' : order.status}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{formatPrice(Number(order.totalAmount || order.total))}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">{search ? 'No orders match your search.' : 'No orders have been placed yet.'}</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order: any) => {
                const payment = order.payments?.[0];
                const payStatus = payment?.status || (payment?.provider === 'cod' ? 'cod' : 'pending');
                const payLabel = payStatus === 'completed' ? 'Paid' : payStatus === 'cod' ? 'COD' : payStatus.charAt(0).toUpperCase() + payStatus.slice(1);
                const payClass = PAYMENT_BADGE[payStatus] || 'bg-slate-100 text-slate-600';

                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 border-l-2 border-transparent group-hover:border-primary">
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-primary transition-colors">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs text-slate-500">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(Number(order.totalAmount || order.total))}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${payClass}`}>{payLabel}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_CLASS(order.status)}`}>
                        {order.status === 'partially_paid' ? 'Deposit Paid' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    {search ? 'No orders match your search.' : 'No orders have been placed yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
