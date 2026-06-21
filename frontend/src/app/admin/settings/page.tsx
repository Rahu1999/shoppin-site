'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/services/apiClient';
import { useTaxConfig } from '@/hooks/useTaxConfig';
import { useShippingConfig } from '@/hooks/useShippingConfig';
import { usePaymentGatewayConfig } from '@/hooks/usePaymentGatewayConfig';
import { toast } from 'sonner';
import { Percent, Save, RefreshCw, Truck, CreditCard } from 'lucide-react';

const PRESET_RATES = [0, 5, 12, 18, 28];

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  // ── Tax ──────────────────────────────────────────────────────────────────────
  const { data: taxConfig, isLoading: taxLoading } = useTaxConfig();
  const [taxRate, setTaxRate] = useState('');

  useEffect(() => {
    if (taxConfig) setTaxRate(String(taxConfig.rate));
  }, [taxConfig]);

  const updateTax = useMutation({
    mutationFn: (rate: number) => apiPatch('/tax/config', { rate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-config'] });
      toast.success('Tax rate updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update tax rate'),
  });

  const handleSaveTax = () => {
    const parsed = parseFloat(taxRate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error('Enter a valid rate between 0 and 100');
      return;
    }
    updateTax.mutate(parsed);
  };

  // ── Shipping ─────────────────────────────────────────────────────────────────
  const { data: shippingConfig, isLoading: shippingLoading } = useShippingConfig();
  const [shipName, setShipName] = useState('');
  const [shipFlatFee, setShipFlatFee] = useState('');
  const [shipFreeAbove, setShipFreeAbove] = useState('');
  const [shipDaysMin, setShipDaysMin] = useState('');
  const [shipDaysMax, setShipDaysMax] = useState('');

  useEffect(() => {
    if (shippingConfig) {
      setShipName(shippingConfig.name);
      setShipFlatFee(String(shippingConfig.flatFee));
      setShipFreeAbove(shippingConfig.freeAbove != null ? String(shippingConfig.freeAbove) : '');
      setShipDaysMin(shippingConfig.estimatedDaysMin != null ? String(shippingConfig.estimatedDaysMin) : '');
      setShipDaysMax(shippingConfig.estimatedDaysMax != null ? String(shippingConfig.estimatedDaysMax) : '');
    }
  }, [shippingConfig]);

  const updateShipping = useMutation({
    mutationFn: (payload: any) => apiPatch('/shipping/config', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-config'] });
      toast.success('Shipping config updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update shipping'),
  });

  const handleSaveShipping = () => {
    const flatFee = parseFloat(shipFlatFee);
    if (isNaN(flatFee) || flatFee < 0) {
      toast.error('Enter a valid flat fee (0 or more)');
      return;
    }
    updateShipping.mutate({
      name: shipName || undefined,
      flatFee,
      freeAbove: shipFreeAbove === '' ? null : parseFloat(shipFreeAbove),
      estimatedDaysMin: shipDaysMin !== '' ? parseInt(shipDaysMin) : undefined,
      estimatedDaysMax: shipDaysMax !== '' ? parseInt(shipDaysMax) : undefined,
    });
  };

  // ── Payment Gateway ──────────────────────────────────────────────────────────
  const { data: gatewayConfig, isLoading: gatewayLoading } = usePaymentGatewayConfig();
  const [gwName, setGwName] = useState('');
  const [gwRate, setGwRate] = useState('');
  const [gwTaxRate, setGwTaxRate] = useState('');
  const [gwEnabled, setGwEnabled] = useState(true);

  useEffect(() => {
    if (gatewayConfig) {
      setGwName(gatewayConfig.name);
      setGwRate(String(gatewayConfig.rate));
      setGwTaxRate(String(gatewayConfig.taxRate));
      setGwEnabled(gatewayConfig.isEnabled);
    }
  }, [gatewayConfig]);

  const updateGateway = useMutation({
    mutationFn: (payload: any) => apiPatch('/payment-gateway/config', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateway-config'] });
      toast.success('Payment gateway config updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update gateway config'),
  });

  const handleSaveGateway = () => {
    const rate = parseFloat(gwRate);
    const taxRate = parseFloat(gwTaxRate);
    if (isNaN(rate) || rate < 0 || rate > 10) {
      toast.error('Gateway fee rate must be between 0 and 10%');
      return;
    }
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
      toast.error('GST on gateway fee must be between 0 and 100%');
      return;
    }
    updateGateway.mutate({ name: gwName || undefined, rate, taxRate, isEnabled: gwEnabled });
  };

  const gatewayDirty =
    gwName !== (gatewayConfig?.name ?? '') ||
    gwRate !== String(gatewayConfig?.rate ?? '') ||
    gwTaxRate !== String(gatewayConfig?.taxRate ?? '') ||
    gwEnabled !== (gatewayConfig?.isEnabled ?? true);

  const shippingDirty =
    shipName !== (shippingConfig?.name ?? '') ||
    shipFlatFee !== String(shippingConfig?.flatFee ?? '') ||
    shipFreeAbove !== (shippingConfig?.freeAbove != null ? String(shippingConfig.freeAbove) : '') ||
    shipDaysMin !== (shippingConfig?.estimatedDaysMin != null ? String(shippingConfig.estimatedDaysMin) : '') ||
    shipDaysMax !== (shippingConfig?.estimatedDaysMax != null ? String(shippingConfig.estimatedDaysMax) : '');

  const INPUT = 'w-full h-12 px-4 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white';

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 font-medium">Configure store-wide settings for tax, shipping, and payment gateway.</p>
      </div>

      {/* ── Tax Card ────────────────────────────────────────────────────────── */}
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
          {taxLoading ? (
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-medium text-slate-500">Current rate:</span>
                <span className="text-2xl font-black text-primary">{taxConfig?.rate}%</span>
                <span className="text-sm font-bold text-slate-400">{taxConfig?.name}</span>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Common GST Slabs</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_RATES.map(r => (
                    <button
                      key={r}
                      onClick={() => setTaxRate(String(r))}
                      className={`h-10 px-5 rounded-xl text-sm font-bold border transition-all ${
                        String(r) === taxRate
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Custom Rate</p>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1 max-w-[200px]">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate}
                      onChange={e => setTaxRate(e.target.value)}
                      className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                      placeholder="e.g. 18"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                  </div>
                  <button
                    onClick={handleSaveTax}
                    disabled={updateTax.isPending || String(taxConfig?.rate) === taxRate}
                    className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updateTax.isPending ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Rate</>}
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

      {/* ── Shipping Card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Shipping Config</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Flat fee auto-applied at checkout</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {shippingLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              {/* Current summary */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Flat fee</span>
                  <span className="text-2xl font-black text-blue-600">₹{shippingConfig?.flatFee}</span>
                </div>
                {shippingConfig?.freeAbove != null && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Free above</span>
                    <span className="text-2xl font-black text-green-600">₹{shippingConfig.freeAbove}</span>
                  </div>
                )}
                {shippingConfig?.estimatedDaysMin && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Delivery</span>
                    <span className="text-lg font-black text-slate-700">{shippingConfig.estimatedDaysMin}–{shippingConfig.estimatedDaysMax} days</span>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Method Name</label>
                  <input
                    type="text"
                    value={shipName}
                    onChange={e => setShipName(e.target.value)}
                    placeholder="Standard Delivery"
                    className={INPUT}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Flat Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={shipFlatFee}
                    onChange={e => setShipFlatFee(e.target.value)}
                    placeholder="99"
                    className={INPUT}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Free Shipping Above (₹) <span className="normal-case font-normal text-slate-400">— leave blank to disable</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={shipFreeAbove}
                    onChange={e => setShipFreeAbove(e.target.value)}
                    placeholder="999 (blank = never free)"
                    className={INPUT}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Days Min</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={shipDaysMin}
                    onChange={e => setShipDaysMin(e.target.value)}
                    placeholder="5"
                    className={INPUT}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Days Max</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={shipDaysMax}
                    onChange={e => setShipDaysMax(e.target.value)}
                    placeholder="7"
                    className={INPUT}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400 font-medium max-w-xs">
                  Shipping fee is auto-applied based on the post-discount cart total. Changes apply to all future orders.
                </p>
                <button
                  onClick={handleSaveShipping}
                  disabled={updateShipping.isPending || !shippingDirty}
                  className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  {updateShipping.isPending ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Config</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* ── Payment Gateway Card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="p-3 bg-violet-50 rounded-2xl">
            <CreditCard className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Payment Gateway Charges</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Added to online payments (Razorpay) at checkout</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {gatewayLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            <>
              {/* Current summary */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Gateway fee</span>
                  <span className="text-2xl font-black text-violet-600">{gatewayConfig?.rate}%</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">GST on fee</span>
                  <span className="text-2xl font-black text-violet-600">{gatewayConfig?.taxRate}%</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Status</span>
                  <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${gatewayConfig?.isEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {gatewayConfig?.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gateway Name</label>
                  <input
                    type="text"
                    value={gwName}
                    onChange={e => setGwName(e.target.value)}
                    placeholder="Razorpay"
                    className={INPUT}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gateway Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={gwRate}
                    onChange={e => setGwRate(e.target.value)}
                    placeholder="2"
                    className={INPUT}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">GST on Gateway Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gwTaxRate}
                    onChange={e => setGwTaxRate(e.target.value)}
                    placeholder="18"
                    className={INPUT}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gwEnabled}
                    onChange={e => setGwEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                </label>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {gwEnabled ? 'Gateway charges enabled' : 'Gateway charges disabled'}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {gwEnabled
                      ? 'Customers are charged the gateway fee for online payments.'
                      : 'Gateway fee is absorbed — customers pay no extra charge.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400 font-medium max-w-xs">
                  Effective rate: {gwRate}% + {gwTaxRate}% GST = {(parseFloat(gwRate || '0') * (1 + parseFloat(gwTaxRate || '0') / 100)).toFixed(4)}% per online order.
                  Changes apply to all future orders.
                </p>
                <button
                  onClick={handleSaveGateway}
                  disabled={updateGateway.isPending || !gatewayDirty}
                  className="h-12 px-6 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  {updateGateway.isPending ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Config</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
