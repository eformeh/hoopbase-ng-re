import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(data.session);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session) {
        // Ensure profile exists when user signs in
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single();
          
        if (!profile && !profileError) {
          // Create profile if it doesn't exist
          await supabase.from('profiles').insert({
            id: session.user.id,
            username: session.user.email?.split('@')[0],
            created_at: new Date().toISOString(),
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, initialized, loading, error };
}