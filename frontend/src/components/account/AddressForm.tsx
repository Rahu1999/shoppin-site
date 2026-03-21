'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAddress, updateAddress, Address } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    type: address?.type || 'shipping',
    line1: address?.line1 || '',
    line2: address?.line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    country: address?.country || 'USA',
    postalCode: address?.postalCode || '',
    isDefault: address?.isDefault || false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (address?.id) {
        return updateAddress(address.id, data);
      }
      return addAddress(data);
    },
    onSuccess: () => {
      toast.success(address?.id ? 'Address updated' : 'Address added');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Full Name</label>
          <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Phone</label>
          <Input name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Address type</label>
        <select 
          name="type" 
          value={formData.type} 
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="shipping">Shipping</option>
          <option value="billing">Billing</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Street Address</label>
        <Input name="line1" value={formData.line1} onChange={handleChange} required placeholder="House number and street name" />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Apartment, suite, etc. (optional)</label>
        <Input name="line2" value={formData.line2} onChange={handleChange} placeholder="Appartment 2, floor 3" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Town / City</label>
          <Input name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">State / County</label>
          <Input name="state" value={formData.state} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Postcode / ZIP</label>
          <Input name="postalCode" value={formData.postalCode} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Country</label>
          <Input name="country" value={formData.country} onChange={handleChange} required />
        </div>
      </div>

      <div className="flex items-center gap-2 py-2">
        <input 
          type="checkbox" 
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
        />
        <label htmlFor="isDefault" className="text-sm font-medium text-slate-700">Set as default address</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : address?.id ? 'Update Address' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
}
