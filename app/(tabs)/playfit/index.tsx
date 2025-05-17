import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CirclePlay as PlayCircle, CircleCheck as CheckCircle, Calendar } from 'lucide-react-native';
import { fetchTrainingPlans, fetchTodaysWorkout } from '@/lib/training';

export default function PlayFitScreen() {
  const router = useRouter();
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const plans = await fetchTrainingPlans();
      setTrainingPlans(plans);

      const workout = await fetchTodaysWorkout();
      setTodaysWorkout(workout);
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrainingPlanItem = ({ item }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() => router.push({
        pathname: '/playfit/plan-details',
        params: { id: item.id }
      })}>
      <Image source={{ uri: item.image }} style={styles.planImage} />
      <View style={styles.planDetails}>
        <Text style={styles.planTitle}>{item.title}</Text>
        <View style={styles.planMetadata}>
          <View style={styles.metaItem}>
            <Calendar size={16} color="#64748B" />
            <Text style={styles.metaText}>{item.duration}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading training plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Today's workout card */}
      {todaysWorkout ? (
        <TouchableOpacity
          style={styles.todaysWorkoutCard}
          onPress={() => router.push({
            pathname: '/playfit/workout',
            params: { id: todaysWorkout.id }
          })}>
          <View style={styles.workoutCardContent}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <Text style={styles.workoutTitle}>{todaysWorkout.title}</Text>
            <Text style={styles.workoutExerciseCount}>
              {todaysWorkout.exercises.length} exercises
            </Text>
          </View>
          <View style={styles.workoutCardAction}>
            <PlayCircle size={28} color="#F97316" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noWorkoutCard}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          <Text style={styles.noWorkoutText}>No workout scheduled for today</Text>
        </View>
      )}

      {/* Training plans section */}
      <Text style={styles.sectionTitle}>Training Plans</Text>
      {trainingPlans.length > 0 ? (
        <FlatList
          data={trainingPlans}
          renderItem={renderTrainingPlanItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plansList}
        />
      ) : (
        <View style={styles.noPlansContainer}>
          <Text style={styles.noPlansText}>No training plans available</Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 8,
  },
  todaysWorkoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  workoutExerciseCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  workoutCardAction: {
    backgroundColor: '#FFF7ED',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plansList: {
    paddingBottom: 90,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  planImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  planDetails: {
    padding: 16,
  },
  planTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 8,
  },
  planMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  metaBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
  },
});