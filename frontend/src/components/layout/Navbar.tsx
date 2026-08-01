'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Search, Loader2, Heart, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useFetchCart } from '@/hooks/useCart';
import { apiGet } from '@/services/apiClient';
import { formatPrice } from '@/utils/price';
import { useState, useEffect, useRef } from 'react';
import { BRAND } from '@/config/brand';
import { useCategoriesTree } from '@/hooks/useProducts';
import { usePublicModuleFlags } from '@/hooks/useModuleSettings';

export function Navbar() {
  useFetchCart();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: suggestions, isFetching: suggestionsLoading } = useQuery({
    queryKey: ['nav-search-suggestions', debouncedSearch],
    queryFn: () => apiGet<any>('/products', { search: debouncedSearch, limit: 5 }),
    enabled: debouncedSearch.length > 1,
    staleTime: 30000,
  });

  const { data: categories } = useCategoriesTree();
  const { data: moduleFlags } = usePublicModuleFlags();

  const goToSearch = (q: string) => {
    if (!q.trim()) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const coreLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    ...(moduleFlags?.catalogue !== false ? [{ href: '/catalogue', label: 'Catalogue' }] : []),
    ...(moduleFlags?.blog !== false ? [{ href: '/blog', label: 'Blog' }] : []),
    { href: '/#contact', label: 'Contact' },
  ];
  const categoryLinks = (categories || []).map((cat: any) => ({ href: `/category/${cat.slug}`, label: cat.name }));
  const navLinks = [...coreLinks, ...categoryLinks];

  // SSR skeleton — avoids hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-8">
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            {BRAND.name}
          </span>
          <div className="h-5 w-5 bg-gray-100 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-8">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-gray-600 transition-colors">
              {BRAND.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {coreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {categoryLinks.length > 0 && (
              <>
                <span className="h-4 w-px bg-gray-200" aria-hidden="true" />
                <div className="relative group flex items-center gap-6">
                  <span className="pointer-events-none absolute -top-4 left-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop by Category
                  </span>
                  {categoryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block" ref={searchBoxRef}>
              {searchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 z-50">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      goToSearch(searchTerm);
                    }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                    </div>
                  </form>

                  {debouncedSearch.length > 1 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden">
                      {suggestionsLoading ? (
                        <div className="p-4 flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      ) : suggestions?.items?.length ? (
                        <>
                          {suggestions.items.slice(0, 5).map((product: any) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <img
                                src={product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url || '/placeholder-product.svg'}
                                alt={product.name}
                                className="h-9 w-9 rounded object-cover border border-gray-100 shrink-0"
                              />
                              <span className="flex-1 min-w-0 truncate text-sm text-gray-800">{product.name}</span>
                              <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(product.basePrice)}</span>
                            </Link>
                          ))}
                          <button
                            onClick={() => goToSearch(searchTerm)}
                            className="w-full text-center text-xs font-semibold text-gray-600 hover:text-gray-900 py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            See all results
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 px-3 py-4 text-center">No products found</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/wishlist"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Wishlist"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/account"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    title={user?.firstName || 'Account'}
                    aria-label="Account"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToSearch(searchTerm);
              }}
              className="relative mb-3"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                    My Account
                  </Link>
                  <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                    Wishlist
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium text-gray-400 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block text-sm font-medium bg-gray-900 text-white text-center px-3 py-2.5 rounded-lg mt-2">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
