'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, deleteAddress, Address } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AddressForm } from './AddressForm';
import { MapPin, Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function AddressManager() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success('Address deleted');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: () => toast.error('Failed to delete address')
  });

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setIsFormOpen(true);
  };

  if (isLoading) return <div className="text-slate-500 py-8">Loading addresses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Your Address Book</h3>
        <Button size="sm" onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      {!addresses || addresses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No addresses saved yet.</p>
          <Button variant="ghost" onClick={handleAddNew} className="text-primary hover:bg-primary/5">Add your first address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address: Address) => (
            <div 
              key={address.id} 
              className={`p-5 rounded-2xl border-2 transition-all group ${
                address.isDefault ? 'border-primary/20 bg-primary/5' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    address.type === 'shipping' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {address.type}
                  </span>
                  {address.isDefault && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-colors shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('Are you sure you want to delete this address?')) {
                        deleteMutation.mutate(address.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-danger hover:bg-white rounded-lg transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <p className="font-bold text-slate-900 mb-1">{address.fullName}</p>
                <div className="text-sm text-slate-500 space-y-0.5">
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                  <p className="pt-2 flex items-center gap-2 text-slate-400">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    {address.phone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <AddressForm 
          address={editingAddress} 
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
