import { Check, Play } from 'lucide-react';
import { RestTimer } from './RestTimer';

type SetDetailsProps = {
  setNumber: number;
  weight: number;
  duration: number;
  completed: boolean;
  restTime: number;
  showRestTimer: boolean;
  onWeightChange: (weight: number) => void;
  onDurationChange: (duration: number) => void;
  onToggleComplete: () => void;
  onRestTimeChange: (time: number) => void;
  onDismissRestTimer: () => void;
};

export function SetDetails({
  setNumber,
  weight,
  duration,
  completed,
  restTime,
  showRestTimer,
  onWeightChange,
  onDurationChange,
  onToggleComplete,
  onRestTimeChange,
  onDismissRestTimer,
}: SetDetailsProps) {
  return (
    <div className="px-4">
      <div className={`backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 ${
        completed 
          ? 'bg-teal-900/40 border border-teal-500/30' 
          : 'bg-[#1d213e]'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white text-lg font-semibold">Set {setNumber}</h3>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="5" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="15" r="1.5" />
            </svg>
          </button>
        </div>

        {showRestTimer ? (
          <RestTimer
            restTime={restTime}
            onRestTimeChange={onRestTimeChange}
            isActive={showRestTimer}
            onDismiss={onDismissRestTimer}
          />
        ) : (
          <div className={`rounded-3xl p-4 flex items-center justify-between gap-4 transition-all duration-300 ${
            completed 
              ? 'bg-teal-600/60' 
              : 'bg-[#6d6ec0]'
          }`}>
            <button
              className={`flex-1 rounded-2xl py-4 px-4 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                completed 
                  ? 'bg-teal-700/60 hover:bg-teal-700/80' 
                  : 'bg-indigo-600/60 hover:bg-indigo-600/80'
              }`}
              onClick={() => onWeightChange(weight + 2.5)}
            >
              <span className="text-white/70 text-sm font-medium">Added Weight</span>
              <span className="text-white text-2xl font-bold">{weight > 0 ? weight : '0'}</span>
              <span className="text-white/70 text-xs font-medium">KG</span>
            </button>

            <button
              onClick={onToggleComplete}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                completed
                  ? 'bg-[#]'
                  : 'bg-indigo-800/60'
              }`}
            >
              {completed ? (
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              ) : (
                <Play className="w-10 h-10 text-white/40" strokeWidth={3} />
              )}
            </button>

            <button
              className={`flex-1 rounded-2xl py-4 px-4 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                completed 
                  ? 'bg-teal-700/60 hover:bg-teal-700/80' 
                  : 'bg-indigo-600/60 hover:bg-indigo-600/80'
              }`}
              onClick={() => onDurationChange(duration + 5)}
            >
              <span className="text-white/70 text-sm font-medium">Time</span>
              <span className="text-white text-2xl font-bold">{duration}</span>
              <span className="text-white/70 text-xs font-medium">s</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



{/*When the rest timer is going create a pending state when the rest time is finished thats a complete state, during pending state only change Set selector icon to play and make it sligjtly blue/*}