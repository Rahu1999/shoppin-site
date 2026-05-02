'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { BRAND } from '@/config/brand';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/#contact', label: 'Contact' },
  ];

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
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
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
                    href="/account"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    {user?.firstName || 'Account'}
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
