'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, ShoppingBag, Heart, LogOut, ChevronRight } from 'lucide-react';
import { getProfile } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';

export type AccountTab = 'profile' | 'addresses';

interface AccountLayoutProps {
  children: React.ReactNode;
  /** Only relevant while rendered from /account, where Profile/Address Book are in-page tabs. */
  activeTab?: AccountTab;
  onTabChange?: (tab: AccountTab) => void;
}

type NavItem =
  | { id: AccountTab; label: string; icon: typeof User; kind: 'tab' }
  | { id: string; label: string; icon: typeof User; kind: 'link'; href: string };

const NAV_ITEMS: NavItem[] = [
  { id: 'profile', label: 'My Profile', icon: User, kind: 'tab' },
  { id: 'addresses', label: 'Address Book', icon: MapPin, kind: 'tab' },
  { id: 'orders', label: 'Order History', icon: ShoppingBag, kind: 'link', href: '/orders' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, kind: 'link', href: '/wishlist' },
];

export function AccountLayout({ children, activeTab, onTabChange }: AccountLayoutProps) {
  const pathname = usePathname();
  const isAccountPage = pathname === '/account';
  const { logout } = useAuthStore();

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  return (
    <div className="bg-surface min-h-[85vh] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-2">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900 leading-none mb-1 truncate">
                    {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.kind === 'tab'
                  ? isAccountPage && activeTab === item.id
                  : pathname.startsWith(item.href);

                if (item.kind === 'link') {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        {item.label}
                      </div>
                      <ChevronRight className={`w-4 h-4 ${active ? 'text-white/40' : 'text-slate-300'}`} />
                    </Link>
                  );
                }

                if (isAccountPage) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange?.(item.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        {item.label}
                      </div>
                      <ChevronRight className={`w-4 h-4 ${active ? 'text-white/40' : 'text-slate-300'}`} />
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href="/account"
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      {item.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                );
              })}

              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-colors mt-4"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>

        </div>
      </div>
    </div>
  );
}
