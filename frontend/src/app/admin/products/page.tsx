'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Search, Plus, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/admin/ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/services/apiClient';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
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
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading && !debouncedSearch) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const products = productsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
        <Button onClick={handleAdd} className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="pl-9 h-10 w-full bg-white" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                       <Image src={product.images?.[0]?.url || product.imageUrl || '/placeholder.png'} alt={product.name} fill className="object-cover" unoptimized />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku || product.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">₹{Number(product.basePrice || 0).toFixed(0)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(product.stockQuantity || product.stock || 0) > 10 ? 'bg-green-100 text-green-700' : (product.stockQuantity || product.stock || 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stockQuantity || product.stock || 0} in stock
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {product.isActive ? 'Active' : 'Draft'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                       >
                        <Edit className="h-4 w-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                       >
                        <Trash2 className="h-4 w-4" />
                       </button>
                       <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded"><MoreVertical className="h-4 w-4" /></button>
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
    </div>
  );
}
