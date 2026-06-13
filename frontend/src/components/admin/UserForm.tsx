'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiPost } from '@/services/apiClient';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface UserFormProps {
  user: any | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const queryClient = useQueryClient();
  const isNew = !user;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    status: user?.status || 'active',
  });

  const editMutation = useMutation({
    mutationFn: (data: any) => apiPatch(`/users/${user!.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User updated');
      onSuccess();
    },
    onError: () => toast.error('Failed to update user'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiPost('/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User created');
      onSuccess();
    },
    onError: () => toast.error('Failed to create user. Email may already be in use.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew) {
      createMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
    } else {
      editMutation.mutate(formData);
    }
  };

  const isPending = editMutation.isPending || createMutation.isPending;

  if (isNew) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2">
          <UserPlus className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700 font-medium">New users will be created with the Customer role by default.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">First Name</label>
            <input required value={formData.firstName} onChange={e => setFormData(p => ({...p, firstName: e.target.value}))} placeholder="Rahul" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Last Name</label>
            <input required value={formData.lastName} onChange={e => setFormData(p => ({...p, lastName: e.target.value}))} placeholder="Sharma" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Email Address</label>
          <input required type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder="rahul@example.com" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Password</label>
          <input required type="password" minLength={8} value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} placeholder="Min. 8 characters" className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create User'}</Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Account Status</label>
        <select 
          name="status" 
          value={formData.status} 
          onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> Role management is currently handled via database seeds. Status updates will immediately affect user access.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={editMutation.isPending}>
          {editMutation.isPending ? 'Saving...' : 'Update Account'}
        </Button>
      </div>
    </form>
  );
}
