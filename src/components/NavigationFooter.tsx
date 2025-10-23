import { ChevronLeft } from 'lucide-react';
import { BlobCharacter } from './BlobCharacter';

type NavigationFooterProps = {
  totalDuration: number;
  onBack: () => void;
};

export function NavigationFooter({ totalDuration, onBack }: NavigationFooterProps) {
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <footer className="px-6 pb-8 flex items-center justify-between gap-4">
      <button
        onClick={onBack}
        className="w-16 h-16 rounded-full bg-[#6d6ec0] backdrop-blur-sm flex items-center justify-center hover:bg-indigo-700/50 transition-colors"
      >
        <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

      <div className="flex-1 bg-[#6d6ec0] backdrop-blur-sm rounded-full py-5 px-8 flex items-center justify-center">
        <span className="text-white text-2xl font-bold tracking-wide">{timeDisplay}s</span>
      </div>

      <button className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center shadow-lg">
        <BlobCharacter size={28} />
      </button>
    </footer>
  );
}
