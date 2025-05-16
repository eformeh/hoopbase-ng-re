import { Stack } from 'expo-router';

export default function InjuryLogLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: true, 
          title: 'Injury Tracker',
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
        name="add-entry" 
        options={{ 
          headerShown: true,
          title: 'New Entry',
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
        name="entry-details" 
        options={{ 
          headerShown: true,
          title: 'Entry Details',
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