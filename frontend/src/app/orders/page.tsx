'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Package, Clock, CheckCircle2, AlertCircle, ChevronRight, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { formatPrice } from '@/utils/price';
import { Button } from '@/components/ui/Button';

export default function OrdersPage() {

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiGet<any>('/orders'),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-primary rounded-full" />
          <p className="text-slate-500 font-semibold animate-pulse">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const orders = data?.items || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow-sm border border-green-200 uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shadow-sm border border-blue-200 uppercase tracking-widest"><Package className="w-3.5 h-3.5" /> Shipped</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 shadow-sm border border-rose-200 uppercase tracking-widest"><AlertCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 shadow-sm border border-amber-200 uppercase tracking-widest"><Clock className="w-3.5 h-3.5" /> Processing</span>;
    }
  };

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-primary shrink-0" /> Your Orders
          </h1>
          {orders.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Search orders..." className="w-full sm:w-64 pl-10 h-12 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-slate-50/50">
               <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">No Orders Yet</h2>
            <p className="text-slate-500 mt-2 max-w-sm mb-8">You haven't placed any orders. Start exploring our premium collection to find something great.</p>
            <Link href="/products">
               <Button size="lg" className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white border text-left border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                
                {/* Order Header */}
                <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-4 text-sm w-full sm:w-auto">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Order Placed</p>
                      <p className="font-bold text-slate-900 text-base">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Total</p>
                      <p className="font-bold text-slate-900 text-base">{formatPrice(Number(order.totalAmount))}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Order ID</p>
                      <p className="font-bold text-slate-700 text-base">#{order.id.slice(0,8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex justify-end">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Body / Preview */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                  <div className="flex gap-4 overflow-hidden overflow-x-auto pb-2 sm:pb-0 custom-scrollbar sm:max-w-[60%] lg:max-w-[70%] text-left">
                     {/* Preview up to 5 items */}
                     {order.items?.slice(0, 5).map((item: any) => (
                       <div key={item.id} className="relative h-20 w-20 bg-slate-50 rounded-xl border border-slate-100 shrink-0 overflow-hidden group-hover:border-slate-200 transition-colors">
                          <Image 
                            src={(item.product as any)?.imageUrl || (item.product as any)?.images?.[0]?.url || '/placeholder.png'} 
                            alt={item.product?.name || 'Product Image'} 
                            fill 
                            className="object-cover"
                          />
                          {item.quantity > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                              {item.quantity}
                            </span>
                          )}
                       </div>
                     ))}
                     {order.items?.length > 5 && (
                       <div className="h-20 w-20 bg-slate-50 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center text-slate-500 font-black text-lg group-hover:border-slate-200 transition-colors">
                         +{order.items.length - 5}
                       </div>
                     )}
                  </div>
                  
                  <div className="flex sm:flex-col gap-3 justify-end sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <Link href={`/orders/${order.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full rounded-xl font-bold bg-white h-12 px-6 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm">
                         View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
