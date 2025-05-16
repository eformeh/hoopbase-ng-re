import { Stack } from 'expo-router';

export default function PlayFitLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: true, 
          title: 'Training Plans',
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="plan-details" 
        options={{ 
          headerShown: true,
          title: 'Plan Details',
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="workout" 
        options={{ 
          headerShown: true,
          title: 'Today\'s Workout',
          headerTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}