import { create } from 'zustand';

// Simplified settings store — currency switcher removed.
// All prices are displayed in INR only.
interface SettingsState {
  // Kept for any future settings additions
  _placeholder?: never;
}

export const useSettingsStore = create<SettingsState>()(() => ({}));
