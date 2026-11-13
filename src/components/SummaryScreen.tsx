import React, { useState } from 'react';
import { Award, BarChart3, Home, RotateCcw, Star, Trophy } from 'lucide-react';
import cityBg from '../assets/images/bg_geometry_city_1794534592002.jpg';
import { GameProgress, StageNumber } from '../types/game';
import { soundEngine } from '../utils/sound';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';

interface SummaryScreenProps {
  progress: GameProgress;
  onReplayAll: () => void;
  onShowDetails: () => void;
  onGoHome: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  progress,
  onReplayAll,
  onShowDetails,
  onGoHome,
}) => {
  const [imgError, setImgError] = useState(false);

  const stageNums: StageNumber[] = [1, 2, 3, 4];
  const completedStagesCount = stageNums.filter((n) => progress.stages[n].completed).length;
  const totalAnswered = stageNums.reduce((sum, n) => sum + progress.stages[n].totalTasks, 0);
  const totalCorrect = stageNums.reduce((sum, n) => sum + progress.stages[n].correctCount, 0);
  const earnedBadges = stageNums
    .filter((n) => progress.stages[n].completed)
    .map((n) => progress.stages[n].badgeName);

  const rankTitle =
    progress.totalScore >= 200
      ? 'Siêu kiến tạo hình học'
      : progress.totalScore >= 100
        ? 'Nhà kiến tạo tài năng'
        : 'Nhà khám phá hình học';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-y-auto custom-scroll bg-gradient-to-br from-[#183B70] via-[#2388E8] to-[#9670E8] p-5 md:p-7">
      {!imgError && (
        <img
          src={cityBg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}

      {/* Floating celebratory geometric shapes */}
      <div className="hidden md:block absolute top-6 left-8 w-24 h-20 animate-float-slow pointer-events-none">
        <GeometryShape kind="parallelogram" color="#FFD447" rotationDeg={-15} />
      </div>
      <div className="hidden md:block absolute top-8 right-8 w-22 h-22 animate-float-reverse pointer-events-none">
        <GeometryShape kind="rhombus" color="#54C98A" rotationDeg={24} />
      </div>

      {/* Main Congratulations Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl border-4 border-[#FFD447] shadow-2xl p-5 md:p-7 my-auto">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#FF9B42] mb-1">
            <Trophy className="w-5 h-5" />
            <span>HOÀN THÀNH HÀNH TRÌNH</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#183B70] text-balance">
            CHÚC MỪNG NHÀ KIẾN TẠO HÌNH HỌC!
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left: Robot with Golden Trophy + Rank */}
          <div className="md:col-span-5 flex flex-col items-center bg-[#EEF6FF] border-2 border-[#2388E8]/25 rounded-3xl p-4 text-center">
            <RobotCompanion mood="celebrating" size="lg" showTrophy />
            <div className="mt-2 bg-[#FFD447] border-2 border-[#183B70] rounded-2xl px-4 py-2 shadow-sm">
              <p className="text-[11px] font-bold text-[#183B70]/80">DANH HIỆU ĐẠT ĐƯỢC</p>
              <p className="font-display font-extrabold text-lg md:text-xl text-[#183B70]">
                {rankTitle}
              </p>
            </div>
          </div>

          {/* Right: 4 Stats + Badges */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8FAFC] border border-[#183B70]/12 rounded-2xl p-3">
                <p className="text-xs font-bold text-[#183B70]/70">Tổng điểm đạt được</p>
                <p className="font-num font-extrabold text-2xl md:text-3xl text-[#2388E8] flex items-center gap-1.5">
                  <Star className="w-6 h-6 text-[#FF9B42] fill-[#FFD447]" />
                  {progress.totalScore}
                </p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#183B70]/12 rounded-2xl p-3">
                <p className="text-xs font-bold text-[#183B70]/70">Số chặng hoàn thành</p>
                <p className="font-num font-extrabold text-2xl md:text-3xl text-[#54C98A]">
                  {completedStagesCount}/4
                </p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#183B70]/12 rounded-2xl p-3">
                <p className="text-xs font-bold text-[#183B70]/70">Tổng số câu đã trả lời</p>
                <p className="font-num font-extrabold text-2xl text-[#183B70]">
                  {totalAnswered}
                </p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#183B70]/12 rounded-2xl p-3">
                <p className="text-xs font-bold text-[#183B70]/70">Số câu trả lời đúng</p>
                <p className="font-num font-extrabold text-2xl text-[#9670E8]">
                  {totalCorrect}
                </p>
              </div>
            </div>

            {/* Earned Badges */}
            <div className="bg-[#FFF9E6] border border-[#FFD447] rounded-2xl p-3">
              <p className="text-xs font-bold text-[#183B70] mb-2">
                Huy hiệu đã nhận ({earnedBadges.length}/4):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {earnedBadges.map((b) => (
                  <div
                    key={b}
                    className="bg-white rounded-xl px-2.5 py-1.5 border border-[#FFD447] flex items-center gap-1.5 text-xs font-bold text-[#183B70]"
                  >
                    <Award className="w-4 h-4 text-[#FF9B42] shrink-0" />
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Required Action Buttons */}
        <div className="mt-5 pt-4 border-t border-[#183B70]/12 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onReplayAll();
            }}
            className="btn-3d px-6 py-3 rounded-2xl bg-[#FFD447] hover:bg-[#ffdc64] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#d99b00] flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>CHƠI LẠI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onShowDetails();
            }}
            className="btn-3d px-6 py-3 rounded-2xl bg-[#2388E8] hover:bg-[#1b77d1] text-white font-display font-extrabold text-base border-b-4 border-[#183B70] flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-5 h-5" />
            <span>XEM KẾT QUẢ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onGoHome();
            }}
            className="btn-3d px-6 py-3 rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#94A3B8] flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>VỀ TRANG CHỦ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
