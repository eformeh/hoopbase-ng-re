import { Stack } from 'expo-router';

export default function CourtMapLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: true, 
          title: 'Find Courts',
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
        name="court-details" 
        options={{ 
          headerShown: true,
          title: 'Court Details',
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
        name="add-court" 
        options={{ 
          headerShown: true,
          title: 'Add New Court',
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