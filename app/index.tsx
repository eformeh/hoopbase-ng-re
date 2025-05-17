import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { session } = useAuth();
  
  if (!session) {
    return <Redirect href="/auth" />;
  }
  
  return <Redirect href="/(tabs)" />;
}