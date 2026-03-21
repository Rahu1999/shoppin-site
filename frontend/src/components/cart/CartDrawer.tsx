'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useFetchCart, useRemoveCartItem, useUpdateCartItem } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settingsStore';
import { formatPrice } from '@/utils/price';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  // We use the hook to ensure React Query fetches the latest if stale.
  useFetchCart();
  const { items, total } = useCartStore();
  const { currency, exchangeRate } = useSettingsStore();
  const updateQuantity = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full p-4 space-y-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Your cart is currently empty.</p>
              <Button onClick={onClose} variant="outline" className="mt-4">Continue Shopping</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm relative group hover:border-primary/30 transition-colors">
                
                <div className="h-20 w-20 flex-shrink-0 bg-slate-50 rounded-md overflow-hidden relative">
                  <Image 
                    src={(item.product as any)?.imageUrl || (item.product as any)?.images?.[0]?.url || '/placeholder.png'} 
                    alt={item.product?.name || 'Product'} 
                    fill 
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="pr-6">
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
                      {item.product?.name}
                    </h4>
                    <p className="text-primary font-bold mt-1">
                      {formatPrice(Number(item.price), currency, exchangeRate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-md bg-white">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                        }}
                        className="p-1 text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1 || updateQuantity.isPending}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                         className="p-1 text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
                         disabled={updateQuantity.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem.mutate(item.id)}
                  className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  disabled={removeItem.isPending}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(total, currency, exchangeRate)}
                </span>
              </div>
              <p className="text-xs text-slate-500">Shipping and taxes calculated at checkout.</p>
            </div>
            <Link href="/checkout" onClick={onClose} className="block w-full">
              <Button className="w-full py-6 text-base shadow-lg shadow-primary/20 gap-2">
                Checkout Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart" onClick={onClose} className="block w-full mt-2 text-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
              View Cart Details
            </Link>
          </div>
        )}

      </div>
    </>
  );
}
