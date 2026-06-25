'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/apiClient';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, TicketPercent, CheckCircle, XCircle, Tag } from 'lucide-react';
import { formatPrice } from '@/utils/price';

type CouponType = 'percentage' | 'fixed';

interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usesCount: number;
  usesLimit?: number;
  perUserLimit: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as CouponType,
  value: '',
  minOrderValue: '',
  maxDiscount: '',
  usesLimit: '',
  perUserLimit: '1',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!coupon;
  const [form, setForm] = useState(
    coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: String(coupon.value),
          minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : '',
          maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
          usesLimit: coupon.usesLimit != null ? String(coupon.usesLimit) : '',
          perUserLimit: String(coupon.perUserLimit),
          startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
          expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
          isActive: coupon.isActive,
        }
      : { ...EMPTY_FORM },
  );

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        isActive: form.isActive,
        perUserLimit: Number(form.perUserLimit) || 1,
      };
      if (form.minOrderValue) payload.minOrderValue = Number(form.minOrderValue);
      if (form.maxDiscount && form.type === 'percentage') payload.maxDiscount = Number(form.maxDiscount);
      if (form.usesLimit) payload.usesLimit = Number(form.usesLimit);
      if (form.startsAt) payload.startsAt = new Date(form.startsAt).toISOString();
      if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

      if (isEdit) {
        return apiPatch(`/coupons/${coupon!.id}`, payload);
      }
      return apiPost('/coupons', payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Coupon updated' : 'Coupon created');
      onSaved();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save coupon');
    },
  });

  const LABEL = 'block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5';
  const FIELD = 'h-10 bg-white rounded-lg border-slate-200 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Coupon' : 'Create Coupon'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Code */}
          <div>
            <label className={LABEL}>Coupon Code</label>
            <Input
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="e.g. SAVE10"
              className={`${FIELD} font-mono tracking-widest`}
              disabled={isEdit}
            />
            {isEdit && <p className="text-xs text-slate-400 mt-1">Code cannot be changed after creation.</p>}
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Discount Type</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>{form.type === 'percentage' ? 'Discount %' : 'Discount ₹'}</label>
              <Input
                type="number"
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder={form.type === 'percentage' ? '10' : '100'}
                min="0"
                max={form.type === 'percentage' ? '100' : undefined}
                className={FIELD}
              />
            </div>
          </div>

          {/* Min order + Max cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Min. Order Value (₹)</label>
              <Input
                type="number"
                value={form.minOrderValue}
                onChange={e => set('minOrderValue', e.target.value)}
                placeholder="500 (optional)"
                min="0"
                className={FIELD}
              />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className={LABEL}>Max Discount Cap (₹)</label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={e => set('maxDiscount', e.target.value)}
                  placeholder="200 (optional)"
                  min="0"
                  className={FIELD}
                />
              </div>
            )}
          </div>

          {/* Usage limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Total Uses Limit</label>
              <Input
                type="number"
                value={form.usesLimit}
                onChange={e => set('usesLimit', e.target.value)}
                placeholder="Unlimited"
                min="1"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Per User Limit</label>
              <Input
                type="number"
                value={form.perUserLimit}
                onChange={e => set('perUserLimit', e.target.value)}
                min="1"
                className={FIELD}
              />
            </div>
          </div>

          {/* Validity dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Valid From</label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={e => set('startsAt', e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Expires On</label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => set('expiresAt', e.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!form.code || !form.value || save.isPending}
            className="rounded-xl gap-2"
          >
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'create' | Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: () => apiGet<any>('/coupons'),
  });

  const toggleActive = useMutation({
    mutationFn: (coupon: Coupon) => apiPatch(`/coupons/${coupon.id}`, { isActive: !coupon.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCoupons'] }),
    onError: () => toast.error('Failed to update coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const coupons: Coupon[] = Array.isArray(data) ? data : (data?.items || []);

  const now = new Date();
  const getStatus = (c: Coupon) => {
    if (!c.isActive) return { label: 'Inactive', color: 'text-slate-500 bg-slate-100' };
    if (c.expiresAt && new Date(c.expiresAt) < now) return { label: 'Expired', color: 'text-rose-600 bg-rose-50' };
    if (c.startsAt && new Date(c.startsAt) > now) return { label: 'Scheduled', color: 'text-amber-600 bg-amber-50' };
    if (c.usesLimit != null && c.usesCount >= c.usesLimit) return { label: 'Exhausted', color: 'text-orange-600 bg-orange-50' };
    return { label: 'Active', color: 'text-green-700 bg-green-50' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Coupons</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage discount codes for your customers.</p>
        </div>
        <Button onClick={() => setModal('create')} className="gap-2 shrink-0 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-900 font-bold text-lg">No coupons yet</p>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">Create your first discount code to start running promotions.</p>
            <Button onClick={() => setModal('create')} className="mt-6 gap-2">
              <Plus className="h-4 w-4" /> Create Coupon
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest">Code</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest">Discount</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest hidden sm:table-cell">Min Order</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest hidden md:table-cell">Usage</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest hidden lg:table-cell">Expires</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest">Status</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 font-bold text-slate-500 text-xs uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map(c => {
                  const status = getStatus(c);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg text-xs tracking-widest">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                        </span>
                        {c.maxDiscount && c.type === 'percentage' && (
                          <span className="text-slate-400 text-xs ml-1 hidden sm:inline">max {formatPrice(c.maxDiscount)}</span>
                        )}
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4 text-slate-600 hidden sm:table-cell">
                        {c.minOrderValue ? formatPrice(c.minOrderValue) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4 text-slate-600 hidden md:table-cell">
                        <span className="font-semibold">{c.usesCount}</span>
                        {c.usesLimit != null ? (
                          <span className="text-slate-400">/{c.usesLimit}</span>
                        ) : (
                          <span className="text-slate-400"> / ∞</span>
                        )}
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4 text-slate-500 text-xs hidden lg:table-cell">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="text-slate-400">Never</span>}
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${status.color}`}>
                          {status.label === 'Active'
                            ? <CheckCircle className="h-3 w-3" />
                            : <XCircle className="h-3 w-3" />}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleActive.mutate(c)}
                            className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors hidden sm:block"
                            title={c.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {c.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => setModal(c)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <CouponModal
          coupon={modal === 'create' ? null : (modal as Coupon)}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-black text-lg text-slate-900 mb-2">Delete Coupon?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Coupon <span className="font-mono font-bold text-slate-900">{deleteTarget.code}</span> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
