import React from 'react';
import { Award, Star } from 'lucide-react';

interface EffectsOverlayProps {
  starBurstKey: number;
  badgePopup: { title: string; bonus: number } | null;
  onCloseBadgePopup?: () => void;
  showConfetti?: boolean;
}

const CONFETTI_COLORS = ['#FFD447', '#2388E8', '#54C98A', '#FF9B42', '#9670E8'];

export const EffectsOverlay: React.FC<EffectsOverlayProps> = ({
  starBurstKey,
  badgePopup,
  onCloseBadgePopup,
  showConfetti = false,
}) => {
  return (
    <>
      {/* Quick floating star burst when answering correctly */}
      {starBurstKey > 0 && (
        <div
          key={starBurstKey}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <div className="relative w-72 h-72 flex items-center justify-center animate-pop-in">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
              <div
                key={deg}
                className="absolute transition-all duration-500"
                style={{
                  transform: `rotate(${deg}deg) translateY(-76px)`,
                }}
              >
                <Star
                  className="w-7 h-7 drop-shadow"
                  fill={CONFETTI_COLORS[idx % CONFETTI_COLORS.length]}
                  color="#183B70"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confetti rain for victory */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => {
            const left = `${(i * 3.7) % 100}%`;
            const delay = `${(i % 7) * 0.35}s`;
            const duration = `${3.2 + (i % 4) * 0.6}s`;
            const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            return (
              <div
                key={i}
                className="absolute top-0 w-3 h-3 rounded-sm"
                style={{
                  left,
                  backgroundColor: color,
                  animation: `confettiFall ${duration} linear ${delay} infinite`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Stage completion badge popup */}
      {badgePopup && (
        <div className="fixed inset-0 z-50 bg-[#183B70]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-[#FFD447] shadow-2xl max-w-md w-full p-6 text-center animate-pop-in">
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-[#FFF6D6] border-2 border-[#FFD447] flex items-center justify-center shadow-inner">
              <Award className="w-11 h-11 text-[#FF9B42]" />
            </div>
            <h3 className="font-display text-2xl font-extrabold text-[#183B70] mb-1">
              Hoàn thành xuất sắc!
            </h3>
            <p className="text-base font-semibold text-[#2388E8] mb-3">
              Huy hiệu: {badgePopup.title}
            </p>
            <div className="bg-[#ECFDF5] border border-[#54C98A] rounded-2xl py-2.5 px-4 mb-5 inline-flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FF9B42] fill-[#FFD447]" />
              <span className="font-num font-bold text-[#183B70] text-lg">
                +{badgePopup.bonus} điểm thưởng hoàn thành chặng
              </span>
            </div>
            <div>
              <button
                type="button"
                onClick={onCloseBadgePopup}
                className="btn-3d w-full py-3 px-6 rounded-2xl bg-[#54C98A] hover:bg-[#45b87b] text-[#183B70] font-display font-extrabold text-lg border-b-4 border-[#359a64] cursor-pointer"
              >
                TIẾP TỤC HÀNH TRÌNH
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
