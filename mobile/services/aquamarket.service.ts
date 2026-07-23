import { api } from './api';
import { API_URLS } from '../utils/constants';

export interface PriceData {
  id: string;
  species: string;
  market: string;
  pricePerKg: number;
  currency: string;
  trend: 'up' | 'down' | 'stable';
  date: string;
  region: string;
}

export interface Buyer {
  id: string;
  name: string;
  company: string;
  phone: string;
  location: string;
  species: string[];
  rating: number;
  verified: boolean;
}

export interface MarketAnalysis {
  species: string;
  averagePrice: number;
  priceRange: { min: number; max: number };
  demandLevel: 'low' | 'medium' | 'high';
  supplyLevel: 'low' | 'medium' | 'high';
  prediction: string;
  updatedAt: string;
}

export const getPrices = async (params?: {
  species?: string;
  region?: string;
}): Promise<PriceData[]> => {
  const { data } = await api.get<PriceData[]>(`${API_URLS.AQUAMARKET}/prices`, { params });
  return data;
};

export const getBuyers = async (params?: {
  species?: string;
  location?: string;
}): Promise<Buyer[]> => {
  const { data } = await api.get<Buyer[]>(`${API_URLS.AQUAMARKET}/buyers`, { params });
  return data;
};

export const getMarketAnalysis = async (species: string): Promise<MarketAnalysis> => {
  const { data } = await api.get<MarketAnalysis>(`${API_URLS.AQUAMARKET}/analysis`, {
    params: { species },
  });
  return data;
};
