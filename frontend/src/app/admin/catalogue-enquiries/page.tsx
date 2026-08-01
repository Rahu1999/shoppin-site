'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/services/apiClient';
import { Search, MessageSquare, Phone, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

const STATUS_CLASS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  closed: 'bg-green-100 text-green-700',
};

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

export default function AdminCatalogueEnquiriesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCatalogueEnquiries', statusFilter],
    queryFn: () =>
      apiGet<any>('/catalogue-enquiries/admin/all', {
        limit: 100,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/catalogue-enquiries/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCatalogueEnquiries'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-24 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const allEnquiries: any[] = data?.items || [];
  const enquiries = search.trim()
    ? allEnquiries.filter((e) => {
        const q = search.toLowerCase();
        return (
          e.customerName?.toLowerCase().includes(q) ||
          e.customerPhone?.toLowerCase().includes(q) ||
          e.productNameSnapshot?.toLowerCase().includes(q)
        );
      })
    : allEnquiries;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Catalogue Enquiries</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, product..."
              className="pl-9 h-10 w-full bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === '' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {enquiries.map((enquiry: any) => (
            <div key={enquiry.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{enquiry.customerName}</p>
                  <a href={`tel:${enquiry.customerPhone}`} className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {enquiry.customerPhone}
                  </a>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${STATUS_CLASS[enquiry.status] || 'bg-slate-100 text-slate-600'}`}>
                  {enquiry.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mb-1">{enquiry.productNameSnapshot}</p>
              <p className="text-sm text-slate-600 mb-3">{enquiry.message}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <select
                  value={enquiry.status}
                  onChange={(e) => statusMutation.mutate({ id: enquiry.id, status: e.target.value })}
                  disabled={statusMutation.isPending}
                  className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {enquiries.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">{search ? 'No enquiries match your search.' : 'No enquiries submitted yet.'}</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enquiry: any) => (
                <tr key={enquiry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{enquiry.customerName}</p>
                    <a href={`tel:${enquiry.customerPhone}`} className="text-xs text-slate-500 hover:text-primary">
                      {enquiry.customerPhone}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium max-w-[160px]">{enquiry.productNameSnapshot}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-[280px]">
                    <p className="line-clamp-2" title={enquiry.message}>{enquiry.message}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={enquiry.status}
                      onChange={(e) => statusMutation.mutate({ id: enquiry.id, status: e.target.value })}
                      disabled={statusMutation.isPending}
                      className={`text-xs font-bold uppercase rounded-full px-2.5 py-1 capitalize border-0 ${STATUS_CLASS[enquiry.status] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize bg-white text-slate-900">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    {search ? 'No enquiries match your search.' : 'No enquiries submitted yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
