'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useSubmitEnquiry } from '@/hooks/useCatalogueEnquiry';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogueItemId?: string;
  itemName: string;
}

export function EnquiryModal({ isOpen, onClose, catalogueItemId, itemName }: EnquiryModalProps) {
  const { submit, isPending, isSuccess, reset } = useSubmitEnquiry();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', message: '' });

  // Reset form/success state each time a fresh enquiry is opened for a (possibly different) item
  useEffect(() => {
    if (isOpen) {
      reset();
      setForm({ customerName: '', customerPhone: '', customerEmail: '', message: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, catalogueItemId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({
      catalogueItemId,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim() || undefined,
      message: form.message.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Custom Order">
      {isSuccess ? (
        <div className="flex flex-col items-center text-center py-6">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
          <p className="font-semibold text-slate-900">Enquiry sent!</p>
          <p className="text-sm text-slate-500 mt-1">We'll reach out on the number you provided shortly.</p>
          <Button type="button" variant="outline" size="sm" className="mt-6" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Item</p>
            <p className="text-sm font-medium text-slate-900">{itemName}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Your Name*</label>
            <Input
              required
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Phone Number*</label>
            <Input
              required
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              placeholder="e.g. 98765 43210"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email (optional)</label>
            <Input
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">What do you need?*</label>
            <Textarea
              required
              minLength={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Describe the size, finish, quantity, or customization you need"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Sending...' : 'Send Enquiry'}
          </Button>
        </form>
      )}
    </Modal>
  );
}
