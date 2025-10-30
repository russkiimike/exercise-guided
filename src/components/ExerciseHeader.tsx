import { Info, Clock } from 'lucide-react';

type ExerciseHeaderProps = {
  onNewExercise?: () => void;
  onToggleAudioSet?: () => void;
};

export function ExerciseHeader({ onNewExercise, onToggleAudioSet }: ExerciseHeaderProps) {
  const handleClick = () => {
    console.log('Info button clicked');
    if (onNewExercise) {
      onNewExercise();
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-6">
      <button 
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-[#6d6ec0] backdrop-blur-sm flex items-center justify-center hover:bg-indigo-700/50 transition-colors"
      >
        <Info className="w-6 h-6 text-white" />
      </button>
      <img className='w-100 h-10 rounded-full' src="https://www.gymstreak.com/images/gymstreaklogo.svg" alt="GymStreak" />

      <button onClick={onToggleAudioSet} className="w-14 h-14 rounded-full bg-[#6d6ec0] backdrop-blur-sm flex items-center justify-center hover:bg-indigo-700/50 transition-colors">
        <Clock className="w-6 h-6 text-white" />
      </button>
    </header>
  );
}
