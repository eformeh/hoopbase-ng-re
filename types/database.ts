export interface Court {
  id: string;
  name: string;
  address: string;
  description?: string;
  images: string[];
  rating: number;
  total_ratings: number;
  is_busy: boolean;
  busy_times: string[];
  free_access: boolean;
  entrance_fee?: string;
  has_lighting: boolean;
  surface: string;
  basket_height: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface CourtComment {
  id: string;
  court_id: string;
  user_id: string;
  text: string;
  rating: number;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}