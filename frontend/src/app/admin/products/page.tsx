'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/services/apiClient';
import { Search, Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ProductForm } from '@/components/admin/ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['adminProducts', debouncedSearch],
    queryFn: () => apiGet<any>(`/products?limit=100&adminView=true&search=${debouncedSearch}`),
  });

  const { data: categories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => apiGet<any[]>('/categories/tree'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete product.');
      setDeleteTarget(null);
    },
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  if (isLoading && !debouncedSearch) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const products = productsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Products</h1>
        <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto"><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-9 h-10 w-full bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {products.map((product: any) => (
            <div key={product.id} className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative shrink-0">
                <Image
                  src={product.images?.[0]?.url || product.imageUrl || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{product.name}</p>
                <p className="text-xs text-slate-500 truncate">{product.category?.name || 'Uncategorized'}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">₹{Number(product.basePrice || 0).toFixed(0)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (product.stockQuantity || product.stock || 0) > 10 ? 'bg-green-100 text-green-700' :
                    (product.stockQuantity || product.stock || 0) > 0  ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{product.stockQuantity || product.stock || 0} in stock</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {product.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="px-4 py-12 text-center text-slate-500 text-sm">
              No products found. Add your first product to get started.
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU / ID</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded border border-slate-200 overflow-hidden relative shrink-0">
                      <Image
                        src={product.images?.[0]?.url || product.imageUrl || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku || product.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">₹{Number(product.basePrice || 0).toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      (product.stockQuantity || product.stock || 0) > 10 ? 'bg-green-100 text-green-700' :
                      (product.stockQuantity || product.stock || 0) > 0  ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stockQuantity || product.stock || 0} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          product={editingProduct}
          categories={categories || []}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">This action cannot be undone.</p>
              <p className="text-red-600 text-sm mt-1">
                You are about to delete <span className="font-bold">"{deleteTarget?.name}"</span>. The product will be removed from the store.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
