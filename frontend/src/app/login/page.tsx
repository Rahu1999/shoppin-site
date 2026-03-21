'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginMutation = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password }, {
      onSuccess: (data) => {
        // Redirect based on role
        if (data.user.roles.includes('admin') || data.user.roles.includes('super_admin')) {
          router.push('/admin');
        } else {
          router.push('/profile');
        }
      }
    });
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center p-4 bg-surface relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply border-none pointer-events-none" />
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl opacity-50 mix-blend-multiply border-none pointer-events-none" />

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary/5 ring-1 ring-slate-200/50 p-8 sm:p-12 relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 mb-6 text-white transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="font-medium text-slate-500 mt-3">Sign in to your premium account</p>
        </div>

        {registered && (
          <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
             <div className="p-2 bg-green-100 rounded-lg text-green-600 shrink-0"><ShieldCheck className="h-5 w-5" /></div>
            <p className="text-green-800 text-sm font-bold">Registration successful! Please sign in below.</p>
          </div>
        )}

        {loginMutation.isError && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-in fade-in zoom-in-95">
             <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0 mt-0.5"><AlertCircle className="h-5 w-5" /></div>
            <div>
               <p className="text-rose-800 font-bold text-sm">Authentication Failed</p>
               <p className="text-rose-600 text-xs font-medium mt-1">{(loginMutation.error as any)?.response?.data?.message || 'Invalid credentials. Please try again.'}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <Link href="#" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Forgot parameters?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-colors text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-xl group relative overflow-hidden"
              disabled={loginMutation.isPending}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                 {loginMutation.isPending ? 'Authenticating...' : (
                    <>Sign In <ArrowRight className="h-5 w-5" /></>
                 )}
              </span>
            </Button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-4">
           <div className="h-px bg-slate-200 flex-1" />
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
           <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="mt-6 flex justify-center">
           <Button type="button" variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 font-bold text-slate-700 shadow-sm flex items-center justify-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
               <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
               <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
               <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
               <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
             </svg>
             Sign in with Google
           </Button>
        </div>

        <div className="mt-10 text-center text-base font-medium text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Create one now
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginContent />
    </Suspense>
  );
}
