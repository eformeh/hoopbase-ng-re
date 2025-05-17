import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, initialized } = useAuth();
  
  // Show loading while initializing
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }
  
  // After initialization, redirect based on session
  if (!session) {
    return <Redirect href="/auth" />;
  }
  
  return <Redirect href="/(tabs)" />;
}