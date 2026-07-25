'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/userService';
import { ProfileForm } from '@/components/account/ProfileForm';
import { AddressManager } from '@/components/account/AddressManager';
import { AccountLayout, type AccountTab } from '@/components/account/AccountLayout';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  return (
    <AccountLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10 min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </AccountLayout>
  );
}
