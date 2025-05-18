import { supabase } from '@/lib/supabase';

export async function addToFavorites(courtId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('favorite_courts')
      .insert({
        user_id: user.id,
        court_id: courtId,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

export async function removeFromFavorites(courtId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('favorite_courts')
      .delete()
      .eq('user_id', user.id)
      .eq('court_id', courtId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

export async function getFavorites() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('favorite_courts')
      .select(`
        court_id,
        courts (*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data.map(item => item.courts);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export async function isFavorite(courtId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('favorite_courts')
      .select('id')
      .eq('user_id', user.id)
      .eq('court_id', courtId)
      .single();

    if (error) return false;
    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}