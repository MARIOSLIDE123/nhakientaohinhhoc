import React from 'react';
import { Volume2 } from 'lucide-react';
import { RobotMood } from '../types/game';
import { speakVietnamese } from '../utils/sound';

interface RobotCompanionProps {
  mood: RobotMood;
  speech?: string;
  size?: 'sm' | 'md' | 'lg';
  showTrophy?: boolean;
  className?: string;
  bubblePosition?: 'right' | 'top' | 'bottom';
}

export const RobotCompanion: React.FC<RobotCompanionProps> = ({
  mood,
  speech,
  size = 'md',
  showTrophy = false,
  className = '',
  bubblePosition = 'right',
}) => {
  const sizeClass =
    size === 'sm'
      ? 'w-20 h-24'
      : size === 'lg'
        ? 'w-36 h-40 md:w-44 md:h-48'
        : 'w-24 h-28 md:w-28 md:h-32';

  const antennaColor =
    mood === 'celebrating'
      ? '#54C98A'
      : mood === 'surprised'
        ? '#FF9B42'
        : mood === 'thinking'
          ? '#9670E8'
          : '#FFD447';

  const leftArmTransform =
    mood === 'celebrating'
      ? 'rotate(38 42 122)'
      : mood === 'encouraging'
        ? 'rotate(24 42 122)'
        : mood === 'thinking'
          ? 'rotate(12 42 122)'
          : 'rotate(0 42 122)';

  const rightArmTransform =
    mood === 'celebrating'
      ? 'rotate(-42 158 122)'
      : mood === 'thinking'
        ? 'rotate(-108 158 122)'
        : mood === 'encouraging'
          ? 'rotate(-28 158 122)'
          : 'rotate(0 158 122)';

  const renderEyes = () => {
    if (mood === 'happy') {
      return (
        <g>
          <path
            d="M 67 74 Q 76 63 85 74"
            fill="none"
            stroke="#5CE1FF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M 115 74 Q 124 63 133 74"
            fill="none"
            stroke="#5CE1FF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        </g>
      );
    }
    if (mood === 'celebrating') {
      return (
        <g>
          {/* Star-like happy eyes */}
          <path
            d="M 76 62 L 79 69 L 86 72 L 79 75 L 76 82 L 73 75 L 66 72 L 73 69 Z"
            fill="#FFD447"
          />
          <path
            d="M 124 62 L 127 69 L 134 72 L 127 75 L 124 82 L 121 75 L 114 72 L 121 69 Z"
            fill="#FFD447"
          />
        </g>
      );
    }
    if (mood === 'surprised') {
      return (
        <g>
          <circle cx="76" cy="72" r="9" fill="#5CE1FF" />
          <circle cx="78" cy="69" r="3" fill="#FFFFFF" />
          <circle cx="124" cy="72" r="9" fill="#5CE1FF" />
          <circle cx="126" cy="69" r="3" fill="#FFFFFF" />
        </g>
      );
    }
    if (mood === 'thinking') {
      return (
        <g>
          <circle cx="76" cy="73" r="7" fill="#5CE1FF" />
          <circle cx="78" cy="70" r="2.6" fill="#FFFFFF" />
          <path d="M 66 61 L 84 63" stroke="#FFD447" strokeWidth="3" strokeLinecap="round" />
          <circle cx="124" cy="70" r="7.5" fill="#5CE1FF" />
          <circle cx="127" cy="67" r="2.6" fill="#FFFFFF" />
          <path d="M 115 59 Q 124 54 134 59" fill="none" stroke="#FFD447" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }
    // encouraging
    return (
      <g>
        <ellipse cx="76" cy="72" rx="7.5" ry="8.5" fill="#5CE1FF" />
        <circle cx="78.5" cy="68.5" r="2.8" fill="#FFFFFF" />
        <ellipse cx="124" cy="72" rx="7.5" ry="8.5" fill="#5CE1FF" />
        <circle cx="126.5" cy="68.5" r="2.8" fill="#FFFFFF" />
      </g>
    );
  };

  const renderMouth = () => {
    if (mood === 'surprised') {
      return <ellipse cx="100" cy="91" rx="6" ry="7.5" fill="#5CE1FF" />;
    }
    if (mood === 'thinking') {
      return (
        <path
          d="M 90 91 Q 100 88 110 92"
          fill="none"
          stroke="#5CE1FF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      );
    }
    if (mood === 'celebrating') {
      return (
        <path
          d="M 83 86 Q 100 103 117 86 Z"
          fill="#FFD447"
        />
      );
    }
    return (
      <path
        d="M 86 87 Q 100 98 114 87"
        fill="none"
        stroke="#5CE1FF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  };

  const containerFlex =
    bubblePosition === 'top'
      ? 'flex-col-reverse items-center gap-2'
      : bubblePosition === 'bottom'
        ? 'flex-col items-center gap-2'
        : 'flex-row items-center gap-3';

  return (
    <div className={`flex ${containerFlex} ${className}`}>
      <div className={`relative shrink-0 ${sizeClass} animate-robot-bob select-none`}>
        <svg viewBox="0 0 200 220" className="w-full h-full overflow-visible" aria-label="Robot hướng dẫn">
          <defs>
            <linearGradient id="robotWhite" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#EEF5FF" />
              <stop offset="100%" stopColor="#CFE0F7" />
            </linearGradient>
            <linearGradient id="robotBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#42A2FF" />
              <stop offset="100%" stopColor="#1B6EC2" />
            </linearGradient>
            <linearGradient id="robotGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE67A" />
              <stop offset="100%" stopColor="#F5A623" />
            </linearGradient>
            <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B3D75" />
              <stop offset="100%" stopColor="#0E2246" />
            </linearGradient>
          </defs>

          {/* Soft floor shadow */}
          <ellipse cx="100" cy="208" rx="44" ry="8" fill="#183B70" opacity="0.2" />

          {/* Antenna */}
          <line x1="100" y1="28" x2="100" y2="12" stroke="#183B70" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="11" r="8" fill={antennaColor} stroke="#183B70" strokeWidth="2.5" />
          <circle cx="97.5" cy="8.5" r="2.5" fill="#FFFFFF" opacity="0.85" />

          {/* Ear pods */}
          <rect x="26" y="64" width="16" height="32" rx="8" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="3" />
          <rect x="158" y="64" width="16" height="32" rx="8" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="3" />

          {/* Left Arm */}
          <g transform={leftArmTransform} style={{ transition: 'transform 250ms ease' }}>
            <rect x="25" y="118" width="22" height="44" rx="11" fill="url(#robotWhite)" stroke="#183B70" strokeWidth="3" />
            <circle cx="36" cy="164" r="10" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="3" />
          </g>

          {/* Right Arm */}
          <g transform={rightArmTransform} style={{ transition: 'transform 250ms ease' }}>
            <rect x="153" y="118" width="22" height="44" rx="11" fill="url(#robotWhite)" stroke="#183B70" strokeWidth="3" />
            <circle cx="164" cy="164" r="10" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="3" />
            {showTrophy && (
              <g transform="translate(148, 124)">
                <path
                  d="M 6 0 L 28 0 L 25 22 Q 17 30 9 22 Z"
                  fill="url(#robotGold)"
                  stroke="#183B70"
                  strokeWidth="2.4"
                />
                <rect x="14" y="25" width="6" height="10" fill="url(#robotGold)" stroke="#183B70" strokeWidth="2" />
                <rect x="9" y="34" width="16" height="6" rx="2" fill="#183B70" />
              </g>
            )}
          </g>

          {/* Legs */}
          <rect x="68" y="176" width="22" height="24" rx="10" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="3" />
          <rect x="110" y="176" width="22" height="24" rx="10" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="3" />

          {/* Torso */}
          <rect x="50" y="112" width="100" height="70" rx="28" fill="url(#robotWhite)" stroke="#183B70" strokeWidth="3.5" />
          {/* Blue chest panel */}
          <rect x="66" y="124" width="68" height="42" rx="16" fill="url(#robotBlue)" stroke="#183B70" strokeWidth="2.5" />
          {/* Golden geometric emblem on chest (rhombus!) */}
          <polygon
            points="100,132 113,145 100,158 87,145"
            fill="url(#robotGold)"
            stroke="#183B70"
            strokeWidth="2.2"
          />
          {/* Belt */}
          <rect x="64" y="171" width="72" height="8" rx="4" fill="#FFD447" stroke="#183B70" strokeWidth="2" />

          {/* Neck */}
          <rect x="86" y="102" width="28" height="14" rx="5" fill="#2388E8" stroke="#183B70" strokeWidth="2.5" />

          {/* Round Head */}
          <rect x="38" y="28" width="124" height="80" rx="38" fill="url(#robotWhite)" stroke="#183B70" strokeWidth="3.5" />
          {/* Top glossy shine */}
          <path d="M 65 37 Q 100 31 135 37" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />

          {/* Face Visor */}
          <rect x="52" y="46" width="96" height="54" rx="24" fill="url(#visorGrad)" stroke="#2388E8" strokeWidth="2.5" />

          {/* Cheek blushes */}
          <ellipse cx="64" cy="83" rx="6" ry="3.5" fill="#FF9B42" opacity="0.45" />
          <ellipse cx="136" cy="83" rx="6" ry="3.5" fill="#FF9B42" opacity="0.45" />

          {renderEyes()}
          {renderMouth()}
        </svg>
      </div>

      {speech && (
        <div className="relative bg-white border-2 border-[#183B70]/15 rounded-2xl px-4 py-2.5 shadow-md max-w-md">
          <div className="flex items-start gap-2">
            <p className="text-sm md:text-[15px] font-medium text-[#183B70] leading-snug">
              {speech}
            </p>
            <button
              type="button"
              onClick={() => speakVietnamese(speech)}
              title="Nghe Robot đọc"
              aria-label="Nghe Robot đọc"
              className="shrink-0 w-7 h-7 rounded-lg bg-[#EEF6FF] hover:bg-[#2388E8] text-[#2388E8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
