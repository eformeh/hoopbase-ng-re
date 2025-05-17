import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('useAuth initialized');
    
    // Get initial session
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
        } else {
          console.log('Session fetched:', data.session ? 'exists' : 'null');
          setSession(data.session);
        }
        setInitialized(true);
      } catch (err) {
        console.error('Exception in getSession:', err);
        setInitialized(true);
      }
    };
    
    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'exists' : 'null');
      setSession(session);
    });

    console.log('Subscription set up:', subscription.id);
    
    return () => {
      console.log('Unsubscribing auth listener');
      subscription.unsubscribe();
    };
  }, []);

  return { session, initialized };
}