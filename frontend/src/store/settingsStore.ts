import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'USD' | 'INR';

interface SettingsState {
  currency: Currency;
  exchangeRate: number; // 1 USD to INR (e.g. 83)
  setCurrency: (currency: Currency) => void;
  updateExchangeRate: (rate: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'INR',
      exchangeRate: 83.50, // Default rate
      setCurrency: (currency) => set({ currency }),
      updateExchangeRate: (rate) => set({ exchangeRate: rate }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
