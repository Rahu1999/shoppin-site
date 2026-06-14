'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingBag, ListOrdered, Tag,
  Bell, LogOut, Menu, ExternalLink, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

function getRolesFromToken(token: string): string[] {
  try {
    return JSON.parse(atob(token.split('.')[1])).roles || [];
  } catch {
    return [];
  }
}

const NAV_SECTIONS = [
  {
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Store',
    items: [
      { href: '/admin/products',   label: 'Products',   icon: ShoppingBag },
      { href: '/admin/categories', label: 'Categories', icon: Tag },
      { href: '/admin/orders',     label: 'Orders',     icon: ListOrdered },
      { href: '/admin/users',      label: 'Users',      icon: Users },
    ],
  },
];

function NavItem({ href, label, icon: Icon, exact, pathname, onClick }: any) {
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/4 h-1/2 w-0.5 bg-primary rounded-r-full" />
      )}
      <span className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all ${
        isActive
          ? 'bg-primary/20 text-primary'
          : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-white/5'
      }`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary/60 shrink-0" />}
    </Link>
  );
}

function SidebarContent({ pathname, onNav, displayName, initials, roleLabel, onLogout }: any) {
  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
          <ShoppingBag className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Rajesh Industries</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Admin Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavItem
                  key={item.href}
                  {...item}
                  pathname={pathname}
                  onClick={onNav}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Storefront link */}
      <div className="px-3 pb-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 text-xs font-semibold transition-all group"
        >
          <ExternalLink className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
          View Storefront
        </Link>
      </div>

      {/* User profile + logout */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md shadow-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide font-semibold">{roleLabel}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="shrink-0 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const { isAuthenticated, accessToken, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.replace('/login?redirect=/admin');
      return;
    }
    const roles = getRolesFromToken(accessToken);
    if (!roles.some(r => r === 'admin' || r === 'super_admin')) {
      toast.error('Admin access required.');
      router.replace('/');
      return;
    }
    setAuthorized(true);
  }, [isAuthenticated, accessToken, router]);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'A'
    : 'A';
  const roleLabel = (() => {
    if (!accessToken) return 'Admin';
    const roles = getRolesFromToken(accessToken);
    if (roles.includes('super_admin')) return 'Super Admin';
    return 'Admin';
  })();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-semibold text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  const sidebarProps = {
    pathname,
    displayName,
    initials,
    roleLabel,
    onLogout: handleLogout,
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0D1117] shrink-0 hidden md:block border-r border-white/5 shadow-2xl shadow-black/20">
        <SidebarContent {...sidebarProps} onNav={undefined} />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0D1117] border-r border-white/5 shadow-2xl">
            <SidebarContent {...sidebarProps} onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 justify-between shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="h-4.5 w-4.5 h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border border-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{displayName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wide">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
