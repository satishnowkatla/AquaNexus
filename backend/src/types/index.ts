export interface User {
  id: string;
  phone: string;
  full_name: string;
  role: string;
  language: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  district: string;
  village: string;
  pincode: string;
  total_pond_area: number;
  primary_species: string;
  years_experience: number;
  created_at: string;
}

export interface Pond {
  id: string;
  farmer_id: string;
  name: string;
  area_acres: number;
  species: string;
  stocking_density: number;
  stocking_date: string;
  expected_harvest_date: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface DiseaseReport {
  id: string;
  farmer_id: string;
  pond_id: string;
  image_url: string;
  voice_description: string;
  symptoms: string[];
  diagnosis: string;
  severity: string;
  treatment: string;
  medicine_name: string;
  medicine_dosage: string;
  follow_up_date: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  farmer_id: string;
  pond_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  voice_text: string;
  transaction_date: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  module: string;
  message: string;
  response: string;
  language: string;
  created_at: string;
}

export interface FeedSchedule {
  id: string;
  pond_id: string;
  feed_type: string;
  morning_kg: number;
  evening_kg: number;
  total_daily_kg: number;
  feed_grade: string;
  cumulative_cost: number;
  start_date: string;
  end_date: string;
  created_at: string;
}
