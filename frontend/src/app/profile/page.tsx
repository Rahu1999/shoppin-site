'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { User, Mail, MapPin, Calendar, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<any>('/users/me'),
  });

  if (isLoading) {
    return <div className="p-24 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20 bg-surface min-h-[80vh]">
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Account Profile</h1>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
           {/* Header Cover */}
           <div className="h-32 bg-gradient-to-r from-primary to-primary/80 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="h-24 w-24 bg-white p-1 rounded-full shadow-lg">
                  <div className="h-full w-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-white text-slate-400">
                    <User className="h-10 w-10" />
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                 <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary"><Edit3 className="h-4 w-4 mr-2"/> Edit Profile</Button>
              </div>
           </div>

           <div className="pt-16 p-8">
             <h2 className="text-2xl font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</h2>
             <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
               <Mail className="h-4 w-4" /> {profile?.email}
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User className="h-5 w-5 text-primary" /> Personal Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-medium">First Name</span>
                      <span className="font-semibold text-slate-900">{profile?.firstName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-medium">Last Name</span>
                      <span className="font-semibold text-slate-900">{profile?.lastName}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500 font-medium whitespace-nowrap"><Calendar className="inline h-4 w-4 mr-1"/> Joined</span>
                      <span className="font-semibold text-slate-900">{new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <MapPin className="h-5 w-5 text-primary" /> Default Address
                  </h3>
                  
                  {/* Address Mock */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm h-[132px] flex flex-col justify-center items-center text-center">
                    <p className="text-slate-500 font-medium mb-3">No default address saved yet.</p>
                    <Button variant="outline" size="sm" className="bg-white">Add Address</Button>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
