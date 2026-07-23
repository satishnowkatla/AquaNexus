import api from './api';
import { API_URLS } from '../utils/constants';

export interface Cooperative {
  id: string;
  name: string;
  description: string;
  location: string;
  memberCount: number;
  maxMembers: number;
  species: string[];
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  phone: string;
  role: 'member' | 'admin' | 'owner';
  ponds: number;
  joinedAt: string;
}

export const getCooperatives = async (params?: {
  location?: string;
  species?: string;
}): Promise<Cooperative[]> => {
  const { data } = await api.get<Cooperative[]>(`${API_URLS.AQUACONNECT}/cooperatives`, { params });
  return data;
};

export const joinCooperative = async (cooperativeId: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `${API_URLS.AQUACONNECT}/cooperatives/${cooperativeId}/join`,
  );
  return data;
};

export const getMembers = async (cooperativeId: string): Promise<Member[]> => {
  const { data } = await api.get<Member[]>(
    `${API_URLS.AQUACONNECT}/cooperatives/${cooperativeId}/members`,
  );
  return data;
};
