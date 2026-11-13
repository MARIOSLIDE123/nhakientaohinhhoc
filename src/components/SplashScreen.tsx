import React, { useState } from 'react';
import { BookOpen, HelpCircle, Play, Sparkles } from 'lucide-react';
import cityBg from '../assets/images/bg_geometry_city_1794534592002.jpg';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';
import { soundEngine } from '../utils/sound';

interface SplashScreenProps {
  onStart: () => void;
  onOpenGuide: () => void;
  onOpenKnowledge: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStart,
  onOpenGuide,
  onOpenKnowledge,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#2388E8] via-[#60B4FF] to-[#E0F2FE] p-5 md:p-8">
      {/* Pixar-3D Geometry City Backdrop with zero-broken-image fallback */}
      {!imgError && (
        <img
          src={cityBg}
          alt="Thành phố hình học kỳ diệu"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#183B70]/55 via-[#183B70]/25 to-[#183B70]/70 pointer-events-none" />

      {/* Floating 3D-shaded mathematical shapes */}
      <div className="hidden md:block absolute top-8 left-8 w-28 h-24 animate-float-slow pointer-events-none">
        <GeometryShape kind="parallelogram" color="#FFD447" rotationDeg={-18} lean={1} />
      </div>
      <div className="hidden md:block absolute top-10 right-10 w-24 h-24 animate-float-reverse pointer-events-none">
        <GeometryShape kind="rhombus" color="#9670E8" rotationDeg={26} />
      </div>
      <div className="hidden md:block absolute bottom-24 left-12 w-24 h-20 animate-float-reverse pointer-events-none">
        <GeometryShape kind="rhombus" color="#54C98A" rotationDeg={-30} />
      </div>
      <div className="hidden md:block absolute bottom-24 right-12 w-28 h-24 animate-float-slow pointer-events-none">
        <GeometryShape kind="parallelogram" color="#FF9B42" rotationDeg={15} lean={-1} />
      </div>

      {/* Top Curriculum Attribution */}
      <div className="relative z-10 text-center">
        <p className="text-xs md:text-sm font-semibold text-white/95 tracking-wide drop-shadow">
          Toán lớp 4 · Kết nối tri thức với cuộc sống · Bài 31: Hình bình hành, hình thoi
        </p>
      </div>

      {/* Center Hero Title + Robot */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl my-auto py-2">
        <div className="bg-white/92 backdrop-blur-md border-4 border-[#FFD447] rounded-3xl px-6 py-4 md:px-10 md:py-6 shadow-2xl mb-4">
          <h1 className="font-display text-2xl sm:text-3xl md:text-[42px] font-extrabold text-[#183B70] leading-tight tracking-tight text-balance">
            THỬ TÀI NHÀ KIẾN TẠO HÌNH HỌC
          </h1>
          <p className="mt-2 text-base md:text-xl font-bold text-[#2388E8] flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF9B42] shrink-0" />
            <span>Khám phá thế giới hình bình hành và hình thoi!</span>
          </p>
        </div>

        <RobotCompanion
          mood="happy"
          size="lg"
          bubblePosition="right"
          speech="Xin chào bạn nhỏ! Tớ là Robo-Hình Học. Hãy cùng tớ vượt qua 4 chặng thử thách để nhận danh hiệu Nhà kiến tạo hình học nhé!"
        />
      </div>

      {/* Bottom Primary & Secondary Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onStart();
          }}
          className="btn-3d px-8 py-3.5 md:px-10 md:py-4 rounded-2xl bg-[#FFD447] hover:bg-[#ffdc64] text-[#183B70] font-display font-extrabold text-lg md:text-xl border-b-4 border-[#d99b00] shadow-xl flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
        >
          <Play className="w-6 h-6 fill-[#183B70]" />
          <span>BẮT ĐẦU KHÁM PHÁ</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onOpenGuide();
          }}
          className="btn-3d px-5 py-3.5 rounded-2xl bg-white hover:bg-[#EEF6FF] text-[#183B70] font-display font-bold text-base md:text-lg border-b-4 border-[#94a3b8] shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <HelpCircle className="w-5 h-5 text-[#2388E8]" />
          <span>HƯỚNG DẪN CHƠI</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onOpenKnowledge();
          }}
          className="btn-3d px-5 py-3.5 rounded-2xl bg-[#9670E8] hover:bg-[#8259db] text-white font-display font-bold text-base md:text-lg border-b-4 border-[#5b3ca3] shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <BookOpen className="w-5 h-5" />
          <span>KIẾN THỨC CẦN NHỚ</span>
        </button>
      </div>
    </div>
  );
};
