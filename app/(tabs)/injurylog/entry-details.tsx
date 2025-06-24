import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, MapPin } from 'lucide-react-native';
import { fetchPainLogById, getPainLevelColor, getPainLevelLabel } from '@/lib/injury';

type PainLog = {
  id: string;
  date: string;
  pain_level: number;
  location: string;
  notes?: string;
  rehab?: string[];
};
export default function EntryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [painLog, setPainLog] = useState<PainLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    loadPainLog();
  }, [id]);

  const loadPainLog = async () => {
    try {
      setLoading(true);
      const log = await fetchPainLogById(id as string);
      setPainLog(log);
    } catch (error) {
      console.error('Error loading pain log:', error);
      alert('Failed to load entry details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading entry details...</Text>
      </View>
    );
  }

  if (!painLog) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Entry not found</Text>
      </View>
    );
  }

 return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={18} color="#64748B" />
          <Text style={styles.dateText}>{painLog.date}</Text>
        </View>
        <View
          style={[
            styles.painLevelBadge,
            { backgroundColor: `${getPainLevelColor(painLog.pain_level)}20` },
          ]}
        >
          <Text
            style={[
              styles.painLevelText,
              { color: getPainLevelColor(painLog.pain_level) },
            ]}
          >
            {getPainLevelLabel(painLog.pain_level)} Pain ({painLog.pain_level}/10)
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Injury Location</Text>
        <View style={styles.locationContainer}>
          <MapPin size={18} color="#64748B" />
          <Text style={styles.locationText}>{painLog.location}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notesText}>{painLog.notes || 'No notes provided'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rehab Activities</Text>
        {painLog.rehab && painLog.rehab.length > 0 ? (
          <View style={styles.rehabContainer}>
            {painLog.rehab.map((activity, index) => (
              <View key={activity + index} style={styles.rehabItem}>
                <Text style={styles.rehabText}>{activity}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No rehab activities recorded</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#334155',
    marginLeft: 8,
  },
  painLevelBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  painLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#334155',
    marginLeft: 8,
  },
  notesText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  rehabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rehabItem: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    margin: 4,
  },
  rehabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#475569',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
});