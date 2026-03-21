'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { currency, setCurrency } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/products');
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                MODERN<span className="text-primary font-extrabold italic">SHOP</span>
              </span>
            </Link>
          </div>
          <div className="h-8 w-8 animate-pulse bg-slate-100 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:scale-105 transition-transform duration-300 uppercase">
              MODERN<span className="text-primary font-extrabold italic">SHOP</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/products" className="text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-200 uppercase tracking-wide">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-200 uppercase tracking-wide">
              Categories
            </Link>
            <Link href="/deals" className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-all duration-200 uppercase tracking-wide flex items-center gap-1">
              Deals <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            </Link>
          </nav>
        </div>

        {/* Global Search Center */}
        <div className="hidden flex-1 items-center justify-center px-12 md:flex">
          <form onSubmit={handleSearch} className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="Search premium electronics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 px-11 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </form>
        </div>

        {/* Right Nav Icons */}
        <div className="flex items-center gap-2 lg:gap-5">
          {/* Currency Switcher */}
          <button 
            onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold text-slate-700 shadow-sm"
          >
            <Globe className="h-4 w-4 text-indigo-500" />
            <span className="hidden sm:inline">{currency}</span>
          </button>

          <Link href="/cart" className="relative p-2.5 text-slate-700 hover:text-primary transition-all duration-200 bg-slate-50 hover:bg-primary/5 rounded-full group">
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>
          
          <div className="hidden md:flex items-center gap-3 ml-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-5">
                <Link href="/account" className="flex items-center gap-2.5 p-1 pr-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all group">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-primary">{user?.firstName || 'Account'}</span>
                </Link>
                <button onClick={logout} className="text-xs font-bold text-slate-400 hover:text-danger transition-colors uppercase tracking-widest">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="rounded-full bg-[#0F172A] px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-all shadow-lg hover:shadow-primary/20 shadow-black/10">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full">
            <Menu className="h-6 w-6" />
          </button>
        </div>

      </div>
    </header>
  );
}
