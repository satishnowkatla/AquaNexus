import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  full_name: string;
  role: string;
  language: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user) =>
    set({ token, user, isAuthenticated: true }),
  logout: () =>
    set({ token: null, user: null, isAuthenticated: false }),
}));
