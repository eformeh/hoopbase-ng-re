import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CirclePlay as PlayCircle, CircleCheck as CheckCircle, Calendar } from 'lucide-react-native';

// Mock data for training plans
const TRAINING_PLANS = [
  {
    id: '1',
    title: 'Jump Higher in 4 Weeks',
    image: 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg',
    duration: '4 weeks',
    difficulty: 'Intermediate',
    completionRate: 0,
  },
  {
    id: '2',
    title: 'Ball Handling Mastery',
    image: 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg',
    duration: '6 weeks',
    difficulty: 'Beginner',
    completionRate: 0,
  },
  {
    id: '3',
    title: 'Shooting Fundamentals',
    image: 'https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg',
    duration: '8 weeks',
    difficulty: 'All Levels',
    completionRate: 0,
  },
  {
    id: '4',
    title: 'Defensive Strength',
    image: 'https://images.pexels.com/photos/2346/sport-high-united-states-of-america-ball.jpg',
    duration: '5 weeks',
    difficulty: 'Advanced',
    completionRate: 0,
  },
];

// Mock data for today's workout
const TODAYS_WORKOUT = {
  title: 'Explosive Legs Day',
  exercises: [
    { id: '1', name: 'Squat Jumps', sets: 3, reps: 12 },
    { id: '2', name: 'Lunges', sets: 4, reps: 10 },
    { id: '3', name: 'Calf Raises', sets: 3, reps: 15 },
  ],
};

export default function PlayFitScreen() {
  const router = useRouter();
  const [activePlan, setActivePlan] = useState(null);

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

  return (
    <View style={styles.container}>
      {/* Today's workout card */}
      <TouchableOpacity
        style={styles.todaysWorkoutCard}
        onPress={() => router.push('/playfit/workout')}>
        <View style={styles.workoutCardContent}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          <Text style={styles.workoutTitle}>{TODAYS_WORKOUT.title}</Text>
          <Text style={styles.workoutExerciseCount}>
            {TODAYS_WORKOUT.exercises.length} exercises
          </Text>
        </View>
        <View style={styles.workoutCardAction}>
          <PlayCircle size={28} color="#F97316" />
        </View>
      </TouchableOpacity>

      {/* Training plans section */}
      <Text style={styles.sectionTitle}>Training Plans</Text>
      <FlatList
        data={TRAINING_PLANS}
        renderItem={renderTrainingPlanItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.plansList}
      />
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