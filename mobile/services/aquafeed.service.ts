import { api } from './api';
import { API_URLS } from '../utils/constants';

export interface FeedCalculation {
  totalFeedKg: number;
  feedPerMeal: number;
  mealsPerDay: number;
  feedCost: number;
  feedType: string;
  proteinContent: number;
  fcr: number;
}

export interface FeedScheduleEntry {
  id: string;
  time: string;
  feedAmountKg: number;
  feedType: string;
  pondId: string;
  day: string;
  notes?: string;
}

export interface CalculateFeedPayload {
  pondId: string;
  fishWeight: number;
  fishCount: number;
  species: string;
  waterTemperature: number;
}

export const calculateFeed = async (payload: CalculateFeedPayload): Promise<FeedCalculation> => {
  const { data } = await api.post<FeedCalculation>(`${API_URLS.AQUAFEED}/calculate`, payload);
  return data;
};

export const getFeedSchedule = async (pondId: string): Promise<FeedScheduleEntry[]> => {
  const { data } = await api.get<FeedScheduleEntry[]>(`${API_URLS.AQUAFEED}/schedule`, {
    params: { pondId },
  });
  return data;
};
