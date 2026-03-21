'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/userService';
import { ProfileForm } from '@/components/account/ProfileForm';
import { AddressManager } from '@/components/account/AddressManager';
import { User, MapPin, ShoppingBag, LogOut, ChevronRight, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

type Tab = 'profile' | 'addresses' | 'orders';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { logout } = useAuthStore();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'orders', label: 'Order History', icon: ShoppingBag, href: '/orders' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 leading-none mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-xs text-slate-500 truncate max-w-[140px]">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                item.href ? (
                    <Link 
                        key={item.id}
                        href={item.href}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                ) : (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as Tab)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeTab === item.id 
                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                            {item.label}
                        </div>
                        <ChevronRight className={`w-4 h-4 ${activeTab === item.id ? 'text-primary-foreground/40' : 'text-slate-300'}`} />
                    </button>
                )
              ))}
              
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
          <main className="flex-1">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 min-h-[500px]">
              {activeTab === 'profile' && user && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
                    <p className="text-slate-500">Manage your personal information and contact details.</p>
                  </div>
                  <ProfileForm user={user} />
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Address Book</h1>
                    <p className="text-slate-500">Add or manage where you want your items delivered.</p>
                  </div>
                  <AddressManager />
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
