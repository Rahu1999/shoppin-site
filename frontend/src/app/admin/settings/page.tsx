'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/services/apiClient';
import { useTaxConfig } from '@/hooks/useTaxConfig';
import { toast } from 'sonner';
import { Percent, Save, RefreshCw } from 'lucide-react';

const PRESET_RATES = [0, 5, 12, 18, 28];

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: taxConfig, isLoading } = useTaxConfig();
  const [rate, setRate] = useState('');

  useEffect(() => {
    if (taxConfig) setRate(String(taxConfig.rate));
  }, [taxConfig]);

  const updateTax = useMutation({
    mutationFn: (newRate: number) => apiPatch('/tax/config', { rate: newRate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-config'] });
      toast.success('Tax rate updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update tax rate');
    },
  });

  const handleSave = () => {
    const parsed = parseFloat(rate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error('Enter a valid rate between 0 and 100');
      return;
    }
    updateTax.mutate(parsed);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 font-medium">Configure store-wide settings like tax rates.</p>
      </div>

      {/* Tax Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Percent className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Tax / GST Rate</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Applied to all orders at checkout</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {isLoading ? (
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <>
              {/* Current rate badge */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-medium text-slate-500">Current rate:</span>
                <span className="text-2xl font-black text-primary">{taxConfig?.rate}%</span>
                <span className="text-sm font-bold text-slate-400">{taxConfig?.name}</span>
              </div>

              {/* Preset quick-select */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Common GST Slabs</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_RATES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRate(String(r))}
                      className={`h-10 px-5 rounded-xl text-sm font-bold border transition-all ${
                        String(r) === rate
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Custom Rate</p>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1 max-w-[200px]">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={rate}
                      onChange={e => setRate(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                      placeholder="e.g. 12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={updateTax.isPending || String(taxConfig?.rate) === rate}
                    className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updateTax.isPending ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="h-4 w-4" /> Save Rate</>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium border-t border-slate-100 pt-4">
                The new rate applies to all future orders. Existing orders retain the rate at the time of purchase.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
