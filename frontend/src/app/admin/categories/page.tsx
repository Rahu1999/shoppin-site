'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Search, Plus, Edit, Trash2, FolderOpen, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/services/apiClient';

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['adminCategories', debouncedSearch],
    queryFn: () => apiGet<any[]>(`/categories/tree?adminView=true`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    },
  });

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure? This will hide the category from products.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading && !debouncedSearch) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  // Flatten categories for table
  const flatten = (items: any[], level = 0): any[] => {
    return items.reduce((acc, item) => {
      acc.push({ ...item, level });
      if (item.children?.length > 0) {
        acc.push(...flatten(item.children, level + 1));
      }
      return acc;
    }, []);
  };

  const flatCategories = categories ? flatten(categories) : [];
  const filteredCategories = flatCategories.filter(cat => 
    cat.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
        <Button onClick={handleAdd} className="gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search categories..." 
                className="pl-9 h-10 w-full bg-white" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredCategories.map((category: any) => (
                <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${category.level * 2}rem` }}>
                      {category.level > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                      <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{category.slug}</td>
                  <td className="px-6 py-4 text-slate-500">{category.sortOrder}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(category)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                       >
                        <Edit className="h-4 w-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        disabled={deleteMutation.isPending}
                       >
                        <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No categories found.
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
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <CategoryForm 
          category={editingCategory} 
          parentCategories={flatCategories.filter(c => c.level === 0)} // Only root as potential parents for simplicity
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
