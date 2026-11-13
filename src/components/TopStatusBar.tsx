import React from 'react';
import { ArrowLeft, BookOpen, Star, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/sound';

interface TopStatusBarProps {
  stageName: string;
  completedCount: number;
  totalCount: number;
  totalScore: number;
  onBackToMap: () => void;
  onOpenKnowledge: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  stageName,
  completedCount,
  totalCount,
  totalScore,
  onBackToMap,
  onOpenKnowledge,
  muted,
  onToggleMute,
}) => {
  const pct = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b-2 border-[#183B70]/12 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Zone 1: Back + Stage Name */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBackToMap();
          }}
          className="btn-3d px-3 py-1.5 rounded-xl bg-[#EEF6FF] hover:bg-[#2388E8] text-[#183B70] hover:text-white font-display font-bold text-sm border border-[#2388E8]/30 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bản đồ</span>
        </button>
        <h1 className="font-display font-extrabold text-base md:text-lg text-[#183B70] truncate">
          {stageName}
        </h1>
      </div>

      {/* Zone 2: Progress Bar & Question Count */}
      <div className="flex items-center gap-3 flex-1 max-w-xs md:max-w-sm">
        <div className="w-full h-3.5 bg-[#E2E8F0] rounded-full overflow-hidden border border-[#183B70]/10">
          <div
            className="h-full bg-[#54C98A] transition-all duration-300 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-num font-bold text-sm text-[#183B70] whitespace-nowrap shrink-0">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Zone 3: Score + Knowledge + Audio */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#FFF6D6] border-2 border-[#FFD447] rounded-xl px-3 py-1">
          <Star className="w-4 h-4 text-[#FF9B42] fill-[#FFD447]" />
          <span className="font-num font-extrabold text-base text-[#183B70]">
            {totalScore}
          </span>
          <span className="text-xs font-bold text-[#183B70]/75">điểm</span>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onOpenKnowledge();
          }}
          className="btn-3d px-3 py-1.5 rounded-xl bg-[#9670E8] hover:bg-[#8259db] text-white font-display font-bold text-sm border-b-2 border-[#5b3ca3] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Kiến thức</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="w-9 h-9 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#183B70] flex items-center justify-center transition-colors cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
