import React, { useMemo, useState } from 'react';
import { CheckCircle2, GripVertical, Sparkles } from 'lucide-react';
import labBg from '../assets/images/bg_geometry_lab_1794534592097.jpg';
import {
  STAGE_2_FILL_BANK,
  STAGE_2_MATCH_CARDS,
  STAGE_2_TF_BANK,
  shuffleArray,
} from '../data/questions';
import { RobotMood, Stage2MatchCard } from '../types/game';
import { soundEngine } from '../utils/sound';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';

interface Stage2KnowledgeProps {
  sessionSeed: number;
  answeredIds: string[];
  onRecordAnswer: (questionId: string, isFirstTry: boolean) => void;
  onCompleteStage: (correctCount: number, totalTasks: number) => void;
}

type Phase = 'FILL' | 'TF' | 'MATCH';

export const Stage2Knowledge: React.FC<Stage2KnowledgeProps> = ({
  sessionSeed,
  answeredIds,
  onRecordAnswer,
  onCompleteStage,
}) => {
  const fillQuestions = useMemo(
    () =>
      shuffleArray(STAGE_2_FILL_BANK).map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionSeed]
  );

  const tfQuestions = useMemo(
    () => shuffleArray(STAGE_2_TF_BANK),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionSeed]
  );

  const initialMatchCards = useMemo(
    () => shuffleArray(STAGE_2_MATCH_CARDS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionSeed]
  );

  const totalTasks = fillQuestions.length + tfQuestions.length + 1; // 3 + 5 + 1 = 9

  const [phase, setPhase] = useState<Phase>('FILL');
  const [subIdx, setSubIdx] = useState(0);
  const [selectedFill, setSelectedFill] = useState<string | null>(null);
  const [selectedTf, setSelectedTf] = useState<boolean | null>(null);

  // Drag & Drop + Click-to-place state for Phase 3 (MATCH)
  const [paraZone, setParaZone] = useState<Stage2MatchCard[]>([]);
  const [rhomZone, setRhomZone] = useState<Stage2MatchCard[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [solvedTotal, setSolvedTotal] = useState(0);
  const [imgError, setImgError] = useState(false);

  const currentStepNumber =
    phase === 'FILL'
      ? subIdx + 1
      : phase === 'TF'
        ? fillQuestions.length + subIdx + 1
        : totalTasks;

  const placedIds = new Set([...paraZone, ...rhomZone].map((c) => c.id));
  const trayCards = initialMatchCards.filter((c) => !placedIds.has(c.id));

  const robotMood: RobotMood = solved
    ? 'celebrating'
    : feedback && !feedback.ok
      ? 'encouraging'
      : 'thinking';

  const robotSpeech = feedback
    ? feedback.text
    : phase === 'FILL'
      ? 'Chào mừng đến Phòng thí nghiệm Hình học! Em hãy chọn từ thích hợp để hoàn thành câu nhé!'
      : phase === 'TF'
        ? 'Đọc kỹ từng nhận định và xác định Đúng hay Sai cùng tớ nào!'
        : 'Kéo thả (hoặc chạm chọn thẻ rồi chạm vào ô hình) để ghép đúng 2 đặc điểm cho mỗi hình!';

  const handleConfirmFill = () => {
    const q = fillQuestions[subIdx];
    if (!selectedFill) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy chọn một từ để điền vào chỗ trống nhé!' });
      return;
    }
    if (selectedFill === q.correctOption) {
      soundEngine.playCorrect();
      setSolved(true);
      setSolvedTotal((c) => c + 1);
      const already = answeredIds.includes(q.id);
      onRecordAnswer(q.id, !hadMistake);
      setFeedback({
        ok: true,
        text: already ? 'Chính xác! Kiến thức vững quá!' : 'Chính xác! Em nhận được +10 điểm!',
      });
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({ ok: false, text: q.hint });
    }
  };

  const handleConfirmTf = () => {
    const q = tfQuestions[subIdx];
    if (selectedTf === null) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy chọn ĐÚNG hoặc SAI nhé!' });
      return;
    }
    if (selectedTf === q.isTrue) {
      soundEngine.playCorrect();
      setSolved(true);
      setSolvedTotal((c) => c + 1);
      const already = answeredIds.includes(q.id);
      onRecordAnswer(q.id, !hadMistake);
      setFeedback({
        ok: true,
        text: already ? 'Quá chuẩn!' : 'Quá chuẩn! Em nhận được +10 điểm!',
      });
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({ ok: false, text: q.hint });
    }
  };

  const placeCardInZone = (cardId: string, target: 'para' | 'rhom') => {
    if (solved) return;
    const card = initialMatchCards.find((c) => c.id === cardId);
    if (!card) return;
    soundEngine.playClick();
    setFeedback(null);
    setParaZone((prev) => prev.filter((c) => c.id !== cardId));
    setRhomZone((prev) => prev.filter((c) => c.id !== cardId));

    if (target === 'para') {
      setParaZone((prev) => [...prev, card]);
    } else {
      setRhomZone((prev) => [...prev, card]);
    }
    setActiveCardId(null);
    setDraggingCardId(null);
  };

  const removeCardFromZones = (cardId: string) => {
    if (solved) return;
    soundEngine.playClick();
    setFeedback(null);
    setParaZone((prev) => prev.filter((c) => c.id !== cardId));
    setRhomZone((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleConfirmMatch = () => {
    if (trayCards.length > 0) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy ghép hết cả 4 thẻ đặc điểm vào hai ô hình nhé!' });
      return;
    }

    const paraKeys = paraZone.map((c) => c.propertyKey).sort();
    const rhomKeys = rhomZone.map((c) => c.propertyKey).sort();

    const expectedPara = ['equal_opposite', 'parallel_pairs'];
    const expectedRhom = ['four_equal', 'parallel_pairs'];

    const okPara =
      paraKeys.length === 2 && paraKeys.every((k, i) => k === expectedPara[i]);
    const okRhom =
      rhomKeys.length === 2 && rhomKeys.every((k, i) => k === expectedRhom[i]);

    if (okPara && okRhom) {
      soundEngine.playCorrect();
      setSolved(true);
      setSolvedTotal((c) => c + 1);
      const matchId = 's2_match_properties';
      const already = answeredIds.includes(matchId);
      onRecordAnswer(matchId, !hadMistake);
      setFeedback({
        ok: true,
        text: already
          ? 'Tuyệt vời! Em đã ghép chính xác toàn bộ đặc điểm của cả hai hình!'
          : 'Tuyệt vời! Em đã ghép chính xác toàn bộ đặc điểm! (+10 điểm)',
      });
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({
        ok: false,
        text: 'Gợi ý: Cả hai hình đều có "Hai cặp cạnh đối diện song song". Nhưng "Bốn cạnh bằng nhau" thuộc về Hình thoi, còn "Hai cặp cạnh đối diện bằng nhau" thuộc về Hình bình hành!',
      });
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    setFeedback(null);
    setHadMistake(false);
    setSolved(false);

    if (phase === 'FILL') {
      if (subIdx + 1 < fillQuestions.length) {
        setSubIdx((i) => i + 1);
        setSelectedFill(null);
      } else {
        setPhase('TF');
        setSubIdx(0);
        setSelectedTf(null);
      }
    } else if (phase === 'TF') {
      if (subIdx + 1 < tfQuestions.length) {
        setSubIdx((i) => i + 1);
        setSelectedTf(null);
      } else {
        setPhase('MATCH');
        setSubIdx(0);
      }
    } else {
      onCompleteStage(solvedTotal, totalTasks);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 md:p-5 bg-gradient-to-br from-[#183B70] to-[#2388E8] overflow-y-auto custom-scroll">
      {!imgError && (
        <img
          src={labBg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        {/* Left: Robot Lab Guide */}
        <div className="lg:col-span-4 bg-white/95 rounded-3xl border-2 border-[#9670E8]/40 p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#9670E8] mb-1">
              <span>PHÒNG THÍ NGHIỆM · CÂU {currentStepNumber}/{totalTasks}</span>
              <span>Chặng 2</span>
            </div>
            <h2 className="font-display text-lg md:text-xl font-extrabold text-[#183B70] mb-1">
              {phase === 'FILL'
                ? 'Nhiệm vụ 1: Điền từ còn thiếu'
                : phase === 'TF'
                  ? 'Nhiệm vụ 2: Đúng hay sai?'
                  : 'Nhiệm vụ 3: Ghép đặc điểm'}
            </h2>
            <p className="text-sm text-[#183B70]/80">
              {phase === 'FILL'
                ? 'Chọn từ chính xác để hoàn thiện định nghĩa hình học.'
                : phase === 'TF'
                  ? 'Kiểm tra nhận định dưới đây là Đúng hay Sai.'
                  : 'Kéo thả thẻ đặc điểm vào đúng hộp Hình bình hành và Hình thoi.'}
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
              <span>{feedback.ok ? 'Hoàn hảo!' : 'Xem gợi ý và thử lại nhé!'}</span>
            </div>
          )}
        </div>

        {/* Right: Lab Interactive Board */}
        <div className="lg:col-span-8 bg-white/95 rounded-3xl border-2 border-[#183B70]/15 p-4 md:p-6 flex flex-col justify-between shadow-lg">
          {phase === 'FILL' && (
            <div className="my-auto space-y-6">
              <div className="bg-[#EEF6FF] border-2 border-[#2388E8]/30 rounded-3xl p-5 md:p-7 text-center">
                <p className="font-display text-xl md:text-2xl font-extrabold text-[#183B70] leading-relaxed">
                  {fillQuestions[subIdx].promptBefore}
                  <span className="inline-block min-w-[140px] mx-1 px-4 py-1 rounded-xl bg-white border-2 border-dashed border-[#2388E8] text-[#2388E8]">
                    {selectedFill || '............'}
                  </span>
                  {fillQuestions[subIdx].promptAfter}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {fillQuestions[subIdx].options.map((opt) => {
                  const active = selectedFill === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playClick();
                        setFeedback(null);
                        setSelectedFill(opt);
                      }}
                      className={`btn-3d py-4 px-4 rounded-2xl font-display font-extrabold text-lg border-3 cursor-pointer ${
                        solved && opt === fillQuestions[subIdx].correctOption
                          ? 'bg-[#54C98A] text-[#183B70] border-[#2F9B62]'
                          : active
                            ? 'bg-[#2388E8] text-white border-[#183B70] shadow-md'
                            : 'bg-[#F8FAFC] hover:bg-[#EEF6FF] text-[#183B70] border-[#CBD5E1]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {phase === 'TF' && (
            <div className="my-auto space-y-6">
              <div className="bg-[#F3EFFE] border-2 border-[#9670E8]/35 rounded-3xl p-6 md:p-8 text-center">
                <p className="text-xs font-bold text-[#9670E8] mb-2">NHẬN ĐỊNH TOÁN HỌC</p>
                <p className="font-display text-xl md:text-2xl font-extrabold text-[#183B70] leading-snug">
                  “{tfQuestions[subIdx].statement}”
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => {
                    soundEngine.playClick();
                    setFeedback(null);
                    setSelectedTf(true);
                  }}
                  className={`btn-3d py-4 px-6 rounded-2xl font-display font-extrabold text-xl border-3 cursor-pointer ${
                    solved && tfQuestions[subIdx].isTrue
                      ? 'bg-[#54C98A] text-[#183B70] border-[#2F9B62]'
                      : selectedTf === true
                        ? 'bg-[#2388E8] text-white border-[#183B70]'
                        : 'bg-[#F8FAFC] hover:bg-[#ECFDF5] text-[#183B70] border-[#CBD5E1]'
                  }`}
                >
                  ĐÚNG
                </button>
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => {
                    soundEngine.playClick();
                    setFeedback(null);
                    setSelectedTf(false);
                  }}
                  className={`btn-3d py-4 px-6 rounded-2xl font-display font-extrabold text-xl border-3 cursor-pointer ${
                    solved && !tfQuestions[subIdx].isTrue
                      ? 'bg-[#54C98A] text-[#183B70] border-[#2F9B62]'
                      : selectedTf === false
                        ? 'bg-[#FF9B42] text-[#183B70] border-[#183B70]'
                        : 'bg-[#F8FAFC] hover:bg-[#FFF9E6] text-[#183B70] border-[#CBD5E1]'
                  }`}
                >
                  SAI
                </button>
              </div>
            </div>
          )}

          {phase === 'MATCH' && (
            <div className="my-auto space-y-4">
              {/* Two Drop Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Parallelogram Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/plain') || draggingCardId;
                    if (id) placeCardInZone(id, 'para');
                  }}
                  onClick={() => {
                    if (activeCardId) placeCardInZone(activeCardId, 'para');
                  }}
                  className={`rounded-2xl border-3 p-3.5 transition-colors min-h-[175px] flex flex-col ${
                    activeCardId
                      ? 'border-dashed border-[#2388E8] bg-[#EEF6FF] cursor-pointer'
                      : 'border-[#2388E8]/40 bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-[#183B70]/10">
                    <div className="w-16 h-12 shrink-0">
                      <GeometryShape kind="parallelogram" color="#2388E8" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-base text-[#2388E8]">
                        HÌNH BÌNH HÀNH
                      </h3>
                      <p className="text-xs text-[#183B70]/70">Cần 2 đặc điểm ({paraZone.length}/2)</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {paraZone.length === 0 && (
                      <p className="text-xs text-[#183B70]/50 italic py-4 text-center">
                        Kéo thả thẻ vào đây
                      </p>
                    )}
                    {paraZone.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCardFromZones(card.id);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white border-2 border-[#2388E8] text-xs md:text-sm font-bold text-[#183B70] flex items-center justify-between gap-2 shadow-xs cursor-pointer"
                      >
                        <span>{card.text}</span>
                        {!solved && <span className="text-xs text-[#EF4444]">✕</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rhombus Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('text/plain') || draggingCardId;
                    if (id) placeCardInZone(id, 'rhom');
                  }}
                  onClick={() => {
                    if (activeCardId) placeCardInZone(activeCardId, 'rhom');
                  }}
                  className={`rounded-2xl border-3 p-3.5 transition-colors min-h-[175px] flex flex-col ${
                    activeCardId
                      ? 'border-dashed border-[#9670E8] bg-[#F3EFFE] cursor-pointer'
                      : 'border-[#9670E8]/40 bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-[#183B70]/10">
                    <div className="w-16 h-12 shrink-0">
                      <GeometryShape kind="rhombus" color="#9670E8" rotationDeg={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-base text-[#9670E8]">
                        HÌNH THOI
                      </h3>
                      <p className="text-xs text-[#183B70]/70">Cần 2 đặc điểm ({rhomZone.length}/2)</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {rhomZone.length === 0 && (
                      <p className="text-xs text-[#183B70]/50 italic py-4 text-center">
                        Kéo thả thẻ vào đây
                      </p>
                    )}
                    {rhomZone.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCardFromZones(card.id);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white border-2 border-[#9670E8] text-xs md:text-sm font-bold text-[#183B70] flex items-center justify-between gap-2 shadow-xs cursor-pointer"
                      >
                        <span>{card.text}</span>
                        {!solved && <span className="text-xs text-[#EF4444]">✕</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Draggable Tray */}
              <div className="bg-[#EEF6FF] rounded-2xl p-3 border border-[#2388E8]/20">
                <p className="text-xs font-bold text-[#183B70]/75 mb-2">
                  Kho thẻ đặc điểm (kéo bằng chuột hoặc chạm chọn thẻ rồi chạm vào ô hình):
                </p>
                {trayCards.length === 0 ? (
                  <p className="text-sm font-bold text-[#1E8750] text-center py-2">
                    Đã xếp đủ 4 thẻ! Hãy bấm Xác nhận để kiểm tra nhé.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trayCards.map((card) => {
                      const isPicked = activeCardId === card.id;
                      return (
                        <div
                          key={card.id}
                          draggable={!solved}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', card.id);
                            setDraggingCardId(card.id);
                          }}
                          onDragEnd={() => setDraggingCardId(null)}
                          onClick={() => {
                            soundEngine.playClick();
                            setActiveCardId((prev) => (prev === card.id ? null : card.id));
                          }}
                          className={`px-3 py-2.5 rounded-xl border-2 font-bold text-xs md:text-sm flex items-center gap-2 cursor-grab active:cursor-grabbing select-none transition-all ${
                            isPicked
                              ? 'bg-[#FFD447] border-[#183B70] text-[#183B70] shadow-md'
                              : 'bg-white hover:bg-[#FFF9E6] border-[#CBD5E1] text-[#183B70]'
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-[#64748B] shrink-0" />
                          <span>{card.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Confirm / Next */}
          <div className="pt-3 mt-3 border-t border-[#183B70]/10 flex items-center justify-between gap-3">
            <span className="text-xs md:text-sm font-semibold text-[#183B70]/70">
              {phase === 'MATCH'
                ? 'Chạm thẻ đã đặt nếu muốn tháo ra đặt lại'
                : 'Chọn đáp án đúng nhất rồi nhấn Xác nhận'}
            </span>
            {!solved ? (
              <button
                type="button"
                onClick={
                  phase === 'FILL'
                    ? handleConfirmFill
                    : phase === 'TF'
                      ? handleConfirmTf
                      : handleConfirmMatch
                }
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
                {phase === 'MATCH' ? 'HOÀN THÀNH CHẶNG 2 ★' : 'CÂU TIẾP THEO →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
