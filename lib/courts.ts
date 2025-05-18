import { supabase } from '@/lib/supabase';

export type Court = {
  id: string;
  name: string;
  address: string;
  image: string;
  images: string[];
  description: string;
  rating: number;
  totalRatings: number;
  isBusy: boolean;
  busyTimes: string[];
  freeAccess: boolean;
  entranceFee?: string;
  hasLighting: boolean;
  surface: string;
  basketHeight: string;
  latitude: number;
  longitude: number;
  comments?: Array<{
    id: string;
    user: string;
    text: string;
    date: string;
    rating: number;
  }>;
};

const COURTS_PER_PAGE = 10;

export async function fetchCourts(page = 1): Promise<{ courts: Court[]; hasMore: boolean }> {
  try {
    const start = (page - 1) * COURTS_PER_PAGE;
    const end = start + COURTS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('courts')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const courts = data.map(transformCourtData);
    const hasMore = count ? count > (page * COURTS_PER_PAGE) : false;
    
    return { courts, hasMore };
  } catch (error) {
    console.error('Error fetching courts:', error);
    return { courts: [], hasMore: false };
  }
}

export async function fetchCourtById(id: string): Promise<Court | null> {
  try {
    // Fetch court data
    const { data: courtData, error: courtError } = await supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (courtError) throw courtError;
    if (!courtData) return null;
    
    // Fetch comments with user details
    const { data: comments, error: commentsError } = await supabase
      .from('court_comments')
      .select(`
        id,
        text,
        rating,
        created_at,
        profiles (username)
      `)
      .eq('court_id', id)
      .order('created_at', { ascending: false });
      
    if (commentsError) throw commentsError;
    
    return {
      ...transformCourtData(courtData),
      comments: comments?.map(comment => ({
        id: comment.id,
        user: comment.profiles?.username || 'Anonymous',
        text: comment.text,
        date: new Date(comment.created_at).toLocaleDateString(),
        rating: comment.rating,
      })) || [],
    };
  } catch (error) {
    console.error('Error fetching court by ID:', error);
    return null;
  }
}

export async function addCourtComment(
  courtId: string,
  text: string,
  rating: number
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('court_comments').insert({
      court_id: courtId,
      user_id: user.id,
      text,
      rating,
    });

    if (error) throw error;

    // Update court rating
    await supabase.rpc('update_court_rating', { court_id: courtId });

    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
}

function transformCourtData(data: any): Court {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    image: data.images?.[0] || '',
    images: data.images || [],
    description: data.description || '',
    rating: data.rating || 0,
    totalRatings: data.total_ratings || 0,
    isBusy: data.is_busy || false,
    busyTimes: data.busy_times || [],
    freeAccess: data.free_access || true,
    entranceFee: data.entrance_fee,
    hasLighting: data.has_lighting || false,
    surface: data.surface || 'Concrete',
    basketHeight: data.basket_height || 'Standard (10ft)',
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
  };
}