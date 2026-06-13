'use client';

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { apiPost } from '@/services/apiClient';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const resetMutation = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      apiPost('/auth/reset-password', data),
    onSuccess: () => {
      setTimeout(() => router.push('/login'), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (!token) {
      setValidationError('Reset token is missing. Please use the link from your email.');
      return;
    }

    resetMutation.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4 bg-surface">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Reset Link</h1>
          <p className="text-slate-500 text-sm mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
          <Link href="/forgot-password">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4">
            <Lock className="h-6 w-6 text-slate-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-2">Choose a strong password for your account</p>
        </div>

        {resetMutation.isSuccess ? (
          <div className="text-center">
            <div className="p-4 rounded-md bg-green-50 border border-green-200 flex flex-col items-center gap-3 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-green-800 font-bold text-sm">Password Reset Successful!</p>
                <p className="text-green-700 text-xs mt-1">Redirecting you to login in a few seconds...</p>
              </div>
            </div>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <>
            {(resetMutation.isError || validationError) && (
              <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                  <AlertCircle className="h-4 w-4" /> Error
                </div>
                <p className="text-red-600 text-xs">
                  {validationError || (resetMutation.error as any)?.response?.data?.message || 'Failed to reset password. The link may have expired.'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className="pl-10 pr-10 h-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    className="pl-10 h-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold shadow-lg shadow-primary/30"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
                Request a new link
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
