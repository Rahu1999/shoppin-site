'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/apiClient';
import { Search, UserPlus, Edit, Trash2, Mail, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { UserForm } from '@/components/admin/UserForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/services/apiClient';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', debouncedSearch],
    queryFn: () => apiGet<any>(`/users?search=${debouncedSearch}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user? This will soft-delete their account.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading && !debouncedSearch) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const users = usersData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users</h1>
        <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add User</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search users by name or email..." 
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((user: any) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12}/> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role: string) => (
                        <span key={role} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Shield size={10}/> {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                       >
                        <Edit className="h-4 w-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        disabled={deleteMutation.isPending}
                       >
                        <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit User Account"
      >
        <UserForm 
          user={editingUser} 
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
