'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingBag, ListOrdered, Tag, Server, Settings, Bell, Search, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { type: 'divider', label: 'Store Management' },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/orders', label: 'Orders', icon: ListOrdered },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-[#0A0F1C] text-slate-300 shrink-0 hidden md:flex flex-col border-r border-[#151D2E] shadow-xl shadow-slate-900/10 z-20">
        <div className="h-20 flex items-center px-8 border-b border-white/5 bg-[#0A0F1C]/80 backdrop-blur-xl">
          <Link href="/admin" className="text-xl font-black tracking-tighter flex items-center gap-3 group">
            <span className="bg-linear-to-br from-primary to-blue-600 text-white p-2 rounded-xl leading-none shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform"><Server className="h-5 w-5" /></span>
            <span className="text-white">Admin<span className="text-primary opacity-90">Panel</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
           {navItems.map((item, index) => {
             if (item.type === 'divider') {
               return <div key={index} className="pt-8 pb-3 px-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.label}</div>;
             }
             const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href as string);
             const Icon = item.icon as React.ElementType;
             
             return (
               <Link 
                 key={index} 
                 href={item.href as string} 
                 className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                   isActive 
                     ? 'bg-primary/10 text-primary shadow-inner ring-1 ring-primary/20' 
                     : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                 <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} /> {item.label}
               </Link>
             );
           })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#0A0F1C]/80">
           <Link href="/" className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all ring-1 ring-white/5">
             <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" /> Storefront
             </div>
             <LogOut className="h-4 w-4 opacity-50" />
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-6 lg:px-10 justify-between shrink-0 sticky top-0 z-10">
           
           <div className="flex items-center gap-4">
             <div className="h-10 w-10 bg-slate-100 rounded-xl md:hidden flex items-center justify-center cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <LayoutDashboard className="h-5 w-5 text-slate-600" />
             </div>
             <div className="hidden sm:flex items-center relative">
                <Search className="h-4 w-4 absolute left-4 text-slate-400" />
                <input type="text" placeholder="Search anything..." className="pl-11 pr-4 h-11 bg-slate-100/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-64" />
             </div>
           </div>

           <div className="flex items-center gap-6">
              <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                 <Bell className="h-5 w-5" />
                 <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Superadmin</p>
                 </div>
                 <div className="h-11 w-11 bg-linear-to-br from-primary to-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-md shadow-primary/20 group-hover:scale-105 transition-transform ring-4 ring-white">
                    A
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative">
          <div className="absolute top-0 left-0 right-0 h-64 bg-slate-100/30 border-b border-slate-200/50 pointer-events-none -z-10" />
          {children}
        </div>
      </main>
    </div>
  );
}
