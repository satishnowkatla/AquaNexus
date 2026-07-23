import api from './api';
import { API_URLS } from '../utils/constants';

export interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  duration: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  pondId?: string;
  createdAt: string;
}

export interface CreateTransactionPayload {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date?: string;
  pondId?: string;
}

export const transcribeVoice = async (audioUri: string): Promise<TranscriptionResult> => {
  const formData = new FormData();
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as unknown as Blob);

  const { data } = await api.post<TranscriptionResult>(`${API_URLS.AQUAVOICE}/transcribe`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

  return data;
};

export const getTransactions = async (params?: {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  pondId?: string;
}): Promise<Transaction[]> => {
  const { data } = await api.get<Transaction[]>(`${API_URLS.AQUAVOICE}/transactions`, { params });
  return data;
};

export const createTransaction = async (payload: CreateTransactionPayload): Promise<Transaction> => {
  const { data } = await api.post<Transaction>(`${API_URLS.AQUAVOICE}/transactions`, payload);
  return data;
};
