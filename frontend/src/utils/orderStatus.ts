import { Package, Clock, CheckCircle2, AlertCircle, Truck, Banknote, type LucideIcon } from 'lucide-react';

export interface OrderStatusMeta {
  label: string;
  icon: LucideIcon;
  colorClasses: string;
}

export function getOrderStatusMeta(status: string): OrderStatusMeta {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return { label: 'Delivered', icon: CheckCircle2, colorClasses: 'bg-green-100 text-green-700 border-green-200' };
    case 'shipped':
      return { label: 'Shipped', icon: Truck, colorClasses: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'cancelled':
      return { label: 'Cancelled', icon: AlertCircle, colorClasses: 'bg-rose-100 text-rose-700 border-rose-200' };
    case 'refunded':
      return { label: 'Refunded', icon: AlertCircle, colorClasses: 'bg-slate-100 text-slate-600 border-slate-200' };
    case 'pending':
      return { label: 'Pending', icon: Clock, colorClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    case 'partially_paid':
      return { label: 'Deposit Paid', icon: Banknote, colorClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    case 'processing':
    default:
      return { label: 'Processing', icon: Clock, colorClasses: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
}
