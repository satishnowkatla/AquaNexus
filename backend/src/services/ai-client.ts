import axios from 'axios';
import { env } from '../config/env';

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const aiService = {
  diagnoseDisease: async (data: any) => {
    const response = await aiClient.post('/ai/disease/diagnose', data);
    return response.data;
  },

  chat: async (data: any) => {
    const response = await aiClient.post('/ai/advisor/chat', data);
    return response.data;
  },

  parseVoice: async (data: any) => {
    const response = await aiClient.post('/ai/voice/parse', data);
    return response.data;
  },

  calculateFeed: async (data: any) => {
    const response = await aiClient.post('/ai/feed/calculate', data);
    return response.data;
  },
};

export default aiClient;
