import { create } from 'zustand';

interface SettingsStore {
  language: string;
  theme: 'light' | 'dark';
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  language: 'te',
  theme: 'light',
  setLanguage: (lang) => set({ language: lang }),
  setTheme: (theme) => set({ theme }),
}));
