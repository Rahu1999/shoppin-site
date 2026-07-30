'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete, apiPatch } from '@/services/apiClient';
import { Search, Plus, Edit, Trash2, Loader2, AlertTriangle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { BlogPostForm } from '@/components/admin/BlogPostForm';
import { toast } from 'sonner';

export default function AdminBlogPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['adminBlogPosts', debouncedSearch],
    queryFn: () => apiGet<any>(`/blog/admin/all?limit=100&search=${debouncedSearch}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/blog/${id}`),
    onSuccess: () => {
      toast.success('Post deleted.');
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete post.');
      setDeleteTarget(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiPatch(`/blog/${id}`, { status }),
    onSuccess: () => {
      toast.success('Post status updated.');
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  if (isLoading && !debouncedSearch) {
    return <div className="p-24 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const posts = postsData?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Blog</h1>
        <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto"><Plus className="w-4 h-4" /> Add Post</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              className="pl-9 h-10 w-full bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Post</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">Author</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4">Status</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
                        {post.coverImageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
                        ) : (
                          <Newspaper className="h-4 w-4" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-sm truncate max-w-[180px] sm:max-w-none">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-500 text-xs hidden sm:table-cell">{post.authorName || '—'}</td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <button
                      onClick={() => toggleStatusMutation.mutate({ id: post.id, status: post.status === 'published' ? 'draft' : 'published' })}
                      disabled={toggleStatusMutation.isPending}
                      className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition-colors ${post.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No blog posts yet. Add your first post to get started.
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
        title={editingPost ? 'Edit Post' : 'Add New Post'}
      >
        <BlogPostForm
          post={editingPost}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">This action cannot be undone.</p>
              <p className="text-red-600 text-sm mt-1">
                You are about to delete <span className="font-bold">"{deleteTarget?.title}"</span>.
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
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Post'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
