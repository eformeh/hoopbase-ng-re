import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export type Profile = {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  notification_preferences?: {
    court_availability: boolean;
    game_invitations: boolean;
    review_responses: boolean;
    nearby_courts: boolean;
    event_reminders: boolean;
  };
};

export async function fetchProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(updates: Partial<Profile>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

export async function uploadAvatar(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission denied');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    // Upload to storage
    const ext = result.assets[0].uri.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, {
        uri: result.assets[0].uri,
        type: `image/${ext}`,
        name: fileName,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl }, error: urlError } = await supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (urlError) throw urlError;

    // Update profile
    await updateProfile({ avatar_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}