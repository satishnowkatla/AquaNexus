import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from './constants';

async function getHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Request failed');
  return json.data;
}

// Auth
export const authApi = {
  sendOtp: (phone: string) =>
    request<void>('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; user: any; isNewUser: boolean }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  register: (data: { phone: string; full_name: string; district: string; village: string; primary_species: string }) =>
    request<{ token: string; user: any }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request<any>('/api/auth/me'),
};

// AquaDoc
export const aquadocApi = {
  diagnose: (body: { imageBase64?: string; voiceDescription?: string; species?: string }) =>
    request<any>('/api/aquadoc/diagnose', { method: 'POST', body: JSON.stringify(body) }),

  history: () => request<any[]>('/api/aquadoc/history'),
};

// AquaVoice
export const aquavoiceApi = {
  record: (body: { text: string; language?: string }) =>
    request<any>('/api/aquavoice/record', { method: 'POST', body: JSON.stringify(body) }),

  ledger: () => request<any[]>('/api/aquavoice/ledger'),

  summary: () =>
    request<{ totalIncome: number; totalExpense: number; profit: number; transactionCount: number }>('/api/aquavoice/summary'),
};

// AquaAdvisor
export const aquaadvisorApi = {
  chat: (message: string, language?: string) =>
    request<{ id: string; message: string; response: string; suggestions: string[] }>('/api/aquaadvisor/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    }),

  history: () => request<any[]>('/api/aquaadvisor/history'),
};

// AquaFeed
export const aquafeedApi = {
  calculate: (body: { species?: string; area_acres?: number; stocking_density?: number; stocking_days?: number }) =>
    request<any>('/api/aquafeed/calculate', { method: 'POST', body: JSON.stringify(body) }),
};

// AquaConnect
export const aquaconnectApi = {
  dashboard: () => request<any>('/api/aquaconnect/dashboard'),
  alerts: () => request<any[]>('/api/aquaconnect/alerts'),
  members: () => request<any[]>('/api/aquaconnect/members'),
};

// Token helpers
export const tokenStore = {
  save: (token: string) => AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
  get: () => AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
};
