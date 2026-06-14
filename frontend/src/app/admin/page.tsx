'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { DollarSign, ShoppingBag, Users, ListOrdered, ArrowUpRight, TrendingUp, Package, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/utils/price';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  processing: 'bg-amber-50 text-amber-700 border border-amber-100',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-100',
  delivered: 'bg-green-50 text-green-700 border border-green-100',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-100',
  refunded: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export default function AdminDashboardPage() {
  const user = useAuthStore(s => s.user);

  const { data: ordersData } = useQuery({
    queryKey: ['adminOrders', 'dashboard'],
    queryFn: () => apiGet<any>('/orders/admin/all?limit=5'),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => apiGet<any>('/products?limit=5'),
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers', 'dashboard'],
    queryFn: () => apiGet<any>('/users?limit=1'),
  });

  const recentOrders = ordersData?.items || [];
  const topProducts = productsData?.items || [];
  const totalOrders = ordersData?.meta?.total ?? '—';
  const totalProducts = productsData?.meta?.total ?? '—';
  const totalCustomers = usersData?.meta?.total ?? '—';
  const totalRevenue = recentOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || o.total || 0), 0);

  const stats = [
    { title: 'Recent Revenue', value: formatPrice(totalRevenue), icon: <DollarSign className="w-6 h-6 text-white" />, note: 'Last 5 orders', bg: 'bg-slate-900', shadow: 'shadow-slate-900/20' },
    { title: 'Total Orders', value: String(totalOrders), icon: <ListOrdered className="w-6 h-6 text-white" />, note: 'All time', bg: 'bg-blue-600', shadow: 'shadow-blue-600/20' },
    { title: 'Total Customers', value: String(totalCustomers), icon: <Users className="w-6 h-6 text-white" />, note: 'Registered users', bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/20' },
    { title: 'Products Listed', value: String(totalProducts), icon: <ShoppingBag className="w-6 h-6 text-white" />, note: 'Active listings', bg: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user?.firstName || 'Admin'}. Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/orders" className="h-11 px-5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
            <ListOrdered className="w-4 h-4" /> All Orders
          </Link>
          <Link href="/admin/products" className="h-11 px-5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-colors flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Manage Products
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3.5 rounded-2xl ${stat.bg} shadow-lg ${stat.shadow} group-hover:-translate-y-1 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg">{stat.note}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-900">Recent Orders</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Latest 5 orders across your store</p>
            </div>
            <Link href="/admin/orders" className="h-9 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-colors shadow-sm">
              View All <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex-1 p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black bg-white">
                  <th className="p-6 font-semibold">Order ID</th>
                  <th className="p-6 font-semibold">Customer</th>
                  <th className="p-6 font-semibold">Status</th>
                  <th className="p-6 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 text-sm font-medium">No orders yet</td>
                  </tr>
                ) : recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="p-6 font-bold text-slate-900 text-sm">
                      <Link href={`/admin/orders/${order.id}`} className="group-hover:text-primary transition-colors font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-900 text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs text-slate-500">{order.user?.email}</p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${STATUS_CLASSES[order.status] || STATUS_CLASSES.processing}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 font-black text-slate-900 text-right">{formatPrice(Number(order.totalAmount || order.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900">Products</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Latest listings</p>
            </div>
            <Link href="/admin/products" className="h-9 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary hover:border-primary transition-colors shadow-sm">
              Manage <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-6 sm:p-8 flex-1 flex flex-col gap-5">
            {topProducts.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No products yet</p>
            ) : topProducts.map((product: any) => {
              const img = product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url;
              return (
                <div key={product.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="h-14 w-14 bg-slate-50 rounded-2xl shrink-0 border border-slate-100 overflow-hidden group-hover:border-primary/30 transition-colors">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">{product.name}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{product.category?.name || 'Uncategorized'}</p>
                  </div>
                  <div className="font-black text-slate-900 text-sm shrink-0">
                    {formatPrice(Number(product.basePrice))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
