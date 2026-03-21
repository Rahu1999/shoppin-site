'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Search, Package, MoreVertical, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => apiGet<any>('/orders/admin/all?limit=100'),
  });

  if (isLoading) {
    return <div className="p-24 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  const orders = ordersData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input type="text" placeholder="Search by Order ID or Customer..." className="pl-9 h-10 w-full bg-white" />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 border-l-2 border-transparent group-hover:border-primary">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-primary transition-colors">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-xs text-slate-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">Paid</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                       order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                       order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                       order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                       'bg-orange-100 text-orange-700'}`}>
                        {order.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="inline-flex p-1.5 text-slate-400 hover:text-primary rounded opacity-0 group-hover:opacity-100 transition-opacity">
                       <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    No orders have been placed yet.
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
