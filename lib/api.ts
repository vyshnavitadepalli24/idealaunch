'use client';

import { supabase } from './supabase/client';

export async function toggleFavourite(ideaId: string, currentlySaved: boolean) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Not authenticated' };

  if (currentlySaved) {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userData.user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } else {
    const { error } = await supabase
      .from('favourites')
      .insert({ idea_id: ideaId, user_id: userData.user.id });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
}

export async function isFavourited(ideaId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data } = await supabase
    .from('favourites')
    .select('id')
    .eq('idea_id', ideaId)
    .eq('user_id', userData.user.id)
    .maybeSingle();
  return !!data;
}
