import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState({
    court_availability: true,
    game_invitations: true,
    review_responses: true,
    nearby_courts: true,
    event_reminders: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.notification_preferences) {
        setPreferences(data.notification_preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreference = async (key, value) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Court Availability</Text>
            <Text style={styles.preferenceDescription}>
              Get notified when courts become available
            </Text>
          </View>
          <Switch
            value={preferences.court_availability}
            onValueChange={(value) => updatePreference('court_availability', value)}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Game Invitations</Text>
            <Text style={styles.preferenceDescription}>
              Receive notifications for game invites
            </Text>
          </View>
          <Switch
            value={preferences.game_invitations}
            onValueChange={(value) => updatePreference('game_invitations', value)}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Review Responses</Text>
            <Text style={styles.preferenceDescription}>
              Get notified when someone responds to your reviews
            </Text>
          </View>
          <Switch
            value={preferences.review_responses}
            onValueChange={(value) => updatePreference('review_responses', value)}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Nearby Courts</Text>
            <Text style={styles.preferenceDescription}>
              Notifications about courts in your area
            </Text>
          </View>
          <Switch
            value={preferences.nearby_courts}
            onValueChange={(value) => updatePreference('nearby_courts', value)}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Event Reminders</Text>
            <Text style={styles.preferenceDescription}>
              Get reminded about upcoming games and events
            </Text>
          </View>
          <Switch
            value={preferences.event_reminders}
            onValueChange={(value) => updatePreference('event_reminders', value)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  preferenceTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    maxWidth: '80%',
  },
});