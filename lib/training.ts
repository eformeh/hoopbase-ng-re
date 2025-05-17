import { supabase } from '@/lib/supabase';

export type TrainingPlan = {
  id: string;
  title: string;
  image: string;
  description: string;
  duration: string;
  difficulty: string;
  workouts_per_week: number;
  completion_rate: number;
  user_id?: string;
};

export type Workout = {
  id: string;
  title: string;
  description: string;
  duration: string;
  plan_id?: string;
  exercises: Exercise[];
  day?: string;
  week?: number;
  theme?: string;
  completed?: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  description: string;
  image: string;
  video_url?: string;
  workout_id?: string;
  completed?: boolean;
};

export async function fetchTrainingPlans() {
  try {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*');
      
    if (error) throw error;
    
    return data.map(plan => ({
      id: plan.id,
      title: plan.title,
      image: plan.image,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      workoutsPerWeek: plan.workouts_per_week,
      completionRate: plan.completion_rate || 0,
    }));
  } catch (error) {
    console.error('Error fetching training plans:', error);
    return [];
  }
}

export async function fetchTrainingPlanById(id: string) {
  try {
    const { data, error } = await supabase
      .from('training_plans')
      .select(`
        *,
        plan_weeks:training_plan_weeks(
          week,
          theme,
          workouts:plan_workouts(
            id,
            title,
            day,
            completed
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Transform into the format expected by the UI
    const weeklyBreakdown = data.plan_weeks.map(planWeek => ({
      week: planWeek.week,
      theme: planWeek.theme,
      workouts: planWeek.workouts.map(workout => ({
        id: workout.id,
        day: workout.day,
        title: workout.title,
        completed: workout.completed || false,
      })),
    }));
    
    return {
      id: data.id,
      title: data.title,
      image: data.image,
      description: data.description,
      duration: data.duration,
      difficulty: data.difficulty,
      workoutsPerWeek: data.workouts_per_week,
      completionRate: data.completion_rate || 0,
      weeklyBreakdown,
    };
  } catch (error) {
    console.error('Error fetching training plan by ID:', error);
    return null;
  }
}

export async function fetchWorkout(id: string) {
  try {
    const { data: workoutData, error: workoutError } = await supabase
      .from('plan_workouts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (workoutError) throw workoutError;
    
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', id);
      
    if (exercisesError) throw exercisesError;
    
    return {
      ...workoutData,
      exercises: exercisesData.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        description: exercise.description,
        image: exercise.image,
        videoUrl: exercise.video_url,
        completed: exercise.completed || false,
      })),
    };
  } catch (error) {
    console.error('Error fetching workout:', error);
    return null;
  }
}

export async function fetchTodaysWorkout() {
  try {
    // In a real app, this would be more intelligent and fetch based on the user's plan and progress
    const { data, error } = await supabase
      .from('plan_workouts')
      .select(`
        *,
        workout_exercises(*)
      `)
      .limit(1);
      
    if (error) throw error;
    
    if (data.length === 0) return null;
    
    return {
      id: data[0].id,
      title: data[0].title,
      description: data[0].description,
      duration: data[0].duration || '45 minutes',
      exercises: data[0].workout_exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        description: exercise.description,
        image: exercise.image,
        videoUrl: exercise.video_url,
        completed: exercise.completed || false,
      })),
    };
  } catch (error) {
    console.error('Error fetching today\'s workout:', error);
    return null;
  }
}

export async function updateExerciseCompletion(exerciseId: string, completed: boolean) {
  try {
    const { error } = await supabase
      .from('workout_exercises')
      .update({ completed })
      .eq('id', exerciseId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating exercise completion:', error);
    return false;
  }
}