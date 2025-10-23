import exercisesData from '../data/exercises.json';

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: string;
  media_url: string | null;
  media_type: 'image' | 'video';
  duration_seconds: number;
};

export type ExerciseSet = {
  id: string;
  exercise_id: string;
  set_number: number;
  completed: boolean;
  weight_kg: number;
  duration_seconds: number;
  rest_time_seconds: number;
};

// Local storage key for persisting data
const STORAGE_KEY = 'exercise-guided-data';

// Get data from JSON file only (no localStorage)
export function getLocalData() {
  return exercisesData;
}

// No longer saving to localStorage - using state management only
export function saveLocalData(data: typeof exercisesData) {
  // No-op: data is now managed by React state
}

// Get exercise data - randomly select from available exercises
export function getExercise(): Exercise | null {
  const data = getLocalData();
  const randomIndex = Math.floor(Math.random() * data.exercises.length);
  return data.exercises[randomIndex] || null;
}

// Get a new random exercise (for when user wants to change exercise)
export function getNewRandomExercise(currentExerciseId?: string): Exercise | null {
  const data = getLocalData();
  
  // Filter out the current exercise to ensure we get a different one
  let availableExercises = data.exercises;
  if (currentExerciseId) {
    availableExercises = data.exercises.filter((ex: Exercise) => ex.id !== currentExerciseId);
  }
  
  // If no other exercises available, use all exercises
  if (availableExercises.length === 0) {
    availableExercises = data.exercises;
  }
  
  const randomIndex = Math.floor(Math.random() * availableExercises.length);
  const selectedExercise = availableExercises[randomIndex];
  
  console.log('Loading new exercise:', selectedExercise?.name);
  return selectedExercise || null;
}

// Get sets for an exercise - always create fresh sets
export function getExerciseSets(exerciseId: string): ExerciseSet[] {
  // Always create fresh sets for each exercise
  const newSets: ExerciseSet[] = Array.from({ length: 4 }, (_, i) => ({
    id: crypto.randomUUID(),
    exercise_id: exerciseId,
    set_number: i + 1,
    completed: false,
    weight_kg: 0,
    duration_seconds: 45,
    rest_time_seconds: 15,
  }));
  
  return newSets;
}

// Update a set - no-op since we're using state management only
export function updateSet(setId: string, updates: Partial<ExerciseSet>) {
  // No-op: data is now managed by React state
  return null;
}
