'use client';

import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch } from '@/services/apiClient';
import { toast } from 'sonner';

interface VariantRow {
  id?: string;
  name: string;
  sku: string;
  price: number | string;
  comparePrice: number | string;
  stockQuantity: number | string;
  isActive: boolean;
}

interface ProductFormProps {
  product?: any;
  categories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!product?.id;

  const initialVariants: VariantRow[] =
    product?.variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku || '',
      price: Number(v.price) || 0,
      comparePrice: Number(v.comparePrice) || 0,
      stockQuantity:
        v.inventory?.reduce((s: number, i: any) => s + Math.max(0, (i.quantity || 0) - (i.reserved || 0)), 0) ?? 0,
      isActive: v.isActive ?? true,
    })) || [];

  const [hasVariants, setHasVariants] = useState(initialVariants.length > 0);
  const [variants, setVariants] = useState<VariantRow[]>(initialVariants);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
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
  const [previews, setPreviews] = useState<string[]>(
    product?.images?.map((img: any) => img.url) || (product?.imageUrl ? [product?.imageUrl] : [])
  );

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? apiPatch(`/products/${product.id}`, data) : apiPost('/products', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      const detail = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : '';
      toast.error(`${message}${detail ? ': ' + detail : ''}`);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach((file) => formDataUpload.append('images', file));
      const response = await apiPost<{ urls: string[] }>('/upload', formDataUpload);
      setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...response.urls] }));
    } catch {
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_: string, i: number) => i !== index) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: slugManuallyEdited ? prev.slug : slugify(value),
      }));
      return;
    }
    if (name === 'slug') setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  // Variant helpers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: '', sku: '', price: 0, comparePrice: 0, stockQuantity: 0, isActive: true },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: any) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasVariants && variants.length === 0) {
      toast.error('Add at least one size, or disable size variations.');
      return;
    }
    if (hasVariants && variants.some((v) => !v.name.trim())) {
      toast.error('All size variants must have a name.');
      return;
    }
    if (hasVariants) {
      const skus = variants.map((v) => v.sku.trim()).filter(Boolean);
      if (new Set(skus).size < skus.length) {
        toast.error('Each variant must have a unique SKU. Remove duplicate SKUs before saving.');
        return;
      }
    }

    const payload: any = {
      ...formData,
      sku: formData.sku.trim() || null,
      basePrice: Number(formData.basePrice),
      comparePrice: formData.comparePrice ? Number(formData.comparePrice) : null,
      costPrice: formData.costPrice ? Number(formData.costPrice) : null,
      weightGrams: formData.weightGrams ? Number(formData.weightGrams) : null,
      images: formData.imageUrls,
      // Always send variants so backend can add/remove/clear them
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name.trim(),
        sku: v.sku.trim() || null,
        price: Number(v.price),
        comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        stockQuantity: Number(v.stockQuantity),
        isActive: v.isActive,
        attributes: { size: v.name.trim() },
      })),
    };

    // Only include base stockQuantity when there are no variants
    if (hasVariants) {
      delete payload.stockQuantity;
    } else {
      payload.stockQuantity = Number(formData.stockQuantity);
    }

    mutation.mutate(payload);
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
          {!slugManuallyEdited && formData.name && (
            <p className="text-[10px] text-slate-400">Auto-generated from name</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Base Price (₹)</label>
          <Input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} step="0.01" min="0" required />
          <p className="text-[10px] text-slate-400">Used when no variant is selected</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Original Price (₹)</label>
          <Input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleChange} step="0.01" min="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Cost Price (₹)</label>
          <Input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" min="0" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Weight (Grams)</label>
          <Input type="number" name="weightGrams" value={formData.weightGrams} onChange={handleChange} min="0" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">SKU</label>
          <Input name="sku" value={formData.sku} onChange={handleChange} />
        </div>
        {!hasVariants && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Stock Quantity</label>
            <Input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} min="0" required={!hasVariants} />
          </div>
        )}
      </div>

      {/* ── Size Variations ─────────────────────────────────────────────── */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasVariants"
              checked={hasVariants}
              onChange={(e) => {
                setHasVariants(e.target.checked);
                if (!e.target.checked) setVariants([]);
              }}
              className="w-4 h-4 rounded border-slate-300"
            />
            <label htmlFor="hasVariants" className="text-sm font-bold text-slate-700">
              Enable Size Variations
            </label>
          </div>
          {hasVariants && (
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Size
            </button>
          )}
        </div>

        {hasVariants && (
          <div className="space-y-2">
            {variants.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-3">
                No sizes added yet. Click "Add Size" above to add your first variation.
              </p>
            )}

            {/* Header row */}
            {variants.length > 0 && (
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr_32px] gap-2 px-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Size Label</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Price (₹)</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Orig. Price (₹)</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">SKU</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Stock</span>
                <span />
              </div>
            )}

            {variants.map((v, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr_32px] gap-2 items-center bg-white border border-slate-200 rounded-lg p-2"
              >
                <Input
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  placeholder="e.g. 3-Tier"
                  required={hasVariants}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariant(i, 'price', e.target.value)}
                  min="0"
                  step="0.01"
                  required={hasVariants}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  value={v.comparePrice}
                  onChange={(e) => updateVariant(i, 'comparePrice', e.target.value)}
                  min="0"
                  step="0.01"
                  className="h-8 text-sm"
                />
                <Input
                  value={v.sku}
                  onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                  placeholder="Optional"
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  value={v.stockQuantity}
                  onChange={(e) => updateVariant(i, 'stockQuantity', e.target.value)}
                  min="0"
                  className="h-8 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <p className="text-[10px] text-slate-400 pt-1">
              Each size gets its own price and stock. The base price above is a fallback for display on product cards.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Product Images</label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {previews.map((url, index) => (
            <div key={index} className="h-20 w-full rounded border border-slate-200 overflow-hidden relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
          />
          {uploading && <p className="text-xs text-primary animate-pulse mt-1">Uploading...</p>}
          <p className="text-[10px] text-slate-400 mt-1">Select up to 5 images (JPG, PNG, WebP). First image will be primary.</p>
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Short Description</label>
        <Input name="shortDescription" value={formData.shortDescription} onChange={handleChange} placeholder="Brief summary for catalog" />
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
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">Featured</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
