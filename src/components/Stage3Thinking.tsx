import React, { useMemo, useState } from 'react';
import { CheckCircle2, Lock, LockOpen, Sparkles } from 'lucide-react';
import labBg from '../assets/images/bg_geometry_lab_1794534592097.jpg';
import { STAGE_3_BANK, shuffleArray } from '../data/questions';
import { RobotMood, Stage3Task } from '../types/game';
import { soundEngine } from '../utils/sound';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';

interface Stage3ThinkingProps {
  sessionSeed: number;
  answeredIds: string[];
  onRecordAnswer: (questionId: string, isFirstTry: boolean) => void;
  onCompleteStage: (correctCount: number, totalTasks: number) => void;
}

export const Stage3Thinking: React.FC<Stage3ThinkingProps> = ({
  sessionSeed,
  answeredIds,
  onRecordAnswer,
  onCompleteStage,
}) => {
  const tasks = useMemo<Stage3Task[]>(() => {
    return shuffleArray(STAGE_3_BANK).map((t) => {
      if (t.kind === 'pattern' || t.kind === 'condition-match') {
        return { ...t, options: shuffleArray(t.options) };
      }
      if (t.kind === 'decode') {
        return { ...t, options: shuffleArray(t.options) };
      }
      if (t.kind === 'error-spot' || t.kind === 'distinguish') {
        return { ...t, reasonOptions: shuffleArray(t.reasonOptions) };
      }
      return t;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionSeed]);

  const [index, setIndex] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [claimChoice, setClaimChoice] = useState<boolean | null>(null);
  const [distinguishShapeChoice, setDistinguishShapeChoice] = useState<'A' | 'B' | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [imgError, setImgError] = useState(false);

  const task = tasks[index];

  const robotMood: RobotMood = solved
    ? 'celebrating'
    : feedback && !feedback.ok
      ? 'encouraging'
      : task.kind === 'error-spot'
        ? 'surprised'
        : 'thinking';

  const robotSpeech = feedback
    ? feedback.text
    : task.kind === 'error-spot'
      ? 'Hãy kiểm tra giúp tớ xem câu nói này đúng hay sai và chọn lý do nhé!'
      : 'Phân tích thật kỹ các dữ kiện mật mã để tìm ra đáp án chính xác nhất!';

  const markSolved = (praise: string) => {
    soundEngine.playCorrect();
    setSolved(true);
    setSolvedCount((c) => c + 1);
    const already = answeredIds.includes(task.id);
    onRecordAnswer(task.id, !hadMistake);
    setFeedback({
      ok: true,
      text: already ? praise : `${praise} (+10 điểm)`,
    });
  };

  const handleConfirm = () => {
    if (solved) return;

    if (task.kind === 'pattern' || task.kind === 'condition-match' || task.kind === 'decode') {
      if (!selectedOptId) {
        soundEngine.playWrong();
        setFeedback({ ok: false, text: 'Em hãy chọn một phương án trước khi bấm Xác nhận nhé!' });
        return;
      }
      const picked = task.options.find((o) => o.id === selectedOptId);
      if (picked?.isCorrect) {
        markSolved(task.successPraise);
      } else {
        soundEngine.playWrong();
        setHadMistake(true);
        setFeedback({ ok: false, text: task.hint });
      }
      return;
    }

    if (task.kind === 'error-spot') {
      if (claimChoice === null || !reasonId) {
        soundEngine.playWrong();
        setFeedback({
          ok: false,
          text: 'Em hãy hoàn thành cả 2 bước: chọn Đúng/Sai và chọn lý do giải thích!',
        });
        return;
      }
      const pickedReason = task.reasonOptions.find((r) => r.id === reasonId);
      if (claimChoice === task.isClaimTrue && pickedReason?.isCorrect) {
        markSolved(task.successPraise);
      } else {
        soundEngine.playWrong();
        setHadMistake(true);
        setFeedback({ ok: false, text: task.hint });
      }
      return;
    }

    if (task.kind === 'distinguish') {
      if (!distinguishShapeChoice || !reasonId) {
        soundEngine.playWrong();
        setFeedback({
          ok: false,
          text: 'Em hãy chọn hình nào là Hình thoi VÀ chọn căn cứ giải thích nhé!',
        });
        return;
      }
      // In question bank: shapeA is parallelogram, shapeB is rhombus
      const pickedReason = task.reasonOptions.find((r) => r.id === reasonId);
      const isRhombusB = task.shapeB.kind === 'rhombus' && distinguishShapeChoice === 'B';
      if (isRhombusB && pickedReason?.isCorrect) {
        markSolved(task.successPraise);
      } else {
        soundEngine.playWrong();
        setHadMistake(true);
        setFeedback({ ok: false, text: task.hint });
      }
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (index + 1 < tasks.length) {
      setIndex((i) => i + 1);
      setSelectedOptId(null);
      setClaimChoice(null);
      setDistinguishShapeChoice(null);
      setReasonId(null);
      setFeedback(null);
      setHadMistake(false);
      setSolved(false);
    } else {
      onCompleteStage(solvedCount, tasks.length);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 md:p-5 bg-gradient-to-br from-[#183B70] via-[#1E4785] to-[#2388E8] overflow-y-auto custom-scroll">
      {!imgError && (
        <img
          src={labBg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        {/* Left: Robot Decoder Partner */}
        <div className="lg:col-span-4 bg-white/95 rounded-3xl border-2 border-[#FF9B42]/50 p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#FF9B42] mb-1">
              <span>GIẢI MÃ TƯ DUY · {index + 1}/{tasks.length}</span>
              <span>Chặng 3</span>
            </div>
            <h2 className="font-display text-lg md:text-xl font-extrabold text-[#183B70] mb-1.5">
              {task.title}
            </h2>
            <p className="text-sm md:text-base font-semibold text-[#183B70]/85 leading-snug">
              {task.kind === 'error-spot'
                ? 'Kiểm tra lời nhận định và chỉ ra lý do đúng:'
                : task.prompt}
            </p>
          </div>

          <div className="my-2 flex justify-center">
            <RobotCompanion
              mood={robotMood}
              size="md"
              bubblePosition="bottom"
              speech={robotSpeech}
            />
          </div>

          {feedback && (
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-sm font-bold flex items-center gap-2 border ${
                feedback.ok
                  ? 'bg-[#ECFDF5] border-[#54C98A] text-[#14532D]'
                  : 'bg-[#FFF9E6] border-[#FF9B42] text-[#7C2D12]'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#FF9B42] shrink-0" />
              )}
              <span>{feedback.ok ? 'Giải mã thành công!' : 'Chưa đúng — xem gợi ý nhé!'}</span>
            </div>
          )}
        </div>

        {/* Right: Code-Breaking Canvas */}
        <div className="lg:col-span-8 bg-white/95 rounded-3xl border-2 border-[#183B70]/15 p-4 md:p-6 flex flex-col justify-between shadow-lg">
          {task.kind === 'pattern' && (
            <div className="my-auto space-y-5">
              <div className="bg-[#EEF6FF] border-2 border-[#2388E8]/30 rounded-3xl p-4 flex flex-wrap items-center justify-center gap-2 md:gap-4">
                {task.sequence.map((s) => (
                  <React.Fragment key={s.id}>
                    <div className="w-24 h-20 md:w-28 md:h-24 bg-white rounded-2xl border border-[#183B70]/12 p-1.5 shadow-xs">
                      <GeometryShape
                        kind={s.kind}
                        color={s.color}
                        rotationDeg={s.rotationDeg}
                        lean={s.lean}
                      />
                    </div>
                    <span className="font-display font-extrabold text-xl text-[#2388E8]">→</span>
                  </React.Fragment>
                ))}
                <div className="w-24 h-20 md:w-28 md:h-24 rounded-2xl border-3 border-dashed border-[#FF9B42] bg-[#FFF9E6] flex items-center justify-center">
                  {solved ? (
                    <GeometryShape
                      kind={task.options.find((o) => o.isCorrect)!.kind}
                      color={task.options.find((o) => o.isCorrect)!.color}
                      highlightGreen
                    />
                  ) : (
                    <span className="font-display font-extrabold text-3xl text-[#FF9B42]">?</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {task.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={solved}
                    onClick={() => {
                      soundEngine.playClick();
                      setFeedback(null);
                      setSelectedOptId(opt.id);
                    }}
                    className={`rounded-2xl p-3 border-3 flex items-center justify-center h-28 md:h-32 transition-all cursor-pointer ${
                      solved && opt.isCorrect
                        ? 'bg-[#ECFDF5] border-[#54C98A]'
                        : selectedOptId === opt.id
                          ? 'bg-[#EEF6FF] border-[#2388E8] ring-3 ring-[#FFD447]'
                          : 'bg-[#F8FAFC] hover:bg-white border-[#CBD5E1]'
                    }`}
                  >
                    <div className="w-28 h-22">
                      <GeometryShape
                        kind={opt.kind}
                        color={opt.color}
                        rotationDeg={opt.rotationDeg}
                        lean={opt.lean}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.kind === 'error-spot' && (
            <div className="my-auto space-y-4">
              <div className="bg-[#FFF9E6] border-2 border-[#FFD447] rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-[#B45309] mb-1">NHẬN ĐỊNH CẦN KIỂM TRA</p>
                <p className="font-display text-lg md:text-xl font-extrabold text-[#183B70]">
                  {task.robotClaim}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-[#183B70] mb-2">Bước 1: Chọn kết luận của em</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={solved}
                    onClick={() => {
                      soundEngine.playClick();
                      setFeedback(null);
                      setClaimChoice(true);
                    }}
                    className={`btn-3d py-3 px-4 rounded-2xl font-display font-bold text-sm md:text-base border-3 cursor-pointer ${
                      claimChoice === true
                        ? 'bg-[#2388E8] text-white border-[#183B70]'
                        : 'bg-[#F8FAFC] hover:bg-[#EEF6FF] text-[#183B70] border-[#CBD5E1]'
                    }`}
                  >
                    Nhận định đúng
                  </button>
                  <button
                    type="button"
                    disabled={solved}
                    onClick={() => {
                      soundEngine.playClick();
                      setFeedback(null);
                      setClaimChoice(false);
                    }}
                    className={`btn-3d py-3 px-4 rounded-2xl font-display font-bold text-sm md:text-base border-3 cursor-pointer ${
                      solved
                        ? 'bg-[#54C98A] text-[#183B70] border-[#2F9B62]'
                        : claimChoice === false
                          ? 'bg-[#FF9B42] text-[#183B70] border-[#183B70]'
                          : 'bg-[#F8FAFC] hover:bg-[#FFF9E6] text-[#183B70] border-[#CBD5E1]'
                    }`}
                  >
                    Nhận định sai
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-[#183B70] mb-2">Bước 2: Chọn lý do giải thích</p>
                <div className="space-y-2">
                  {task.reasonOptions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playClick();
                        setFeedback(null);
                        setReasonId(r.id);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                        solved && r.isCorrect
                          ? 'bg-[#ECFDF5] border-[#54C98A] text-[#14532D]'
                          : reasonId === r.id
                            ? 'bg-[#EEF6FF] border-[#2388E8] text-[#183B70]'
                            : 'bg-[#F8FAFC] hover:bg-white border-[#CBD5E1] text-[#183B70]'
                      }`}
                    >
                      {r.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {task.kind === 'condition-match' && (
            <div className="my-auto space-y-4">
              <div className="bg-[#EEF6FF] border-2 border-[#2388E8]/30 rounded-2xl p-4 space-y-1.5">
                {task.conditions.map((cond, idx) => (
                  <p key={idx} className="font-display font-bold text-base text-[#183B70] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#2388E8] text-white text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{cond}</span>
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {task.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={solved}
                    onClick={() => {
                      soundEngine.playClick();
                      setFeedback(null);
                      setSelectedOptId(opt.id);
                    }}
                    className={`rounded-2xl p-3 border-3 h-36 flex items-center justify-center transition-all cursor-pointer ${
                      solved && opt.isCorrect
                        ? 'bg-[#ECFDF5] border-[#54C98A]'
                        : selectedOptId === opt.id
                          ? 'bg-[#EEF6FF] border-[#2388E8] ring-3 ring-[#FFD447]'
                          : 'bg-[#F8FAFC] hover:bg-white border-[#CBD5E1]'
                    }`}
                  >
                    <div className="w-28 h-24">
                      <GeometryShape
                        kind={opt.kind}
                        color={opt.color}
                        rotationDeg={opt.rotationDeg}
                        lean={opt.lean}
                        aspectRatio={opt.aspectRatio}
                        showMarkers={solved && opt.isCorrect}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.kind === 'decode' && (
            <div className="my-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#F3EFFE] border-2 border-[#9670E8]/35 rounded-3xl p-4">
                <div className="sm:col-span-7 space-y-2">
                  <p className="text-xs font-bold text-[#9670E8]">DỮ KIỆN MỞ KHÓA HỘP BÍ ẨN</p>
                  {task.clues.map((clue, idx) => (
                    <div key={idx} className="bg-white rounded-xl px-3.5 py-2.5 border border-[#9670E8]/20 font-bold text-sm text-[#183B70]">
                      {clue}
                    </div>
                  ))}
                </div>
                <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white rounded-2xl p-3 h-36 border border-[#9670E8]/25">
                  {solved ? (
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-22">
                        <GeometryShape
                          kind={task.revealedShape.kind}
                          color={task.revealedShape.color}
                          rotationDeg={task.revealedShape.rotationDeg}
                          showMarkers
                        />
                      </div>
                      <span className="text-xs font-bold text-[#1E8750] flex items-center gap-1">
                        <LockOpen className="w-3.5 h-3.5" /> Đã mở khóa!
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#9670E8]">
                      <Lock className="w-10 h-10 mb-1" />
                      <span className="text-xs font-bold">Hộp bí ẩn đang khóa</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {task.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={solved}
                    onClick={() => {
                      soundEngine.playClick();
                      setFeedback(null);
                      setSelectedOptId(opt.id);
                    }}
                    className={`btn-3d py-3.5 px-4 rounded-2xl font-display font-extrabold text-base border-3 cursor-pointer ${
                      solved && opt.isCorrect
                        ? 'bg-[#54C98A] text-[#183B70] border-[#2F9B62]'
                        : selectedOptId === opt.id
                          ? 'bg-[#9670E8] text-white border-[#183B70]'
                          : 'bg-[#F8FAFC] hover:bg-[#F3EFFE] text-[#183B70] border-[#CBD5E1]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.kind === 'distinguish' && (
            <div className="my-auto space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                {(['A', 'B'] as const).map((letter) => {
                  const s = letter === 'A' ? task.shapeA : task.shapeB;
                  const active = distinguishShapeChoice === letter;
                  const isCorrectShape = letter === 'B';
                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playClick();
                        setFeedback(null);
                        setDistinguishShapeChoice(letter);
                      }}
                      className={`rounded-2xl p-3 border-3 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        solved && isCorrectShape
                          ? 'bg-[#ECFDF5] border-[#54C98A]'
                          : active
                            ? 'bg-[#EEF6FF] border-[#2388E8] ring-3 ring-[#FFD447]'
                            : 'bg-[#F8FAFC] hover:bg-white border-[#CBD5E1]'
                      }`}
                    >
                      <span className="font-display font-extrabold text-sm text-[#183B70] mb-1">
                        HÌNH {letter}
                      </span>
                      <div className="w-32 h-24">
                        <GeometryShape
                          kind={s.kind}
                          color={s.color}
                          rotationDeg={s.rotationDeg}
                          lean={s.lean}
                          aspectRatio={s.aspectRatio}
                          showMarkers={solved}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <p className="text-xs md:text-sm font-bold text-[#183B70] mb-1.5">
                  Chọn căn cứ giải thích đúng để phân biệt hai hình:
                </p>
                <div className="space-y-1.5">
                  {task.reasonOptions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playClick();
                        setFeedback(null);
                        setReasonId(r.id);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl border-2 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                        solved && r.isCorrect
                          ? 'bg-[#ECFDF5] border-[#54C98A] text-[#14532D]'
                          : reasonId === r.id
                            ? 'bg-[#EEF6FF] border-[#2388E8] text-[#183B70]'
                            : 'bg-[#F8FAFC] hover:bg-white border-[#CBD5E1] text-[#183B70]'
                      }`}
                    >
                      {r.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Confirm / Next */}
          <div className="pt-3 mt-2 border-t border-[#183B70]/10 flex items-center justify-between gap-3">
            <span className="text-xs md:text-sm font-semibold text-[#183B70]/70">
              {task.kind === 'distinguish'
                ? 'Chọn Hình thoi (A hoặc B) và lý do bên dưới'
                : 'Kiểm tra kỹ rồi nhấn Xác nhận'}
            </span>
            {!solved ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="btn-3d px-7 py-2.5 rounded-2xl bg-[#FFD447] hover:bg-[#ffdc64] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#d99b00] cursor-pointer whitespace-nowrap"
              >
                XÁC NHẬN
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="btn-3d px-7 py-2.5 rounded-2xl bg-[#54C98A] hover:bg-[#45b87b] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#2F9B62] cursor-pointer whitespace-nowrap"
              >
                {index + 1 < tasks.length ? 'MẬT MÃ TIẾP THEO →' : 'HOÀN THÀNH CHẶNG 3 ★'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
