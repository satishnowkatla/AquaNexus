export const API_URL = 'https://aquanexus-4ikz.onrender.com';
export const API_URLS = {
  BASE: API_URL,
  AQUADOC: `${API_URL}/api/aquadoc`,
  AQUAADVISOR: `${API_URL}/api/aquaadvisor`,
  AQUAFEED: `${API_URL}/api/aquafeed`,
  AQUAVOICE: `${API_URL}/api/aquavoice`,
  AQUACONNECT: `${API_URL}/api/aquaconnect`,
  AQUAINSURE: `${API_URL}/api/aquainsure`,
  AQUAMARKET: `${API_URL}/api/aquamarket`,
  AQUASCHEME: `${API_URL}/api/aquascheme`,
};
export const AI_SERVICE_URL = 'http://localhost:8000';
export const SUPABASE_URL = 'https://tptqayoquxiaupfnoqpj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdHFheW9xdXhpYXVwZm5vcXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NzgxNDcsImV4cCI6MjEwMDM1NDE0N30.MZrjnDm_PlBITpRCKWdWm9HpmKljQ9PKsMNGBeXO7cc';

export const SUPPORTED_LANGUAGES = ['te', 'hi', 'en'] as const;

export const SPECIES_LIST = [
  'Shrimp',
  'Rohu',
  'Catla',
  'Mrigal',
  'Tilapia',
  'Pangasius',
  'Others',
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ONBOARDING_DONE: 'onboarding_done',
  LANGUAGE: 'language',
};
