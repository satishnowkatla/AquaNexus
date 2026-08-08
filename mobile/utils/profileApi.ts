import { supabase } from './supabase';

export async function saveUser(userId: string, phone: string, fullName: string) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (existing) {
    return supabase.from('users').update({ full_name: fullName, language: 'te' }).eq('id', userId);
  }
  return supabase.from('users').insert({ id: userId, phone, full_name: fullName, language: 'te' });
}

export async function saveProfile(userId: string, data: Record<string, any>) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) {
    return supabase.from('profiles').update({ ...data }).eq('user_id', userId);
  }
  return supabase.from('profiles').insert({ user_id: userId, ...data });
}

export async function upsertPond(userId: string, pond: { id?: string; name?: string; area_acres: number; species: string; status?: string }) {
  if (pond.id) {
    return supabase.from('ponds').update({
      name: pond.name || 'Pond 1',
      area_acres: pond.area_acres,
      species: pond.species,
      status: pond.status || 'active',
    }).eq('id', pond.id);
  }
  return supabase.from('ponds').insert({
    farmer_id: userId,
    name: pond.name || 'Pond 1',
    area_acres: pond.area_acres,
    species: pond.species,
    status: pond.status || 'active',
  });
}
