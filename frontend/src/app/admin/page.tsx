import { DollarSign, ShoppingBag, Users, ListOrdered, ArrowUpRight, ArrowDownRight, TrendingUp, Package, MoreHorizontal } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Revenue', value: '$124,563.00', icon: <DollarSign className="w-6 h-6 text-white" />, trend: '+12.5%', trendIcon: <ArrowUpRight className="w-3 h-3" />, trendColor: 'text-emerald-500', isPositive: true, bg: 'bg-slate-900', shadow: 'shadow-slate-900/20' },
    { title: 'Active Orders', value: '842', icon: <ListOrdered className="w-6 h-6 text-white" />, trend: '+4.2%', trendIcon: <ArrowUpRight className="w-3 h-3" />, trendColor: 'text-emerald-500', isPositive: true, bg: 'bg-blue-600', shadow: 'shadow-blue-600/20' },
    { title: 'Total Customers', value: '45,231', icon: <Users className="w-6 h-6 text-white" />, trend: '-2.1%', trendIcon: <ArrowDownRight className="w-3 h-3" />, trendColor: 'text-rose-500', isPositive: false, bg: 'bg-indigo-600', shadow: 'shadow-indigo-600/20' },
    { title: 'Products Listed', value: '1,249', icon: <ShoppingBag className="w-6 h-6 text-white" />, trend: '+8.4%', trendIcon: <ArrowUpRight className="w-3 h-3" />, trendColor: 'text-emerald-500', isPositive: true, bg: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
         <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">Dashboard Overview</h1>
            <p className="text-slate-500 font-medium">Welcome back, Admin. Here's what's happening with your store today.</p>
         </div>
         <div className="flex gap-3">
            <button className="h-11 px-5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
               Export Report
            </button>
            <button className="h-11 px-5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Sales Analytics
            </button>
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
              <div className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-slate-50 ${stat.trendColor}`}>
                {stat.trendIcon} {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Stub */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Recent Orders</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Latest transactions across your store</p>
              </div>
              <button className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm">
                 <MoreHorizontal className="h-5 w-5" />
              </button>
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
                 {[
                    { id: '#ORD-8X9D', customer: 'Emma Watson', email: 'emma@example.com', status: 'Delivered', amount: '$1,299.00', color: 'green' },
                    { id: '#ORD-7V2A', customer: 'John Smith', email: 'john@example.com', status: 'Processing', amount: '$45.00', color: 'amber' },
                    { id: '#ORD-9B5F', customer: 'Sarah Connor', email: 'sarah@example.com', status: 'Shipped', amount: '$349.50', color: 'blue' },
                    { id: '#ORD-3N1M', customer: 'Bruce Wayne', email: 'bruce@example.com', status: 'Delivered', amount: '$4,500.00', color: 'green' },
                    { id: '#ORD-1K8L', customer: 'Clark Kent', email: 'clark@example.com', status: 'Cancelled', amount: '$12.99', color: 'rose' },
                 ].map((order, i) => (
                   <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="p-6 font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{order.id}</td>
                      <td className="p-6">
                        <p className="font-bold text-slate-900 text-sm">{order.customer}</p>
                        <p className="text-xs text-slate-500">{order.email}</p>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-${order.color}-50 text-${order.color}-700 border border-${order.color}-100`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 font-black text-slate-900 text-right">{order.amount}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
        
        {/* Top Products Stub */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">Top Products</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Best selling items this week</p>
           </div>
           <div className="p-6 sm:p-8 flex-1 flex flex-col gap-6">
             {[
               { name: 'MacBook Pro 16"', sales: 124, price: '$2,499' },
               { name: 'AirPods Pro', sales: 842, price: '$249' },
               { name: 'Magic Keyboard', sales: 456, price: '$299' },
               { name: 'iPhone 15 Pro', sales: 321, price: '$999' },
               { name: 'Apple Watch Ultra', sales: 189, price: '$799' },
             ].map((product, i) => (
               <div key={i} className="flex items-center gap-4 group cursor-pointer">
                 <div className="h-14 w-14 bg-slate-50 rounded-2xl shrink-0 border border-slate-100 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                    <Package className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-bold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">{product.name}</p>
                   <p className="text-xs font-semibold text-slate-500 mt-0.5">{product.sales} sales</p>
                 </div>
                 <div className="font-black text-slate-900 text-sm">
                   {product.price}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
