'use client';

import { useEffect, useState } from 'react';
import { Trash2, X, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch, apiGet } from '@/services/apiClient';
import { toast } from 'sonner';
import { slugify } from '@/utils/slugify';
import { useCategoriesTree } from '@/hooks/useProducts';

interface CatalogueItemFormProps {
  item?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

function flattenCategories(nodes: any[], depth = 0): { id: string; name: string; depth: number }[] {
  const flat: { id: string; name: string; depth: number }[] = [];
  for (const node of nodes || []) {
    flat.push({ id: node.id, name: node.name, depth });
    if (node.children?.length) flat.push(...flattenCategories(node.children, depth + 1));
  }
  return flat;
}

export function CatalogueItemForm({ item, onSuccess, onCancel }: CatalogueItemFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!item?.id;

  const { data: categoryTree } = useCategoriesTree();
  const categories = flattenCategories(categoryTree || []);

  const [creationMode, setCreationMode] = useState<'select' | 'manual'>('select');
  const [productSearch, setProductSearch] = useState('');
  const [debouncedProductSearch, setDebouncedProductSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProductSearch(productSearch.trim()), 400);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const { data: productResults, isFetching: productsLoading } = useQuery({
    queryKey: ['adminProductPicker', debouncedProductSearch],
    queryFn: () => apiGet<any>('/products', { adminView: true, search: debouncedProductSearch, limit: 8 }),
    enabled: !isEdit && creationMode === 'select' && debouncedProductSearch.length > 1,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [sourceProductId, setSourceProductId] = useState<string | null>(item?.sourceProductId || null);
  const [sizeInput, setSizeInput] = useState('');

  const [formData, setFormData] = useState({
    name: item?.name || '',
    slug: item?.slug || '',
    description: item?.description || '',
    categoryId: item?.categoryId || item?.category?.id || '',
    imageUrls: item?.images?.map((img: any) => img.url) || [],
    sizes: item?.sizes || [],
    metaTitle: item?.metaTitle || '',
    metaDescription: item?.metaDescription || '',
    isActive: item?.isActive ?? true,
    sortOrder: item?.sortOrder ?? 0,
  });

  const [uploading, setUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? apiPatch(`/catalogue-items/${item.id}`, data) : apiPost('/catalogue-items', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Catalogue item updated' : 'Catalogue item created');
      queryClient.invalidateQueries({ queryKey: ['adminCatalogueItems'] });
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
    },
  });

  const selectProduct = (product: any) => {
    const sizesFromVariants: string[] = Array.from(
      new Set((product.variants || []).map((v: any) => v.attributes?.size || v.name).filter(Boolean))
    );
    setFormData((prev) => ({
      ...prev,
      name: product.name,
      slug: slugManuallyEdited ? prev.slug : slugify(product.name),
      description: product.shortDescription || product.description || '',
      categoryId: product.categoryId || product.category?.id || prev.categoryId,
      imageUrls: (product.images || []).map((img: any) => img.url),
      sizes: sizesFromVariants,
    }));
    setSourceProductId(product.id);
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
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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
    setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_: string, i: number) => i !== index) }));
  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (!trimmed || formData.sizes.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, trimmed] }));
    setSizeInput('');
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((s: string) => s !== size) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      images: formData.imageUrls.map((url: string, index: number) => ({ url, isPrimary: index === 0 })),
      sizes: formData.sizes,
      categoryId: formData.categoryId || null,
      sourceProductId: sourceProductId || null,
      isActive: formData.isActive,
      sortOrder: Number(formData.sortOrder),
      metaTitle: formData.metaTitle || null,
      metaDescription: formData.metaDescription || null,
    };

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setCreationMode('select')}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
              creationMode === 'select' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Select Existing Product
          </button>
          <button
            type="button"
            onClick={() => setCreationMode('manual')}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${
              creationMode === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Manual Entry
          </button>
        </div>
      )}

      {!isEdit && creationMode === 'select' && (
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by name..."
              className="pl-9 h-10 bg-white"
            />
          </div>
          {productsLoading && <p className="text-xs text-slate-400 px-1">Searching...</p>}
          {productResults?.items?.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {productResults.items.map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProduct(p)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-white transition-colors ${
                    sourceProductId === p.id ? 'bg-white ring-1 ring-primary' : ''
                  }`}
                >
                  <div className="h-8 w-8 bg-slate-200 rounded overflow-hidden shrink-0">
                    {p.images?.[0]?.url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-800 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
          {sourceProductId && (
            <p className="text-xs text-emerald-600 font-medium px-1 flex items-center gap-1">
              <Package className="h-3 w-3" /> Fields prefilled below — edit freely before saving.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Item Name</label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Slug</label>
          <Input name="slug" value={formData.slug} onChange={handleChange} required />
          {!slugManuallyEdited && formData.name && (
            <p className="text-[10px] text-slate-400">/catalogue/{formData.slug || '...'}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Category</label>
        <select
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Uncategorized</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'—'.repeat(cat.depth)} {cat.name}
            </option>
          ))}
        </select>
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

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Images</label>
        <div className="grid grid-cols-5 gap-2 mb-2">
          {formData.imageUrls.map((url: string, index: number) => (
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
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
        />
        {uploading && <p className="text-xs text-primary animate-pulse mt-1">Uploading...</p>}
        <p className="text-[10px] text-slate-400 mt-1">First image will be primary.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Standard Sizes</label>
        <div className="flex gap-2">
          <Input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSize();
              }
            }}
            placeholder="e.g. 3-Tier, 18 inch — press Enter"
          />
          <Button type="button" variant="outline" onClick={addSize}>Add</Button>
        </div>
        {formData.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {formData.sizes.map((size: string) => (
              <span key={size} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {size}
                <button type="button" onClick={() => removeSize(size)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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

      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active (visible on /catalogue)</label>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Sort Order</label>
          <Input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} min="0" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
