'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch } from '@/services/apiClient';
import { toast } from 'sonner';
import { slugify } from '@/utils/slugify';
import { RichTextEditor } from './RichTextEditor';

interface BlogPostFormProps {
  post?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BlogPostForm({ post, onSuccess, onCancel }: BlogPostFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!post?.id;

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImageUrl: post?.coverImageUrl || '',
    authorName: post?.authorName || '',
    status: post?.status || 'draft',
    tags: (post?.tags || []).join(', '),
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
  });

  const [uploading, setUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? apiPatch(`/blog/${post.id}`, data) : apiPost('/blog', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Post updated successfully' : 'Post created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: slugManuallyEdited ? prev.slug : slugify(value),
      }));
      return;
    }
    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('images', file);
      const response = await apiPost<{ urls: string[] }>('/upload', formDataUpload);
      setFormData((prev) => ({ ...prev, coverImageUrl: response.urls[0] || prev.coverImageUrl }));
    } catch {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Title</label>
          <Input name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Slug</label>
          <Input name="slug" value={formData.slug} onChange={handleChange} required />
          {!slugManuallyEdited && formData.title && (
            <p className="text-[10px] text-slate-400">Auto-generated from title</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Author</label>
          <Input name="authorName" value={formData.authorName} onChange={handleChange} placeholder="e.g. Rajesh Industries Team" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Excerpt</label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={2}
          placeholder="Short summary shown on the blog listing page"
          className="w-full p-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Cover Image</label>
        {formData.coverImageUrl ? (
          <div className="relative w-40 h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover rounded-md border border-slate-200" />
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, coverImageUrl: '' }))}
              className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 w-40 h-28 border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-primary/50 transition-colors justify-center text-slate-400">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
          </label>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Content</label>
        <RichTextEditor
          value={formData.content}
          onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700">Tags (comma-separated)</label>
        <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. kitchen, storage, guide" />
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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}
