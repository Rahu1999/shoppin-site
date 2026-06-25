'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/services/apiClient';
import { Search, UserPlus, Edit, Trash2, Mail, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { UserForm } from '@/components/admin/UserForm';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
      toast.success('User account removed.');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete user.');
      setDeleteTarget(null);
    },
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  if (isLoading && !debouncedSearch) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const users = usersData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Users</h1>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              className="pl-9 h-10 w-full bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {users?.map((user: any) => {
            const initials = `${user.firstName?.[0] || '?'}${user.lastName?.[0] || ''}`.toUpperCase();
            return (
              <div key={user.id} className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status || 'active'}
                    </span>
                    {user.roles?.map((role: string) => (
                      <span key={role} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{role}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: user.id, name: `${user.firstName} ${user.lastName}` })}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="px-4 py-12 text-center text-slate-500 text-sm">
              {search ? 'No users match your search.' : 'No users found.'}
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
              {users?.map((user: any) => {
                const initials = `${user.firstName?.[0] || '?'}${user.lastName?.[0] || ''}`.toUpperCase();
                return (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role: string) => (
                          <span key={role} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Shield size={10} /> {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: user.id, name: `${user.firstName} ${user.lastName}` })}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {search ? 'No users match your search.' : 'No users found.'}
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
        title={editingUser ? 'Edit User Account' : 'Add User'}
      >
        <UserForm
          user={editingUser}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove User"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">This will deactivate the account.</p>
              <p className="text-red-600 text-sm mt-1">
                <span className="font-bold">"{deleteTarget?.name}"</span> will be soft-deleted and will no longer be able to log in.
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
              {deleteMutation.isPending ? 'Removing...' : 'Remove User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
