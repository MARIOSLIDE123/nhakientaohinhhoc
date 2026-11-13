import React, { useMemo, useState } from 'react';
import { CheckCircle2, RotateCw, Sparkles } from 'lucide-react';
import { STAGE_1_BANK, shuffleArray } from '../data/questions';
import { RobotMood, Stage1Task } from '../types/game';
import { soundEngine } from '../utils/sound';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';

interface Stage1IdentifyProps {
  sessionSeed: number;
  answeredIds: string[];
  onRecordAnswer: (questionId: string, isFirstTry: boolean) => void;
  onCompleteStage: (correctCount: number, totalTasks: number) => void;
}

export const Stage1Identify: React.FC<Stage1IdentifyProps> = ({
  sessionSeed,
  answeredIds,
  onRecordAnswer,
  onCompleteStage,
}) => {
  const tasks = useMemo<Stage1Task[]>(() => {
    const picked = shuffleArray(STAGE_1_BANK).slice(0, 5);
    return picked.map((t) =>
      t.type === 'multi-select'
        ? { ...t, shapes: shuffleArray(t.shapes) }
        : t
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionSeed]);

  const [index, setIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [binaryChoice, setBinaryChoice] = useState<'parallelogram' | 'rhombus' | null>(null);
  const [previewExtraRot, setPreviewExtraRot] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [taskSolved, setTaskSolved] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [showMarkersHint, setShowMarkersHint] = useState(false);

  const currentTask = tasks[index];

  const robotMood: RobotMood = taskSolved
    ? 'celebrating'
    : feedback && !feedback.ok
      ? 'encouraging'
      : 'happy';

  const robotSpeech = feedback
    ? feedback.text
    : currentTask.type === 'multi-select'
      ? 'Hãy quan sát thật kỹ từng hình, không bị đánh lừa bởi màu sắc hay góc xoay nhé!'
      : 'Nhìn kỹ các cạnh của hình nhé! Em có thể bấm nút Xoay thử để quan sát rõ hơn.';

  const toggleShape = (id: string) => {
    if (taskSolved) return;
    soundEngine.playClick();
    setFeedback(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (taskSolved) return;

    if (currentTask.type === 'multi-select') {
      if (selectedIds.length === 0) {
        soundEngine.playWrong();
        setFeedback({ ok: false, text: 'Em hãy chạm vào ít nhất một hình trước khi bấm Xác nhận nhé!' });
        return;
      }
      const expected = currentTask.shapes
        .filter((s) => s.kind === currentTask.targetKind)
        .map((s) => s.id)
        .sort();
      const actual = [...selectedIds].sort();
      const isCorrect =
        expected.length === actual.length &&
        expected.every((val, i) => val === actual[i]);

      if (isCorrect) {
        soundEngine.playCorrect();
        setTaskSolved(true);
        setShowMarkersHint(true);
        setSolvedCount((c) => c + 1);
        const alreadyAwarded = answeredIds.includes(currentTask.id);
        onRecordAnswer(currentTask.id, !hadMistake);
        setFeedback({
          ok: true,
          text: alreadyAwarded
            ? currentTask.successPraise
            : `${currentTask.successPraise} (+10 điểm)`,
        });
      } else {
        soundEngine.playWrong();
        setHadMistake(true);
        setShowMarkersHint(true);
        setFeedback({ ok: false, text: currentTask.hint });
      }
    } else {
      if (!binaryChoice) {
        soundEngine.playWrong();
        setFeedback({ ok: false, text: 'Em hãy chọn Hình bình hành hoặc Hình thoi trước khi xác nhận!' });
        return;
      }
      if (binaryChoice === currentTask.correctAnswer) {
        soundEngine.playCorrect();
        setTaskSolved(true);
        setShowMarkersHint(true);
        setSolvedCount((c) => c + 1);
        const alreadyAwarded = answeredIds.includes(currentTask.id);
        onRecordAnswer(currentTask.id, !hadMistake);
        setFeedback({
          ok: true,
          text: alreadyAwarded
            ? currentTask.successPraise
            : `${currentTask.successPraise} (+10 điểm)`,
        });
      } else {
        soundEngine.playWrong();
        setHadMistake(true);
        setShowMarkersHint(true);
        setFeedback({ ok: false, text: currentTask.hint });
      }
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (index + 1 < tasks.length) {
      setIndex((i) => i + 1);
      setSelectedIds([]);
      setBinaryChoice(null);
      setPreviewExtraRot(0);
      setFeedback(null);
      setHadMistake(false);
      setTaskSolved(false);
      setShowMarkersHint(false);
    } else {
      onCompleteStage(solvedCount, tasks.length);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 p-4 md:p-5 bg-gradient-to-br from-[#EEF6FF] via-[#F8FAFC] to-[#E0F2FE] overflow-y-auto custom-scroll">
      {/* Main Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        {/* Left Side: Robot & Task Guidance */}
        <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-[#2388E8]/25 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#2388E8] mb-1">
              <span>NHIỆM VỤ {index + 1} / {tasks.length}</span>
              <span>Chặng 1</span>
            </div>
            <h2 className="font-display text-lg md:text-xl font-extrabold text-[#183B70] mb-1.5">
              {currentTask.title}
            </h2>
            <p className="text-sm md:text-base font-semibold text-[#183B70]/90 leading-snug">
              {currentTask.prompt}
            </p>
          </div>

          <div className="my-2 flex flex-col items-center">
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
              <span>{feedback.ok ? 'Chính xác! Em giỏi quá!' : 'Thử lại nhé — xem gợi ý của Robot!'}</span>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Geometry Workspace */}
        <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-[#183B70]/12 p-4 md:p-5 flex flex-col justify-between shadow-sm">
          {currentTask.type === 'multi-select' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 my-auto">
              {currentTask.shapes.map((shape) => {
                const isSelected = selectedIds.includes(shape.id);
                const isTarget = shape.kind === currentTask.targetKind;
                const glowGreen = taskSolved && isTarget;

                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => toggleShape(shape.id)}
                    aria-pressed={isSelected}
                    className={`relative rounded-2xl p-3 border-3 transition-all flex flex-col items-center justify-center min-h-[120px] md:min-h-[145px] cursor-pointer ${
                      glowGreen
                        ? 'bg-[#ECFDF5] border-[#54C98A] shadow-lg scale-[1.02]'
                        : isSelected
                          ? 'bg-[#EEF6FF] border-[#2388E8] shadow-md ring-3 ring-[#FFD447]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#2388E8]/60 hover:bg-white'
                    }`}
                  >
                    {isSelected && !taskSolved && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2388E8] text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                    {glowGreen && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#54C98A] text-white flex items-center justify-center text-xs font-bold">
                        ★
                      </span>
                    )}
                    <div className="w-32 h-24 md:w-36 md:h-28">
                      <GeometryShape
                        kind={shape.kind}
                        color={shape.color}
                        rotationDeg={shape.rotationDeg}
                        scale={shape.scale}
                        lean={shape.lean}
                        aspectRatio={shape.aspectRatio}
                        showMarkers={showMarkersHint && isTarget}
                        highlightGreen={glowGreen}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 my-auto">
              <div className="relative w-full max-w-md h-48 md:h-56 rounded-3xl bg-[#F8FAFC] border-2 border-[#183B70]/12 flex items-center justify-center p-4">
                <div className="w-56 h-44">
                  <GeometryShape
                    kind={currentTask.shape.kind}
                    color={currentTask.shape.color}
                    rotationDeg={currentTask.shape.rotationDeg + previewExtraRot}
                    lean={currentTask.shape.lean}
                    aspectRatio={currentTask.shape.aspectRatio}
                    showMarkers={showMarkersHint}
                    highlightGreen={taskSolved}
                  />
                </div>
                {currentTask.allowRotatePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPreviewExtraRot((r) => (r + 30) % 360);
                    }}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EEF6FF] border border-[#183B70]/20 text-xs font-bold text-[#183B70] flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#2388E8]" />
                    <span>Xoay thử (+30°)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <button
                  type="button"
                  disabled={taskSolved}
                  onClick={() => {
                    soundEngine.playClick();
                    setFeedback(null);
                    setBinaryChoice('parallelogram');
                  }}
                  className={`btn-3d py-3.5 px-5 rounded-2xl font-display font-extrabold text-base md:text-lg border-3 cursor-pointer ${
                    binaryChoice === 'parallelogram'
                      ? 'bg-[#2388E8] text-white border-[#183B70] shadow-md'
                      : 'bg-[#F8FAFC] hover:bg-[#EEF6FF] text-[#183B70] border-[#CBD5E1]'
                  }`}
                >
                  HÌNH BÌNH HÀNH
                </button>
                <button
                  type="button"
                  disabled={taskSolved}
                  onClick={() => {
                    soundEngine.playClick();
                    setFeedback(null);
                    setBinaryChoice('rhombus');
                  }}
                  className={`btn-3d py-3.5 px-5 rounded-2xl font-display font-extrabold text-base md:text-lg border-3 cursor-pointer ${
                    binaryChoice === 'rhombus'
                      ? 'bg-[#9670E8] text-white border-[#183B70] shadow-md'
                      : 'bg-[#F8FAFC] hover:bg-[#F3EFFE] text-[#183B70] border-[#CBD5E1]'
                  }`}
                >
                  HÌNH THOI
                </button>
              </div>
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="pt-3 mt-2 border-t border-[#183B70]/10 flex items-center justify-between gap-3">
            <span className="text-xs md:text-sm font-semibold text-[#183B70]/70">
              {currentTask.type === 'multi-select'
                ? `Đã chọn: ${selectedIds.length} hình`
                : binaryChoice
                  ? `Đang chọn: ${binaryChoice === 'parallelogram' ? 'Hình bình hành' : 'Hình thoi'}`
                  : 'Chọn một đáp án rồi nhấn Xác nhận'}
            </span>

            {!taskSolved ? (
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
                {index + 1 < tasks.length ? 'CÂU TIẾP THEO →' : 'HOÀN THÀNH CHẶNG 1 ★'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
