import { Check, Play, Timer } from 'lucide-react';
import { RestTimer } from './RestTimer';

type SetDetailsProps = {
  setNumber: number;
  weight: number;
  duration: number;
  completed: boolean;
  restTime: number;
  showRestTimer: boolean;
  isPending: boolean;
  onWeightChange: (weight: number) => void;
  onDurationChange: (duration: number) => void;
  onToggleComplete: () => void;
  onRestTimeChange: (time: number) => void;
  onDismissRestTimer: () => void;
  onRestTimerComplete: () => void;
};

export function SetDetails({
  setNumber,
  weight,
  duration,
  completed,
  restTime,
  showRestTimer,
  isPending,
  onWeightChange,
  onDurationChange,
  onToggleComplete,
  onRestTimeChange,
  onDismissRestTimer,
  onRestTimerComplete,
}: SetDetailsProps) {
  return (
    <div className="px-4">
      <div className={`backdrop-blur-sm rounded-2xl py-1 transition-all duration-300 ${
          completed
          ? 'bg-[#017afd]' 
          : isPending
          ? 'bg-[#1d213e]'
          : 'bg-[#1d213e]'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white px-2 text-lg font-semibold">Set {setNumber}</h3>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="5" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="10" cy="15" r="2" />
            </svg>
          </button>
        </div>

        {showRestTimer ? (
          <RestTimer
            restTime={restTime}
            onRestTimeChange={onRestTimeChange}
            isActive={showRestTimer}
            onDismiss={onDismissRestTimer}
            onRestTimerComplete={onRestTimerComplete}
          />
        ) : (
          <div className={`rounded-2xl py-6 px-2 flex items-center justify-between gap-2 transition-all duration-300 ${
            completed 
              ? 'bg-[#02bcd5]' 
              : 'bg-[#6d6ec0]'
          }`}>
            <button
              className={`flex-1 rounded-3xl py-1 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                completed 
                  ? 'bg-[#02bcd5] border border-white-400' 
                
                  : 'bg-indigo-200/60 hover:bg-indigo-600/80'
              }`}
              onClick={() => onWeightChange(weight + 2.5)}
            >
              <span className="text-white text-sm font-small">Added Weight</span>
              <span className={`${
                completed ? 'text-white' : 'text-black'} text-sm font-bold`}>{weight > 0 ? weight : '0'} KG</span>
            </button>

            <button
              onClick={onToggleComplete}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                completed
                  ? 'bg-[#02bcd5] border border-white-400'
                  : isPending
                  ? 'bg-blue-500/80'
                  : 'bg-indigo-200/60'
              }`}
            >
              {completed ? (
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              ) : isPending ? (
                <Play className="w-10 h-10 text-white" strokeWidth={3} />
              ) : (
                <Play className="w-10 h-10" fill="currentColor" strokeWidth={1} stroke="white"/>
              )}
            </button>

            <button
              className={`flex-1 rounded-3xl py-1 px-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                completed 
                  ? 'bg-[#02bcd5] border border-white-400' 
                  : 'bg-indigo-200/60 hover:bg-indigo-600/80'
              }`}
              onClick={() => onDurationChange(duration + 5)}
            >
              <span className="text-white text-sm font-medium">Time</span>
              <span className={`${
                completed ? 'text-white' : 'text-black'}  text-sm font-bold`}>{duration}s</span>
            </button>
            
          </div>
        )}
        <div className="flex items-center justify-between p-2 mb-1">
          <div className="flex items-center">
          <Timer className="w-4 h-4 text-white" />
          <h3 className="text-white text-lg font-semibold">Rest time</h3>
          </div>
          <span className="text-white text-m font-medium">1min</span>
         
        </div>
      </div>
      
    </div>
  );
}