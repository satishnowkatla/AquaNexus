import api from './api';
import { API_URLS } from '../utils/constants';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SendMessagePayload {
  message: string;
  context?: string;
  pondId?: string;
}

export interface SendMessageResponse {
  reply: string;
  messageId: string;
  suggestions?: string[];
}

export const sendMessage = async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
  const { data } = await api.post<SendMessageResponse>(`${API_URLS.AQUAADVISOR}/chat`, payload);
  return data;
};

export const getChatHistory = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<ChatMessage[]> => {
  const { data } = await api.get<ChatMessage[]>(`${API_URLS.AQUAADVISOR}/chat/history`, {
    params,
  });
  return data;
};
