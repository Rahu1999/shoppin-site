'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/services/apiClient';

interface UserFormProps {
  user: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    status: user?.status || 'active',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiPatch(`/users/${user.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

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
          onChange={(e) => setFormData({ status: e.target.value })}
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
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Update Account'}
        </Button>
      </div>
    </form>
  );
}
