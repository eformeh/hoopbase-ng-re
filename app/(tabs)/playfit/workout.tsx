import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CirclePlay as PlayCircle, CircleCheck as CheckCircle, Clock, RotateCcw, Flag } from 'lucide-react-native';
import { fetchWorkout, updateExerciseCompletion } from '@/lib/training';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [workout, setWorkout] = useState(null);
  interface Exercise {
    id: string;
    completed: boolean;
    name: string;
    sets: number;
    reps: number;
    description: string;
    image: string;
    videoUrl?: string;
  }
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWorkout();
  }, [id]);
  
  const loadWorkout = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const workoutData = await fetchWorkout(id as string);
      setWorkout(workoutData);
      setExercises(workoutData.exercises || []);
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleExerciseCompletion = async (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    const newCompletionState = !exercise.completed;
    
    // Update locally first for immediate UI feedback
    setExercises(prevExercises => 
      prevExercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, completed: newCompletionState } 
          : ex
      )
    );
    
    // Then update in the database
    try {
      await updateExerciseCompletion(exerciseId, newCompletionState);
    } catch (error) {
      console.error('Error updating exercise completion:', error);
      
      // Revert the local state if the API call fails
      setExercises(prevExercises => 
        prevExercises.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, completed: exercise.completed } 
            : ex
        )
      );
    }
  };
  
  const isWorkoutComplete = exercises.length > 0 && exercises.every(exercise => exercise.completed);
  const completionPercentage = exercises.length > 0
    ? Math.round(
        (exercises.filter(exercise => exercise.completed).length / exercises.length) * 100
      )
    : 0;
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }
  
  if (!workout) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Workout not found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.workoutTitle}>{workout.title}</Text>
        <Text style={styles.workoutDescription}>{workout.description}</Text>
        
        <View style={styles.workoutMetadata}>
          <View style={styles.metadataItem}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.metadataText}>{workout.duration}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.progressCard}>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completionPercentage}% Complete
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Exercises</Text>
      
      {exercises.map((exercise, index) => (
        <View key={exercise.id} style={styles.exerciseCard}>
          <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
          
          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDetails}>
              {exercise.sets} sets × {exercise.reps} reps
            </Text>
            <Text style={styles.exerciseDescription}>
              {exercise.description}
            </Text>
            
            <View style={styles.exerciseActions}>
              {exercise.videoUrl && (
                <TouchableOpacity style={styles.watchButton}>
                  <PlayCircle size={20} color="#F97316" />
                  <Text style={styles.watchButtonText}>Watch Demo</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.completeButton,
                  exercise.completed ? styles.completedButton : {}
                ]}
                onPress={() => toggleExerciseCompletion(exercise.id)}
              >
                {exercise.completed ? (
                  <>
                    <RotateCcw size={18} color="#FFFFFF" />
                    <Text style={styles.completedButtonText}>Undo</Text>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} color="#F97316" />
                    <Text style={styles.completeButtonText}>Mark Done</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
      
      <TouchableOpacity 
        style={[
          styles.finishWorkoutButton,
          isWorkoutComplete ? styles.finishWorkoutButtonActive : styles.finishWorkoutButtonDisabled
        ]}
        disabled={!isWorkoutComplete}
        onPress={() => router.back()}
      >
        <Flag size={20} color={isWorkoutComplete ? "#FFFFFF" : "#94A3B8"} />
        <Text 
          style={[
            styles.finishWorkoutButtonText,
            isWorkoutComplete ? styles.finishWorkoutButtonTextActive : styles.finishWorkoutButtonTextDisabled
          ]}
        >
          Finish Workout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  workoutTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 4,
  },
  workoutDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#475569',
    marginBottom: 12,
  },
  workoutMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  progressCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: '#10B981',
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
    marginHorizontal: 16,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 16,
  },
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
  },
  watchButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#F97316',
    marginLeft: 6,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  completeButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#475569',
    marginLeft: 6,
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  completedButtonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  finishWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  finishWorkoutButtonActive: {
    backgroundColor: '#F97316',
  },
  finishWorkoutButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  finishWorkoutButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  finishWorkoutButtonTextActive: {
    color: '#FFFFFF',
  },
  finishWorkoutButtonTextDisabled: {
    color: '#94A3B8',
  },
});