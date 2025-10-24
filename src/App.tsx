import { useEffect, useState } from 'react';
import { Exercise, ExerciseSet, getExercise, getExerciseSets, updateSet, getNewRandomExercise } from './lib/data';
import { ExerciseHeader } from './components/ExerciseHeader';
import { MediaDisplay } from './components/MediaDisplay';
import { SetSelector } from './components/SetSelector';
import { SetDetails } from './components/SetDetails';
import { NavigationFooter } from './components/NavigationFooter';

function App() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExerciseData();
  }, []);

  function loadExerciseData() {
    try {
      const exerciseData = getExercise();
      
      if (exerciseData) {
        setExercise(exerciseData);
        
        const setsData = getExerciseSets(exerciseData.id);
        
        if (setsData && setsData.length > 0) {
          setSets(setsData);
          const completed = new Set(
            setsData.filter((s) => s.completed).map((s) => s.set_number)
          );
          setCompletedSets(completed);
        }
      }
    } catch (error) {
      console.error('Error loading exercise data:', error);
    } finally {
      setLoading(false);
    }
  }

  const currentSetData = sets.find((s) => s.set_number === currentSet);

  const handleSetChange = (setNumber: number) => {
    setCurrentSet(setNumber);
    setShowRestTimer(false);
    setIsPending(false);
  };

  const handleToggleComplete = () => {
    if (!currentSetData) return;

    // If set is already completed, reset it to not completed
    if (currentSetData.completed) {
      const updatedSets = sets.map((s) =>
        s.set_number === currentSet
          ? { ...s, completed: false }
          : s
      );

      setSets(updatedSets);
      updateSet(currentSetData.id, { completed: false });
      setCompletedSets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentSet);
        return newSet;
      });
      setShowRestTimer(false);
      setIsPending(false);
      return;
    }

    // If we're in pending state, complete the set
    if (isPending) {
      const updatedSets = sets.map((s) =>
        s.set_number === currentSet
          ? { ...s, completed: true }
          : s
      );

      setSets(updatedSets);
      updateSet(currentSetData.id, { completed: true });
      setCompletedSets((prev) => new Set([...prev, currentSet]));
      setIsPending(false);
      setShowRestTimer(false);
      return;
    }

    // Start the set (pending state + timer)
    const updatedSets = sets.map((s) =>
      s.set_number === currentSet
        ? { ...s, completed: false }
        : s
    );

    setSets(updatedSets);
    updateSet(currentSetData.id, { completed: false });
    setShowRestTimer(true);
    setIsPending(true);
  };

  const handleWeightChange = (weight: number) => {
    if (!currentSetData) return;

    const updatedSets = sets.map((s) =>
      s.set_number === currentSet ? { ...s, weight_kg: weight } : s
    );
    setSets(updatedSets);
    updateSet(currentSetData.id, { weight_kg: weight });
  };

  const handleDurationChange = (duration: number) => {
    if (!currentSetData) return;

    const updatedSets = sets.map((s) =>
      s.set_number === currentSet ? { ...s, duration_seconds: duration } : s
    );
    setSets(updatedSets);
    updateSet(currentSetData.id, { duration_seconds: duration });
  };

  const handleRestTimeChange = (restTime: number) => {
    if (!currentSetData) return;

    const updatedSets = sets.map((s) =>
      s.set_number === currentSet ? { ...s, rest_time_seconds: restTime } : s
    );
    setSets(updatedSets);
    updateSet(currentSetData.id, { rest_time_seconds: restTime });
  };

  const handleDismissRestTimer = () => {
    if (!currentSetData) return;
    
    // X button pressed - mark set as complete
    const updatedSets = sets.map((s) =>
      s.set_number === currentSet
        ? { ...s, completed: true }
        : s
    );

    setSets(updatedSets);
    updateSet(currentSetData.id, { completed: true });
    setCompletedSets((prev) => new Set([...prev, currentSet]));
    setShowRestTimer(false);
    setIsPending(false);
  };

  const handleRestTimerComplete = () => {
    if (!currentSetData) return;
    
    // Timer completed - mark set as complete
    const updatedSets = sets.map((s) =>
      s.set_number === currentSet
        ? { ...s, completed: true }
        : s
    );

    setSets(updatedSets);
    updateSet(currentSetData.id, { completed: true });
    setCompletedSets((prev) => new Set([...prev, currentSet]));
    setShowRestTimer(false);
    setIsPending(false);
  };

  const handleNewExercise = () => {
    console.log('Info icon clicked, current exercise:', exercise?.name);
    const newExercise = getNewRandomExercise(exercise?.id);
    console.log('New exercise selected:', newExercise?.name);
    
    if (newExercise) {
      setExercise(newExercise);
      setCurrentSet(1);
      setCompletedSets(new Set());
      setShowRestTimer(false);
      setIsPending(false);
      
      // Load sets for the new exercise
      const newSets = getExerciseSets(newExercise.id);
      setSets(newSets);
      console.log('Exercise updated, new sets:', newSets.length);
    } else {
      console.log('No new exercise found');
    }
  };

  const totalDuration = sets.reduce((acc, set) => acc + set.duration_seconds, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2d2e67] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#2d2e67] flex items-center justify-center">
        <div className="text-white text-xl">No exercise found. Please add an exercise to the database.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2d2e67] flex flex-col">
      <ExerciseHeader onNewExercise={handleNewExercise} />

      <div className="flex-1 flex flex-col justify-between pb-6">
        <div className="space-y-8">
          <MediaDisplay
            key={exercise.id}
            mediaUrl={exercise.media_url}
            mediaType={exercise.media_type}
            exerciseName={exercise.name}
          />

          <SetSelector
            key={`selector-${exercise.id}`}
            currentSet={currentSet}
            totalSets={4}
            completedSets={completedSets}
            onSetChange={handleSetChange}
            isPending={isPending}
          />

          {currentSetData && (
            <SetDetails
              key={`details-${exercise.id}-${currentSet}`}
              setNumber={currentSet}
              weight={currentSetData.weight_kg}
              duration={currentSetData.duration_seconds}
              completed={currentSetData.completed}
              restTime={currentSetData.rest_time_seconds}
              showRestTimer={showRestTimer}
              isPending={isPending}
              onWeightChange={handleWeightChange}
              onDurationChange={handleDurationChange}
              onToggleComplete={handleToggleComplete}
              onRestTimeChange={handleRestTimeChange}
              onDismissRestTimer={handleDismissRestTimer}
              onRestTimerComplete={handleRestTimerComplete}
            />
          )}
        </div>

        <NavigationFooter
          totalDuration={totalDuration}
          onBack={() => console.log('Back clicked')}
        />
      </div>
    </div>
  );
}

export default App;
