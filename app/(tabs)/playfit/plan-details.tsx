import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CircleCheck as CheckCircle, Calendar, Clock, ChartLine as LineChart, TrendingUp } from 'lucide-react-native';

// Mock data for training plan details
const PLANS = {
  '1': {
    id: '1',
    title: 'Jump Higher in 4 Weeks',
    image: 'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg',
    description: 'Improve your vertical jump with this science-backed training program designed for basketball players.',
    duration: '4 weeks',
    difficulty: 'Intermediate',
    workoutsPerWeek: 3,
    completionRate: 0,
    weeklyBreakdown: [
      {
        week: 1,
        theme: 'Foundation',
        workouts: [
          { id: 'w1d1', day: 'Monday', title: 'Lower Body Strength', completed: false },
          { id: 'w1d2', day: 'Wednesday', title: 'Plyometric Basics', completed: false },
          { id: 'w1d3', day: 'Friday', title: 'Core & Stability', completed: false },
        ]
      },
      {
        week: 2,
        theme: 'Power Development',
        workouts: [
          { id: 'w2d1', day: 'Monday', title: 'Explosive Strength', completed: false },
          { id: 'w2d2', day: 'Wednesday', title: 'Jump Variations', completed: false },
          { id: 'w2d3', day: 'Friday', title: 'Dynamic Stretching', completed: false },
        ]
      },
      {
        week: 3,
        theme: 'Intensity',
        workouts: [
          { id: 'w3d1', day: 'Monday', title: 'Max Effort Jumps', completed: false },
          { id: 'w3d2', day: 'Wednesday', title: 'Reactive Training', completed: false },
          { id: 'w3d3', day: 'Friday', title: 'Speed & Agility', completed: false },
        ]
      },
      {
        week: 4,
        theme: 'Performance',
        workouts: [
          { id: 'w4d1', day: 'Monday', title: 'Jump Integration', completed: false },
          { id: 'w4d2', day: 'Wednesday', title: 'Game Situations', completed: false },
          { id: 'w4d3', day: 'Friday', title: 'Final Assessment', completed: false },
        ]
      },
    ]
  },
  '2': {
    id: '2',
    title: 'Ball Handling Mastery',
    image: 'https://images.pexels.com/photos/3755440/pexels-photo-3755440.jpeg',
    description: 'Master the art of ball handling with progressive drills designed to improve your control and confidence.',
    duration: '6 weeks',
    difficulty: 'Beginner',
    workoutsPerWeek: 4,
    completionRate: 0,
    weeklyBreakdown: [
      {
        week: 1,
        theme: 'Basics',
        workouts: [
          { id: 'w1d1', day: 'Monday', title: 'Stationary Dribbling', completed: false },
          { id: 'w1d2', day: 'Tuesday', title: 'Hand Coordination', completed: false },
          { id: 'w1d3', day: 'Thursday', title: 'Basic Movements', completed: false },
          { id: 'w1d4', day: 'Friday', title: 'Dribble Sequences', completed: false },
        ]
      },
      // Additional weeks would be defined here
    ]
  },
  // Additional plans would be defined here
};

export default function PlanDetailsScreen() {
  const { id } = useLocalSearchParams();
  const plan = PLANS[id as string];

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plan not found</Text>
      </View>
    );
  }

  const renderWeekItem = ({ item }) => (
    <View style={styles.weekContainer}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekTitle}>Week {item.week}: {item.theme}</Text>
      </View>
      
      {item.workouts.map((workout) => (
        <TouchableOpacity key={workout.id} style={styles.workoutItem}>
          <View style={styles.workoutDay}>
            <Text style={styles.dayText}>{workout.day}</Text>
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{workout.title}</Text>
          </View>
          <View style={styles.completionStatus}>
            <CheckCircle 
              size={24} 
              color={workout.completed ? '#10B981' : '#E2E8F0'}
              fill={workout.completed ? '#10B981' : 'transparent'}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: plan.image }} style={styles.headerImage} />
      
      <View style={styles.contentContainer}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        
        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Calendar size={18} color="#64748B" />
            <Text style={styles.metadataText}>{plan.duration}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Clock size={18} color="#64748B" />
            <Text style={styles.metadataText}>{plan.workoutsPerWeek}x per week</Text>
          </View>
          <View style={styles.metadataBadge}>
            <Text style={styles.metadataBadgeText}>{plan.difficulty}</Text>
          </View>
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <LineChart size={18} color="#0891B2" />
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${plan.completionRate}%` }]} />
          </View>
          
          <Text style={styles.progressText}>{plan.completionRate}% Complete</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
        
        <FlatList
          data={plan.weeklyBreakdown}
          renderItem={renderWeekItem}
          keyExtractor={(item) => `week-${item.week}`}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  planTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  metadataBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  metadataBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#475569',
  },
  planDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0F172A',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0891B2',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  weekContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekHeader: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  weekTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#334155',
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  workoutDay: {
    width: 80,
  },
  dayText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#334155',
  },
  completionStatus: {
    width: 40,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});