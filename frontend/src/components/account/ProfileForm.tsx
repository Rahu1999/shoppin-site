'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, UserProfile } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">First Name</label>
          <Input 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Last Name</label>
          <Input 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email Address</label>
        <Input 
          value={user.email} 
          disabled 
          className="bg-slate-50 cursor-not-allowed"
        />
        <p className="text-xs text-slate-400">Email cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Phone Number (Optional)</label>
        <Input 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
