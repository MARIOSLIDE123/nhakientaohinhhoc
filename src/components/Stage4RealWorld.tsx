import React, { useMemo, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import cityBg from '../assets/images/bg_geometry_city_1794534592002.jpg';
import {
  STAGE_4_GARDEN_TILES,
  STAGE_4_HOUSE_ITEMS,
  STAGE_4_WORKSHOP_PIECES,
  shuffleArray,
} from '../data/questions';
import { RobotMood, ShapeKind } from '../types/game';
import { soundEngine } from '../utils/sound';
import { GeometryShape } from './GeometryShape';
import { RobotCompanion } from './RobotCompanion';

interface Stage4RealWorldProps {
  sessionSeed: number;
  answeredIds: string[];
  onRecordAnswer: (questionId: string, isFirstTry: boolean) => void;
  onCompleteStage: (correctCount: number, totalTasks: number) => void;
}

interface MosaicPiece {
  id: string;
  kind: ShapeKind;
  color: string;
  label: string;
  rotationDeg: number;
  lean?: 1 | -1;
}

const MOSAIC_SLOTS: { id: string; expected: 'parallelogram' | 'rhombus'; label: string }[] = [
  { id: 'slot_1', expected: 'parallelogram', label: 'Cánh trái: Hình bình hành' },
  { id: 'slot_2', expected: 'rhombus', label: 'Tâm mặt trời: Hình thoi' },
  { id: 'slot_3', expected: 'parallelogram', label: 'Cánh phải: Hình bình hành' },
  { id: 'slot_4', expected: 'rhombus', label: 'Đuôi diều: Hình thoi' },
];

const MOSAIC_PIECES_BASE: MosaicPiece[] = [
  { id: 'mp_1', kind: 'parallelogram', color: '#2388E8', label: 'Hình bình hành xanh', rotationDeg: 0, lean: 1 },
  { id: 'mp_2', kind: 'rhombus', color: '#FFD447', label: 'Hình thoi vàng', rotationDeg: 0 },
  { id: 'mp_3', kind: 'parallelogram', color: '#54C98A', label: 'Hình bình hành lá', rotationDeg: 0, lean: -1 },
  { id: 'mp_4', kind: 'rhombus', color: '#FF9B42', label: 'Hình thoi cam', rotationDeg: 0 },
  { id: 'mp_5', kind: 'trapezoid', color: '#9670E8', label: 'Hình thang tím', rotationDeg: 0 },
  { id: 'mp_6', kind: 'triangle', color: '#EC4899', label: 'Hình tam giác hồng', rotationDeg: 0 },
];

export const Stage4RealWorld: React.FC<Stage4RealWorldProps> = ({
  sessionSeed,
  answeredIds,
  onRecordAnswer,
  onCompleteStage,
}) => {
  const gardenTiles = useMemo(
    () => shuffleArray(STAGE_4_GARDEN_TILES),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionSeed]
  );
  const workshopPieces = useMemo(
    () => shuffleArray(STAGE_4_WORKSHOP_PIECES),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionSeed]
  );
  const mosaicPieces = useMemo(
    () => shuffleArray(MOSAIC_PIECES_BASE),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionSeed]
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [imgError, setImgError] = useState(false);

  // Step 1: Garden tiles selection
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);

  // Step 2: House items classification
  const [houseAnswers, setHouseAnswers] = useState<Record<string, 'parallelogram' | 'rhombus'>>({});

  // Step 3: Workshop 2 slots
  const [workshopSlots, setWorkshopSlots] = useState<{
    para: string | null;
    rhom: string | null;
  }>({ para: null, rhom: null });
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(null);

  // Step 4: Mosaic 4 slots
  const [mosaicSlots, setMosaicSlots] = useState<Record<string, string | null>>({
    slot_1: null,
    slot_2: null,
    slot_3: null,
    slot_4: null,
  });
  const [activeMosaicId, setActiveMosaicId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  const stepTitles: Record<1 | 2 | 3 | 4, string> = {
    1: 'Địa điểm 1: Khu vườn hình học',
    2: 'Địa điểm 2: Ngôi nhà kỳ thú',
    3: 'Địa điểm 3: Xưởng chế tạo',
    4: 'Địa điểm 4: Nhà kiến tạo hình học',
  };

  const robotMood: RobotMood = solved
    ? 'celebrating'
    : feedback && !feedback.ok
      ? 'encouraging'
      : 'happy';

  const defaultSpeech: Record<1 | 2 | 3 | 4, string> = {
    1: 'Cùng đi dạo trong Khu vườn hình học! Em hãy chọn tất cả những viên gạch lát nền có dạng HÌNH THOI nhé!',
    2: 'Trong Ngôi nhà kỳ thú có nhiều đồ vật trang trí xinh xắn. Hãy gọi đúng tên hình của từng đồ vật nhé!',
    3: 'Giúp tớ chọn đúng vật liệu hình bình hành và hình thoi để lắp vào bản thiết kế trong Xưởng chế tạo!',
    4: 'Robot muốn tạo một bức tranh có các họa tiết hình bình hành và hình thoi. Em hãy kéo thả đúng hình để hoàn thành bức tranh!',
  };

  const robotSpeech = feedback ? feedback.text : defaultSpeech[step];

  const markStepSolved = (qId: string, praise: string) => {
    soundEngine.playCorrect();
    setSolved(true);
    setSolvedCount((c) => c + 1);
    const already = answeredIds.includes(qId);
    onRecordAnswer(qId, !hadMistake);
    setFeedback({
      ok: true,
      text: already ? praise : `${praise} (+10 điểm)`,
    });
  };

  const handleConfirmStep1 = () => {
    const expected = gardenTiles.filter((t) => t.kind === 'rhombus').map((t) => t.id).sort();
    const actual = [...selectedTiles].sort();
    if (actual.length === 0) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy chọn các viên gạch hình thoi trên lối đi nhé!' });
      return;
    }
    if (expected.length === actual.length && expected.every((v, i) => v === actual[i])) {
      markStepSolved('s4_garden', 'Tuyệt vời! Em đã lát được lối đi toàn gạch hình thoi rực rỡ!');
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({
        ok: false,
        text: 'Gợi ý: Viên gạch hình thoi phải có cả 4 cạnh bằng nhau (kể cả viên đang xoay ngang hay nghiêng)!',
      });
    }
  };

  const handleConfirmStep2 = () => {
    if (Object.keys(houseAnswers).length < STAGE_4_HOUSE_ITEMS.length) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy chọn tên hình cho cả 3 đồ vật trang trí nhé!' });
      return;
    }
    const allCorrect = STAGE_4_HOUSE_ITEMS.every(
      (item) => houseAnswers[item.id] === item.correctAnswer
    );
    if (allCorrect) {
      markStepSolved('s4_house', 'Chính xác tuyệt đối! Ngôi nhà kỳ thú đã sáng bừng lên rồi!');
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({
        ok: false,
        text: 'Gợi ý: Khung tranh và tấm biển có 2 cặp cạnh đối diện bằng nhau (dài - ngắn khác nhau) là hình bình hành; ô cửa sổ có 4 cạnh bằng nhau là hình thoi!',
      });
    }
  };

  const placeWorkshopPiece = (pieceId: string, slot: 'para' | 'rhom') => {
    if (solved) return;
    soundEngine.playClick();
    setFeedback(null);
    setWorkshopSlots((prev) => ({
      para: slot === 'para' ? pieceId : prev.para === pieceId ? null : prev.para,
      rhom: slot === 'rhom' ? pieceId : prev.rhom === pieceId ? null : prev.rhom,
    }));
    setActiveWorkshopId(null);
    setDraggingId(null);
  };

  const handleConfirmStep3 = () => {
    if (!workshopSlots.para || !workshopSlots.rhom) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy lắp đủ vật liệu vào cả 2 ô trên bản thiết kế!' });
      return;
    }
    const paraPiece = workshopPieces.find((p) => p.id === workshopSlots.para);
    const rhomPiece = workshopPieces.find((p) => p.id === workshopSlots.rhom);
    if (paraPiece?.kind === 'parallelogram' && rhomPiece?.kind === 'rhombus') {
      markStepSolved('s4_workshop', 'Xuất sắc! Sản phẩm thủ công trong xưởng đã được chế tạo hoàn chỉnh!');
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({
        ok: false,
        text: 'Gợi ý: Ô bên trái cần Thanh gỗ hình bình hành, còn ô bên phải cần Mảnh kính hình thoi có 4 cạnh bằng nhau!',
      });
    }
  };

  const placeMosaicPiece = (pieceId: string, slotId: string) => {
    if (solved) return;
    soundEngine.playClick();
    setFeedback(null);
    setMosaicSlots((prev) => {
      const next = { ...prev };
      // Remove piece from any previous slot
      Object.keys(next).forEach((k) => {
        if (next[k] === pieceId) next[k] = null;
      });
      next[slotId] = pieceId;
      return next;
    });
    setActiveMosaicId(null);
    setDraggingId(null);
  };

  const handleConfirmStep4 = () => {
    const allFilled = MOSAIC_SLOTS.every((s) => mosaicSlots[s.id] !== null);
    if (!allFilled) {
      soundEngine.playWrong();
      setFeedback({ ok: false, text: 'Em hãy ghép đủ 4 mảnh vào 4 ô trống trên bức tranh nhé!' });
      return;
    }
    const allMatch = MOSAIC_SLOTS.every((slot) => {
      const pieceId = mosaicSlots[slot.id];
      const piece = mosaicPieces.find((p) => p.id === pieceId);
      return piece?.kind === slot.expected;
    });
    if (allMatch) {
      markStepSolved(
        's4_mosaic',
        'Tuyệt tác hoàn thành! Em thật xứng đáng với danh hiệu Nhà kiến tạo hình học!'
      );
    } else {
      soundEngine.playWrong();
      setHadMistake(true);
      setFeedback({
        ok: false,
        text: 'Gợi ý: Kiểm tra lại các ô nhé — Ô Cánh trái và Cánh phải cần Hình bình hành, Ô Tâm mặt trời và Đuôi diều cần Hình thoi (không dùng hình thang hay tam giác)!',
      });
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
      setFeedback(null);
      setHadMistake(false);
      setSolved(false);
    } else {
      onCompleteStage(solvedCount, 4);
    }
  };

  const usedWorkshopIds = new Set(
    [workshopSlots.para, workshopSlots.rhom].filter(Boolean) as string[]
  );
  const usedMosaicIds = new Set(
    Object.values(mosaicSlots).filter(Boolean) as string[]
  );

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 md:p-5 bg-gradient-to-br from-[#ECFDF5] via-[#E0F2FE] to-[#FFF9E6] overflow-y-auto custom-scroll">
      {!imgError && (
        <img
          src={cityBg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        {/* Left: Robot City Tour Guide */}
        <div className="lg:col-span-4 bg-white/95 rounded-3xl border-2 border-[#54C98A]/50 p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#1E8750] mb-1">
              <span>THÀNH PHỐ HÌNH HỌC · {step}/4</span>
              <span>Chặng 4</span>
            </div>
            <h2 className="font-display text-lg md:text-xl font-extrabold text-[#183B70] mb-1.5">
              {stepTitles[step]}
            </h2>
            <p className="text-sm text-[#183B70]/80 leading-snug">
              Vận dụng hình bình hành và hình thoi vào các đồ vật, công trình quen thuộc quanh em.
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
              <span>{feedback.ok ? 'Tuyệt vời!' : 'Xem gợi ý của Robot nhé!'}</span>
            </div>
          )}
        </div>

        {/* Right: City Interactive Workspace */}
        <div className="lg:col-span-8 bg-white/95 rounded-3xl border-2 border-[#183B70]/15 p-4 md:p-5 flex flex-col justify-between shadow-lg">
          {/* STEP 1: GARDEN TILES */}
          {step === 1 && (
            <div className="my-auto space-y-3">
              <div className="bg-[#ECFDF5] border border-[#54C98A]/50 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#183B70]">
                Nhấn chọn TẤT CẢ những viên gạch lát nền có dạng <strong>HÌNH THOI</strong>:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gardenTiles.map((tile) => {
                  const isSel = selectedTiles.includes(tile.id);
                  const isRhombus = tile.kind === 'rhombus';
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playClick();
                        setFeedback(null);
                        setSelectedTiles((prev) =>
                          prev.includes(tile.id)
                            ? prev.filter((id) => id !== tile.id)
                            : [...prev, tile.id]
                        );
                      }}
                      className={`rounded-2xl p-2.5 border-3 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        solved && isRhombus
                          ? 'bg-[#ECFDF5] border-[#54C98A]'
                          : isSel
                            ? 'bg-[#EEF6FF] border-[#2388E8] ring-3 ring-[#FFD447]'
                            : 'bg-[#F8FAFC] hover:bg-white border-[#CBD5E1]'
                      }`}
                    >
                      <div className="w-28 h-22">
                        <GeometryShape
                          kind={tile.kind}
                          color={tile.color}
                          rotationDeg={tile.rotationDeg}
                          lean={tile.lean}
                          aspectRatio={tile.aspectRatio}
                          showMarkers={solved && isRhombus}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#183B70] mt-1">{tile.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: WONDER HOUSE */}
          {step === 2 && (
            <div className="my-auto space-y-3">
              <div className="bg-[#FFF9E6] border border-[#FFD447] rounded-2xl px-4 py-2.5 text-sm font-bold text-[#183B70]">
                Xác định tên hình tương ứng cho từng món đồ trang trí trong Ngôi nhà kỳ thú:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STAGE_4_HOUSE_ITEMS.map((item) => {
                  const ans = houseAnswers[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border-2 p-3 flex flex-col justify-between ${
                        solved ? 'bg-[#ECFDF5] border-[#54C98A]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-display font-bold text-sm text-[#183B70] mb-1">
                          {item.title}
                        </p>
                        <div className="w-32 h-24 mx-auto">
                          <GeometryShape
                            kind={item.kind}
                            color={item.color}
                            rotationDeg={item.rotationDeg}
                            lean={item.lean}
                            aspectRatio={item.aspectRatio}
                            showMarkers={solved}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 mt-2">
                        <button
                          type="button"
                          disabled={solved}
                          onClick={() => {
                            soundEngine.playClick();
                            setFeedback(null);
                            setHouseAnswers((p) => ({ ...p, [item.id]: 'parallelogram' }));
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${
                            ans === 'parallelogram'
                              ? 'bg-[#2388E8] text-white border-[#183B70]'
                              : 'bg-white hover:bg-[#EEF6FF] text-[#183B70] border-[#CBD5E1]'
                          }`}
                        >
                          Hình bình hành
                        </button>
                        <button
                          type="button"
                          disabled={solved}
                          onClick={() => {
                            soundEngine.playClick();
                            setFeedback(null);
                            setHouseAnswers((p) => ({ ...p, [item.id]: 'rhombus' }));
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${
                            ans === 'rhombus'
                              ? 'bg-[#9670E8] text-white border-[#183B70]'
                              : 'bg-white hover:bg-[#F3EFFE] text-[#183B70] border-[#CBD5E1]'
                          }`}
                        >
                          Hình thoi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: WORKSHOP */}
          {step === 3 && (
            <div className="my-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['para', 'rhom'] as const).map((slotKey) => {
                  const placedId = workshopSlots[slotKey];
                  const piece = workshopPieces.find((p) => p.id === placedId);
                  const isPara = slotKey === 'para';
                  return (
                    <div
                      key={slotKey}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData('text/plain') || draggingId;
                        if (id) placeWorkshopPiece(id, slotKey);
                      }}
                      onClick={() => {
                        if (activeWorkshopId) placeWorkshopPiece(activeWorkshopId, slotKey);
                        else if (placedId && !solved) {
                          setWorkshopSlots((p) => ({ ...p, [slotKey]: null }));
                        }
                      }}
                      className={`rounded-2xl border-3 p-3 flex flex-col items-center justify-center min-h-[155px] transition-all cursor-pointer ${
                        solved
                          ? 'bg-[#ECFDF5] border-[#54C98A]'
                          : activeWorkshopId
                            ? 'border-dashed border-[#2388E8] bg-[#EEF6FF]'
                            : 'border-dashed border-[#94A3B8] bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="font-display font-extrabold text-sm text-[#183B70] mb-1">
                        {isPara ? 'Vị trí 1: Vật liệu Hình bình hành' : 'Vị trí 2: Vật liệu Hình thoi'}
                      </span>
                      {piece ? (
                        <div className="flex flex-col items-center">
                          <div className="w-28 h-22">
                            <GeometryShape
                              kind={piece.kind}
                              color={piece.color}
                              lean={piece.lean}
                              aspectRatio={piece.aspectRatio}
                              showMarkers={solved}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#2388E8]">{piece.label}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-[#183B70]/55 py-6">Kéo thả hoặc chạm để đặt vào đây</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#EEF6FF] rounded-2xl p-3 border border-[#2388E8]/20">
                <p className="text-xs font-bold text-[#183B70]/75 mb-2">
                  Khay vật liệu trong xưởng (kéo thả hoặc chạm chọn rồi chạm vị trí):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {workshopPieces.map((piece) => {
                    const isUsed = usedWorkshopIds.has(piece.id);
                    const isActive = activeWorkshopId === piece.id;
                    return (
                      <div
                        key={piece.id}
                        draggable={!solved && !isUsed}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', piece.id);
                          setDraggingId(piece.id);
                        }}
                        onClick={() => {
                          if (solved || isUsed) return;
                          soundEngine.playClick();
                          setActiveWorkshopId((p) => (p === piece.id ? null : piece.id));
                        }}
                        className={`rounded-xl p-2 border-2 flex flex-col items-center transition-all select-none ${
                          isUsed
                            ? 'opacity-40 bg-[#E2E8F0] border-[#CBD5E1] cursor-default'
                            : isActive
                              ? 'bg-[#FFD447] border-[#183B70] shadow-md cursor-pointer'
                              : 'bg-white hover:bg-[#FFF9E6] border-[#CBD5E1] cursor-grab'
                        }`}
                      >
                        <div className="w-20 h-16">
                          <GeometryShape
                            kind={piece.kind}
                            color={piece.color}
                            lean={piece.lean}
                            aspectRatio={piece.aspectRatio}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#183B70] text-center">
                          {piece.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GEOMETRY MOSAIC ARTWORK */}
          {step === 4 && (
            <div className="my-auto space-y-3">
              {/* Mosaic Frame */}
              <div
                className={`rounded-3xl border-4 p-3.5 transition-all ${
                  solved
                    ? 'bg-gradient-to-br from-[#FFF6D6] via-[#ECFDF5] to-[#EEF6FF] border-[#FFD447] shadow-lg'
                    : 'bg-[#F8FAFC] border-[#2388E8]/35'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-extrabold text-sm text-[#183B70]">
                    {solved ? '★ BỨC TRANH HÌNH HỌC ĐÃ HOÀN THÀNH! ★' : 'Khung tranh ghép họa tiết'}
                  </span>
                  <span className="text-xs font-bold text-[#2388E8]">
                    Đã lắp: {Object.values(mosaicSlots).filter(Boolean).length}/4 ô
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {MOSAIC_SLOTS.map((slot) => {
                    const pid = mosaicSlots[slot.id];
                    const piece = mosaicPieces.find((p) => p.id === pid);
                    return (
                      <div
                        key={slot.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const id = e.dataTransfer.getData('text/plain') || draggingId;
                          if (id) placeMosaicPiece(id, slot.id);
                        }}
                        onClick={() => {
                          if (activeMosaicId) placeMosaicPiece(activeMosaicId, slot.id);
                          else if (pid && !solved) {
                            setMosaicSlots((prev) => ({ ...prev, [slot.id]: null }));
                          }
                        }}
                        className={`rounded-2xl border-2 p-2 min-h-[115px] flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          solved
                            ? 'bg-white/95 border-[#54C98A] shadow-sm'
                            : activeMosaicId
                              ? 'border-dashed border-[#FF9B42] bg-[#FFF9E6]'
                              : 'border-dashed border-[#94A3B8] bg-white'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-[#183B70]/80 mb-1">
                          {slot.label}
                        </span>
                        {piece ? (
                          <div className="w-20 h-16">
                            <GeometryShape
                              kind={piece.kind}
                              color={piece.color}
                              lean={piece.lean}
                              showMarkers={solved}
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#64748B] py-4">Thả hình vào đây</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mosaic Palette */}
              <div className="bg-[#EEF6FF] rounded-2xl p-2.5 border border-[#2388E8]/20">
                <p className="text-xs font-bold text-[#183B70]/75 mb-1.5">
                  Bộ mảnh ghép họa tiết (kéo thả hoặc chạm chọn rồi chạm ô tranh):
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {mosaicPieces.map((piece) => {
                    const isUsed = usedMosaicIds.has(piece.id);
                    const isActive = activeMosaicId === piece.id;
                    return (
                      <div
                        key={piece.id}
                        draggable={!solved && !isUsed}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', piece.id);
                          setDraggingId(piece.id);
                        }}
                        onClick={() => {
                          if (solved || isUsed) return;
                          soundEngine.playClick();
                          setActiveMosaicId((p) => (p === piece.id ? null : piece.id));
                        }}
                        className={`rounded-xl p-1.5 border-2 flex flex-col items-center transition-all select-none ${
                          isUsed
                            ? 'opacity-35 bg-[#E2E8F0] border-[#CBD5E1] cursor-default'
                            : isActive
                              ? 'bg-[#FFD447] border-[#183B70] shadow-md cursor-pointer'
                              : 'bg-white hover:bg-[#FFF9E6] border-[#CBD5E1] cursor-grab'
                        }`}
                      >
                        <div className="w-16 h-12">
                          <GeometryShape
                            kind={piece.kind}
                            color={piece.color}
                            lean={piece.lean}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#183B70] text-center leading-tight">
                          {piece.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="pt-3 mt-2 border-t border-[#183B70]/10 flex items-center justify-between gap-3">
            <span className="text-xs md:text-sm font-semibold text-[#183B70]/70">
              {step >= 3
                ? 'Chạm vào ô đã lắp nếu muốn tháo ra chọn lại'
                : 'Quan sát kỹ đặc điểm hình học trước khi xác nhận'}
            </span>

            {!solved ? (
              <button
                type="button"
                onClick={
                  step === 1
                    ? handleConfirmStep1
                    : step === 2
                      ? handleConfirmStep2
                      : step === 3
                        ? handleConfirmStep3
                        : handleConfirmStep4
                }
                className="btn-3d px-7 py-2.5 rounded-2xl bg-[#FFD447] hover:bg-[#ffdc64] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#d99b00] cursor-pointer whitespace-nowrap"
              >
                {step === 4 ? 'HOÀN THÀNH BỨC TRANH' : 'XÁC NHẬN'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="btn-3d px-7 py-2.5 rounded-2xl bg-[#54C98A] hover:bg-[#45b87b] text-[#183B70] font-display font-extrabold text-base border-b-4 border-[#2F9B62] cursor-pointer whitespace-nowrap"
              >
                {step < 4 ? 'ĐỊA ĐIỂM TIẾP THEO →' : 'XEM TỔNG KẾT CHIẾN THẮNG ★'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
