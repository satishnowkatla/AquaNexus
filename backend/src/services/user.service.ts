import { supabase } from "../config/supabase";
import { ApiError } from "../utils/apiError";
import { User } from "../types";

export async function getUserById(id: string): Promise<User> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
  if (error || !data) throw ApiError.notFound("User not found");
  delete data.password;
  return data;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw ApiError.internal(error.message);
  delete data.password;
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw ApiError.internal(error.message);
}
