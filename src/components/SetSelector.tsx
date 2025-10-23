import { Check } from 'lucide-react';

type SetSelectorProps = {
  currentSet: number;
  totalSets: number;
  completedSets: Set<number>;
  onSetChange: (setNumber: number) => void;
};

export function SetSelector({ currentSet, totalSets, completedSets, onSetChange }: SetSelectorProps) {
  return (
    <div className="flex items-center gap-3 px-6">
      {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => (
        <button
          key={setNum}
          onClick={() => onSetChange(setNum)}
          className={`flex-1 h-12 rounded-2xl font-semibold text-lg transition-all ${
            completedSets.has(setNum)
              ? 'bg-[#02bcd5] text-white'
              : currentSet === setNum
              ? 'bg-[#6d6ec0] text-white border-2 border-white-400'
              : 'bg-[#6d6ec0] text-white'
          } flex items-center justify-center`}
        >
          {completedSets.has(setNum) ? (
            <Check className="w-7 h-7" strokeWidth={3} />
          ) : (
            setNum
          )}
        </button>
      ))}
    </div>
  );
}
