'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiPost } from '@/services/apiClient';
import { useMutation } from '@tanstack/react-query';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  
  const resetMutation = useMutation({
    mutationFn: (email: string) => apiPost('/auth/forgot-password', { email }),
  });

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate(email);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4">
            <KeyRound className="h-6 w-6 text-slate-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your email and we'll send you a recovery link</p>
        </div>

        {resetMutation.isError && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
              <AlertCircle className="h-4 w-4" /> Reset Failed
            </div>
            <p className="text-red-600 text-xs">
              {(resetMutation.error as any)?.response?.data?.message || 'Something went wrong. Please check your email and try again.'}
            </p>
          </div>
        )}

        {resetMutation.isSuccess && (
          <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> Link Sent
            </div>
            <p className="text-green-700 text-xs">
              If an account with that email exists, we've sent instructions to reset your password.
            </p>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="pl-10 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/30"
              disabled={resetMutation.isPending || resetMutation.isSuccess}
            >
              {resetMutation.isPending ? 'Sending Link...' : 'Send Recovery Link'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}
