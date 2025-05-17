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

export async function fetchCourts(): Promise<Court[]> {
  try {
    const { data, error } = await supabase
      .from('courts')
      .select('*');
      
    if (error) throw error;
    
    // Transform the data to match the expected format
    return data.map(court => ({
      id: court.id,
      name: court.name,
      address: court.address,
      image: court.images?.[0] || '', // Use first image as the main image
      images: court.images || [],
      description: court.description || '',
      rating: court.rating || 0,
      totalRatings: court.total_ratings || 0,
      isBusy: court.is_busy || false,
      busyTimes: court.busy_times || [],
      freeAccess: court.free_access || true,
      entranceFee: court.entrance_fee || '',
      hasLighting: court.has_lighting || false,
      surface: court.surface || 'Concrete',
      basketHeight: court.basket_height || 'Standard (10ft)',
      latitude: court.latitude || 0,
      longitude: court.longitude || 0,
    }));
  } catch (error) {
    console.error('Error fetching courts:', error);
    return [];
  }
}

export async function fetchCourtById(id: string): Promise<Court | null> {
  try {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    // Fetch comments for this court (you would need to create a comments table)
    let comments = [];
    try {
      const { data: commentsData } = await supabase
        .from('court_comments')
        .select('*')
        .eq('court_id', id)
        .order('created_at', { ascending: false });
        
      if (commentsData) {
        comments = commentsData.map(comment => ({
          id: comment.id,
          user: comment.user_id, // You might want to fetch user details separately
          text: comment.comment,
          date: new Date(comment.created_at).toLocaleDateString(),
          rating: comment.rating || 0,
        }));
      }
    } catch (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Transform to match the expected format
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
      entranceFee: data.entrance_fee || '',
      hasLighting: data.has_lighting || false,
      surface: data.surface || 'Concrete',
      basketHeight: data.basket_height || 'Standard (10ft)',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      comments: comments,
    };
  } catch (error) {
    console.error('Error fetching court by ID:', error);
    return null;
  }
}