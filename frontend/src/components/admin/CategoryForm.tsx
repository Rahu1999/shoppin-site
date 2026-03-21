'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch } from '@/services/apiClient';

interface CategoryFormProps {
  category?: any;
  parentCategories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, parentCategories, onSuccess, onCancel }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    parentId: category?.parentId || '',
    description: category?.description || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (category?.id) {
        return apiPatch(`/categories/${category.id}`, data);
      }
      return apiPost('/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      parentId: formData.parentId === '' ? null : formData.parentId
    };
    mutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Category Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Slug</label>
          <Input name="slug" value={formData.slug} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Parent Category</label>
          <select 
            name="parentId" 
            value={formData.parentId} 
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Root (No Parent)</option>
            {parentCategories.filter(cat => cat.id !== category?.id).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Sort Order</label>
          <Input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          rows={3}
          className="w-full p-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Category is active</label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : category?.id ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}
