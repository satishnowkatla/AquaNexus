import { api } from './api';
import { API_URLS } from '../utils/constants';

export interface Scheme {
  id: string;
  name: string;
  description: string;
  provider: string;
  eligibility: string[];
  benefits: string;
  deadline: string;
  applicationUrl?: string;
  category: string;
}

export interface SchemeMatch {
  scheme: Scheme;
  matchScore: number;
  matchedCriteria: string[];
  missingCriteria: string[];
}

export interface MatchSchemesPayload {
  pondCount?: number;
  species?: string[];
  landSize?: number;
  state?: string;
  category?: string;
}

export const getSchemes = async (params?: {
  category?: string;
  state?: string;
}): Promise<Scheme[]> => {
  const { data } = await api.get<Scheme[]>(`${API_URLS.AQUASCHEME}/schemes`, { params });
  return data;
};

export const matchSchemes = async (payload: MatchSchemesPayload): Promise<SchemeMatch[]> => {
  const { data } = await api.post<SchemeMatch[]>(`${API_URLS.AQUASCHEME}/match`, payload);
  return data;
};
