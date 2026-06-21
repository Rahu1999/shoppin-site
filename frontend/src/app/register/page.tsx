'use client';

import { useState } from 'react';
import { useRegistration } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegistration();
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData, {
      onSuccess: () => {
        router.push('/login?registered=true');
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center p-4 bg-surface relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply border-none pointer-events-none" />
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl opacity-50 mix-blend-multiply border-none pointer-events-none" />

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/5 ring-1 ring-slate-200/50 p-8 sm:p-12 relative z-10 m-4 my-10">
        
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 mb-6 text-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
             <UserPlus className="h-8 w-8" />
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create an Account</h1>
           <p className="font-medium text-slate-500 mt-3">Join us today to unlock exclusive premium perks</p>
        </div>

        {registerMutation.isError && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-in fade-in zoom-in-95">
             <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5"><AlertCircle className="h-5 w-5" /></div>
            <div>
               <p className="text-rose-800 font-bold text-sm">Registration Failed</p>
               <p className="text-rose-600 text-xs font-medium mt-1">{(registerMutation.error as any)?.response?.data?.message || 'Email may already be in use. Please try again or log in.'}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">First Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="text" 
                  name="firstName"
                  placeholder="John" 
                  className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors text-base"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Last Name</label>
              <Input 
                type="text" 
                name="lastName"
                placeholder="Doe" 
                className="h-14 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors text-base"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                type="email" 
                name="email"
                placeholder="name@example.com" 
                className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors text-base"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors text-base"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-xl group relative overflow-hidden"
              disabled={registerMutation.isPending}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                 {registerMutation.isPending ? 'Creating Account...' : (
                    <>Sign Up <ArrowRight className="h-5 w-5" /></>
                 )}
              </span>
            </Button>
          </div>
        </form>

        <div className="mt-10 text-center text-base font-medium text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
