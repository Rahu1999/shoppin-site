'use client';

import { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch } from '@/services/apiClient';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: any;
  categories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    basePrice: product?.basePrice || 0,
    comparePrice: product?.comparePrice || 0,
    costPrice: product?.costPrice || 0,
    weightGrams: product?.weightGrams || 0,
    stockQuantity: product?.stockQuantity || product?.stock || 0,
    categoryId: product?.categoryId || product?.category?.id || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    imageUrls: product?.images?.map((img: any) => img.url) || (product?.imageUrl ? [product?.imageUrl] : []),
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  });

  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(product?.images?.map((img: any) => img.url) || (product?.imageUrl ? [product?.imageUrl] : []));

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (product?.id) {
        return apiPatch(`/products/${product.id}`, data);
      }
      return apiPost('/products', data);
    },
    onSuccess: () => {
      toast.success(product?.id ? 'Product updated successfully' : 'Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Critical for public sync
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      const detail = error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : '';
      toast.error(`${message}${detail ? ': ' + detail : ''}`);
      console.error('Mutation error:', error);
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Show local previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Upload to server
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach(file => formDataUpload.append('images', file));
      
      const response = await apiPost<{ urls: string[] }>('/upload', formDataUpload);
      setFormData(prev => ({ 
        ...prev, 
        imageUrls: [...prev.imageUrls, ...response.urls] 
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev: string[]) => prev.filter((_, i: number) => i !== index));
    setFormData((prev: any) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final data casting to ensure numbers and clean strings
    const payload = {
      ...formData,
      sku: formData.sku.trim() || null,
      basePrice: Number(formData.basePrice),
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : null,
      costPrice: formData.costPrice ? Number(formData.costPrice) : null,
      weightGrams: formData.weightGrams ? Number(formData.weightGrams) : null,
      stockQuantity: Number(formData.stockQuantity),
      images: formData.imageUrls // It's already an array of strings
    };
    
    mutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Product Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Slug</label>
          <Input name="slug" value={formData.slug} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Price (₹)</label>
          <Input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} step="0.01" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Original Price (₹)</label>
          <Input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleChange} step="0.01" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Cost Price (₹)</label>
          <Input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Weight (Grams)</label>
          <Input type="number" name="weightGrams" value={formData.weightGrams} onChange={handleChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">SKU</label>
          <Input name="sku" value={formData.sku} onChange={handleChange} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Initial Stock</label>
          <Input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Product Images</label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {previews.map((url, index) => (
            <div key={index} className="h-20 w-full rounded border border-slate-200 overflow-hidden relative group">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex-1">
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
          />
          {uploading && <p className="text-xs text-primary animate-pulse mt-1">Uploading...</p>}
          <p className="text-[10px] text-slate-400 mt-1">Select up to 5 images. First image will be primary.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Category</label>
        <select 
          name="categoryId" 
          value={formData.categoryId} 
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Short Description</label>
        <Input 
          name="shortDescription" 
          value={formData.shortDescription} 
          onChange={handleChange}
          placeholder="Brief summary for catalog"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Full Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          rows={3}
          className="w-full p-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="p-4 bg-slate-50 rounded-lg space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase">Search Engine Optimization (SEO)</h4>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Meta Title</label>
          <Input name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="Browser tab title" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Meta Description</label>
          <textarea 
            name="metaDescription" 
            value={formData.metaDescription} 
            onChange={handleChange}
            rows={2}
            className="w-full p-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search engine snippet"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">Featured</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
