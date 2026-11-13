import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Home,
  Lock,
  Play,
  Puzzle,
  RotateCcw,
  Search,
  Star,
  Trophy,
} from 'lucide-react';
import cityBg from '../assets/images/bg_geometry_city_1794534592002.jpg';
import { GameProgress, StageNumber } from '../types/game';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';
import { soundEngine } from '../utils/sound';

interface AdventureMapProps {
  progress: GameProgress;
  onSelectStage: (stage: StageNumber) => void;
  onGoHome: () => void;
  onOpenKnowledge: () => void;
  onOpenSummary: () => void;
  onResetGame: () => void;
}

const STAGE_META: Record<
  StageNumber,
  {
    title: string;
    subtitle: string;
    maxBonus: string;
    color: string;
    border: string;
    icon: React.ReactNode;
    previewShape: { kind: 'parallelogram' | 'rhombus'; color: string; rotation: number };
  }
> = {
  1: {
    title: 'CHẶNG 1: NHẬN DIỆN HÌNH HỌC',
    subtitle: 'Quan sát hình bình hành & hình thoi qua góc xoay',
    maxBonus: '+70 điểm tối đa',
    color: '#2388E8',
    border: '#1864B0',
    icon: <Search className="w-6 h-6" />,
    previewShape: { kind: 'parallelogram', color: '#2388E8', rotation: 14 },
  },
  2: {
    title: 'CHẶNG 2: NHÀ THÔNG THÁI HÌNH HỌC',
    subtitle: 'Điền từ, Đúng/Sai và Ghép đặc điểm trong phòng thí nghiệm',
    maxBonus: '+110 điểm tối đa',
    color: '#9670E8',
    border: '#6A46BD',
    icon: <Brain className="w-6 h-6" />,
    previewShape: { kind: 'rhombus', color: '#9670E8', rotation: 30 },
  },
  3: {
    title: 'CHẶNG 3: THỬ THÁCH TƯ DUY',
    subtitle: 'Tìm quy luật, phát hiện lỗi sai và giải mã mật thư',
    maxBonus: '+70 điểm tối đa',
    color: '#FF9B42',
    border: '#C86D1A',
    icon: <Puzzle className="w-6 h-6" />,
    previewShape: { kind: 'parallelogram', color: '#FF9B42', rotation: -16 },
  },
  4: {
    title: 'CHẶNG 4: HÌNH HỌC QUANH EM',
    subtitle: 'Ứng dụng vào khu vườn, ngôi nhà, xưởng chế tạo & tranh ghép',
    maxBonus: '+60 điểm tối đa',
    color: '#54C98A',
    border: '#2F9B62',
    icon: <Home className="w-6 h-6" />,
    previewShape: { kind: 'rhombus', color: '#54C98A', rotation: 55 },
  },
};

export const AdventureMap: React.FC<AdventureMapProps> = ({
  progress,
  onSelectStage,
  onGoHome,
  onOpenKnowledge,
  onOpenSummary,
  onResetGame,
}) => {
  const [imgError, setImgError] = useState(false);

  const allCompleted = ([1, 2, 3, 4] as StageNumber[]).every(
    (s) => progress.stages[s].completed
  );

  const nextUnlockedStage = ([1, 2, 3, 4] as StageNumber[]).find(
    (s) => progress.stages[s].unlocked && !progress.stages[s].completed
  );

  const robotSpeech = allCompleted
    ? 'Hoan hô! Em đã chinh phục cả 4 chặng thử thách! Hãy nhấn Xem Tổng Kết để nhận cúp và danh hiệu nhé!'
    : nextUnlockedStage
      ? `Chặng ${nextUnlockedStage} đã sẵn sàng mở cửa! Em hãy nhấn vào Chặng ${nextUnlockedStage} để bắt đầu phiêu lưu nhé!`
      : 'Chọn một chặng bất kỳ đã mở khóa để khám phá ngay!';

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#EEF6FF] via-[#E0F2FE] to-[#DBEAFE] p-4 md:p-6">
      {!imgError && (
        <img
          src={cityBg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}

      {/* Top Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-white/95 rounded-2xl border-2 border-[#183B70]/12 px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onGoHome();
            }}
            className="btn-3d px-3 py-1.5 rounded-xl bg-[#EEF6FF] hover:bg-[#2388E8] text-[#183B70] hover:text-white font-display font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-[#183B70]">
            Bản đồ hành trình — 4 Chặng Thử Thách
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#FFF6D6] border-2 border-[#FFD447] rounded-xl px-3 py-1">
            <Star className="w-4 h-4 text-[#FF9B42] fill-[#FFD447]" />
            <span className="font-num font-extrabold text-base text-[#183B70]">
              {progress.totalScore}
            </span>
            <span className="text-xs font-bold text-[#183B70]/75">điểm</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenKnowledge();
            }}
            className="btn-3d px-3.5 py-1.5 rounded-xl bg-[#9670E8] text-white font-display font-bold text-sm border-b-2 border-[#5b3ca3] flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Kiến thức cần nhớ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onResetGame();
            }}
            title="Chơi lại từ đầu"
            className="btn-3d px-3 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#183B70] font-display font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Main Adventure Path & 4 Stage Cards */}
      <div className="relative z-10 my-auto py-3">
        {/* Adventure connecting dashed SVG road behind cards on desktop */}
        <svg
          className="hidden lg:block absolute inset-x-10 top-1/2 -translate-y-1/2 h-24 w-[calc(100%-5rem)] pointer-events-none"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 40 50 Q 220 10, 360 50 T 680 50 T 960 50"
            fill="none"
            stroke="#2388E8"
            strokeWidth="8"
            strokeDasharray="16 14"
            strokeLinecap="round"
            opacity="0.35"
          />
        </svg>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([1, 2, 3, 4] as StageNumber[]).map((num) => {
            const meta = STAGE_META[num];
            const state = progress.stages[num];
            const isLocked = !state.unlocked;

            return (
              <div
                key={num}
                className={`relative rounded-3xl bg-white border-3 p-4 flex flex-col justify-between transition-all shadow-lg ${
                  isLocked
                    ? 'border-[#CBD5E1] opacity-80'
                    : state.completed
                      ? 'border-[#54C98A]'
                      : 'border-[#2388E8]'
                }`}
              >
                <div>
                  {/* Stage Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div
                      className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: isLocked ? '#94A3B8' : meta.color }}
                    >
                      {isLocked ? <Lock className="w-5 h-5" /> : meta.icon}
                    </div>
                    <span className="text-xs font-bold text-[#183B70]/75 text-right">
                      {state.completed ? (
                        <span className="inline-flex items-center gap-1 text-[#1E8750] font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Đã hoàn thành
                        </span>
                      ) : isLocked ? (
                        <span>Chưa mở khóa</span>
                      ) : (
                        <span className="text-[#2388E8] font-bold">Sẵn sàng</span>
                      )}
                    </span>
                  </div>

                  {/* 3D Preview Geometry Illustration */}
                  <div className="h-24 w-full rounded-2xl bg-[#F8FAFC] border border-[#183B70]/10 flex items-center justify-center mb-2.5">
                    <div className="w-28 h-20">
                      <GeometryShape
                        kind={meta.previewShape.kind}
                        color={isLocked ? '#94A3B8' : meta.previewShape.color}
                        rotationDeg={meta.previewShape.rotation}
                      />
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-sm md:text-[15px] text-[#183B70] leading-snug mb-1">
                    {meta.title}
                  </h3>
                  <p className="text-xs text-[#183B70]/75 leading-relaxed mb-2">
                    {meta.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#183B70]/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#FF9B42]">{meta.maxBonus}</span>
                    {state.completed && (
                      <span className="font-num text-[#183B70]">
                        {state.earnedPoints} điểm · <Award className="w-3.5 h-3.5 inline text-[#FF9B42]" />
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectStage(num);
                    }}
                    className={`btn-3d w-full py-2.5 px-4 rounded-xl font-display font-extrabold text-sm flex items-center justify-center gap-1.5 border-b-4 ${
                      isLocked
                        ? 'bg-[#E2E8F0] text-[#64748B] border-[#CBD5E1] cursor-not-allowed'
                        : state.completed
                          ? 'bg-[#54C98A] hover:bg-[#45b87b] text-[#183B70] border-[#2F9B62] cursor-pointer'
                          : 'text-white cursor-pointer'
                    }`}
                    style={
                      !isLocked && !state.completed
                        ? { backgroundColor: meta.color, borderBottomColor: meta.border }
                        : undefined
                    }
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Hoàn thành Chặng {num - 1}</span>
                      </>
                    ) : state.completed ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>CHƠI LẠI CHẶNG {num}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>VÀO CHẶNG {num}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Robot Guidance + Final Trophy CTA */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <RobotCompanion
          mood={allCompleted ? 'celebrating' : 'happy'}
          size="sm"
          speech={robotSpeech}
        />

        {allCompleted && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playVictory();
              onOpenSummary();
            }}
            className="btn-3d px-6 py-3 rounded-2xl bg-[#FFD447] hover:bg-[#ffdc64] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#d99b00] shadow-xl flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trophy className="w-5 h-5 text-[#FF9B42]" />
            <span>XEM TỔNG KẾT &amp; DANH HIỆU</span>
          </button>
        )}
      </div>
    </div>
  );
};
