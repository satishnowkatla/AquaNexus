import { api } from './api';
import { API_URLS } from '../utils/constants';

export interface InsuranceQuote {
  id: string;
  provider: string;
  planName: string;
  coverageAmount: number;
  premium: number;
  currency: string;
  duration: string;
  coverageDetails: string[];
  deductible: number;
}

export interface Claim {
  id: string;
  quoteId: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  amount: number;
  description: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmitClaimPayload {
  quoteId: string;
  amount: number;
  description: string;
  evidence: string[];
  pondId?: string;
}

export const getQuotes = async (params?: {
  coverageType?: string;
  pondSize?: number;
}): Promise<InsuranceQuote[]> => {
  const { data } = await api.get<InsuranceQuote[]>(`${API_URLS.AQUAINSURE}/quotes`, { params });
  return data;
};

export const submitClaim = async (payload: SubmitClaimPayload): Promise<Claim> => {
  const formData = new FormData();
  formData.append('quoteId', payload.quoteId);
  formData.append('amount', String(payload.amount));
  formData.append('description', payload.description);

  payload.evidence.forEach((uri, index) => {
    formData.append('evidence', {
      uri,
      type: 'image/jpeg',
      name: `evidence_${index}.jpg`,
    } as unknown as Blob);
  });

  if (payload.pondId) {
    formData.append('pondId', payload.pondId);
  }

  const { data } = await api.post<Claim>(`${API_URLS.AQUAINSURE}/claims`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

  return data;
};

export const getClaimStatus = async (claimId: string): Promise<Claim> => {
  const { data } = await api.get<Claim>(`${API_URLS.AQUAINSURE}/claims/${claimId}`);
  return data;
};
