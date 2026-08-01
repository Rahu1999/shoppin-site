'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/services/apiClient';
import { Search, Plus, Edit, Trash2, Loader2, AlertTriangle, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CatalogueItemForm } from '@/components/admin/CatalogueItemForm';
import { toast } from 'sonner';

export default function AdminCatalogueItemsPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCatalogueItems'],
    queryFn: () => apiGet<any>('/catalogue-items/admin/all?limit=100'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/catalogue-items/${id}`),
    onSuccess: () => {
      toast.success('Catalogue item deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminCatalogueItems'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete item.');
      setDeleteTarget(null);
    },
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const allItems: any[] = data?.items || [];
  const items = search.trim()
    ? allItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Catalogue Items</h1>
        <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto"><Plus className="w-4 h-4" /> Add Catalogue Item</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search catalogue items..."
              className="pl-9 h-10 w-full bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {items.map((item: any) => {
            const primaryImage = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url;
            return (
              <div key={item.id} className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                  {primaryImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={primaryImage} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <LayoutGrid className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category?.name || 'Uncategorized'} · {item.sizes?.length || 0} sizes</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <LayoutGrid className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">{search ? 'No items match your search.' : 'No catalogue items yet. Add your first item to get started.'}</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sizes</th>
                <th className="px-6 py-4">Sort</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any) => {
                const primaryImage = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                          {primaryImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={primaryImage} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <LayoutGrid className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{item.sizes?.length || 0}</td>
                    <td className="px-6 py-4 text-slate-500">{item.sortOrder}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No catalogue items yet. Add your first item to get started.
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
        title={editingItem ? 'Edit Catalogue Item' : 'Add Catalogue Item'}
      >
        <CatalogueItemForm
          item={editingItem}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Catalogue Item"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">This action cannot be undone.</p>
              <p className="text-red-600 text-sm mt-1">
                You are about to delete <span className="font-bold">"{deleteTarget?.name}"</span>.
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
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Item'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
