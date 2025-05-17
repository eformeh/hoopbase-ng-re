import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    
    // Save token to user's profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ expo_push_token: token.data })
        .eq('id', user.id);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }
}

export async function startLocationUpdates() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    // Start location updates
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      async (location) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update user's location
        await supabase
          .from('user_locations')
          .upsert({
            user_id: user.id,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            last_updated: new Date(),
          });

        // Check for nearby courts
        checkNearbyCourts(location.coords);
      }
    );
  } catch (error) {
    console.error('Error starting location updates:', error);
  }
}

async function checkNearbyCourts({ latitude, longitude }) {
  try {
    const { data: courts } = await supabase
      .rpc('find_nearby_courts', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: 5,
      });

    if (courts?.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Courts Nearby!',
          body: `There are ${courts.length} basketball courts near you.`,
          data: { courts },
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error('Error checking nearby courts:', error);
  }
}

export async function scheduleEventReminder(event) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: event.title,
        body: event.description,
        data: { event },
      },
      trigger: {
        date: new Date(event.date),
      },
    });
  } catch (error) {
    console.error('Error scheduling event reminder:', error);
  }
}