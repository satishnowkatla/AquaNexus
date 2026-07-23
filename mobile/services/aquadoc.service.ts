import { api } from './api';
import { API_URLS } from '../utils/constants';

export interface DiagnosisResult {
  id: string;
  disease: string;
  confidence: number;
  description: string;
  treatment: string[];
  prevention: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  imageUrl: string;
  createdAt: string;
}

export interface DiagnosisRequest {
  imageUri: string;
  pondId?: string;
  symptoms?: string;
}

export const diagnoseImage = async (payload: DiagnosisRequest): Promise<DiagnosisResult> => {
  const formData = new FormData();
  formData.append('image', {
    uri: payload.imageUri,
    type: 'image/jpeg',
    name: 'diagnosis.jpg',
  } as unknown as Blob);

  if (payload.pondId) {
    formData.append('pondId', payload.pondId);
  }
  if (payload.symptoms) {
    formData.append('symptoms', payload.symptoms);
  }

  const { data } = await api.post<DiagnosisResult>(`${API_URLS.AQUADOC}/diagnose`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

  return data;
};
