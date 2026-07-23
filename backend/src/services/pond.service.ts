import { supabase } from "../config/supabase";
import { ApiError } from "../utils/apiError";
import { Pond } from "../types";

export async function createPond(userId: string, data: Omit<Pond, "id" | "user_id" | "created_at" | "updated_at">): Promise<Pond> {
  const { data: pond, error } = await supabase
    .from("ponds")
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  if (error) throw ApiError.internal(error.message);
  return pond;
}

export async function getPondsByUser(userId: string): Promise<Pond[]> {
  const { data, error } = await supabase
    .from("ponds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data || [];
}

export async function getPondById(id: string, userId: string): Promise<Pond> {
  const { data, error } = await supabase
    .from("ponds")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw ApiError.notFound("Pond not found");
  return data;
}

export async function updatePond(id: string, userId: string, updates: Partial<Pond>): Promise<Pond> {
  const { data, error } = await supabase
    .from("ponds")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw ApiError.internal(error.message);
  return data;
}

export async function deletePond(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("ponds")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw ApiError.internal(error.message);
}
