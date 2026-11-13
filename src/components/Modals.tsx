import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  HelpCircle,
  RotateCw,
  Star,
  X,
} from 'lucide-react';
import { GameProgress, StageNumber } from '../types/game';
import { GeometryShape } from './GeometryShape';

interface ModalWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ title, onClose, children, icon }) => (
  <div
    className="fixed inset-0 z-50 bg-[#183B70]/65 backdrop-blur-xs flex items-center justify-center p-3 md:p-6"
    role="dialog"
    aria-modal="true"
  >
    <div className="bg-white rounded-3xl border-4 border-[#2388E8] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-pop-in">
      <div className="flex items-center justify-between px-6 py-4 bg-[#EEF6FF] border-b border-[#2388E8]/20">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-[#2388E8] text-white flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <h2 className="font-display text-xl md:text-2xl font-extrabold text-[#183B70]">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="w-10 h-10 rounded-xl bg-white hover:bg-[#FF9B42] text-[#183B70] hover:text-white border border-[#183B70]/15 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 md:p-6 overflow-y-auto custom-scroll">{children}</div>
    </div>
  </div>
);

export const GuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper
    title="Hướng dẫn chơi"
    onClose={onClose}
    icon={<HelpCircle className="w-6 h-6" />}
  >
    <div className="space-y-4 text-[#183B70]">
      <p className="text-base leading-relaxed">
        Chào mừng em đến với hành trình <strong>Thử tài Nhà kiến tạo hình học</strong>! Em sẽ đồng hành cùng bạn Robot vượt qua 4 chặng thử thách để chinh phục kiến thức <strong>Bài 31: Hình bình hành, hình thoi</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#183B70]/12 p-4">
          <p className="font-display font-bold text-[#2388E8] mb-1">1. Vượt qua 4 chặng lần lượt</p>
          <p className="text-sm text-[#183B70]/85 leading-relaxed">
            Hoàn thành mỗi chặng để mở khóa chặng tiếp theo trên Bản đồ hành trình. Em có thể mở mục <em>Kiến thức cần nhớ</em> bất cứ lúc nào.
          </p>
        </div>
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#183B70]/12 p-4">
          <p className="font-display font-bold text-[#9670E8] mb-1">2. Thao tác trực quan</p>
          <p className="text-sm text-[#183B70]/85 leading-relaxed">
            Nhấn chọn hình, chọn đáp án Đúng/Sai, hoặc kéo thả thẻ đặc điểm và mảnh ghép vào đúng vị trí.
          </p>
        </div>
        <div className="rounded-2xl bg-[#ECFDF5] border border-[#54C98A]/50 p-4">
          <p className="font-display font-bold text-[#183B70] mb-1">3. Điểm thưởng khuyến khích</p>
          <p className="text-sm text-[#183B70]/85 leading-relaxed">
            Mỗi câu trả lời đúng được <strong>+10 điểm</strong>. Hoàn thành mỗi chặng nhận thêm <strong>+20 điểm thưởng</strong> và 1 Huy hiệu!
          </p>
        </div>
        <div className="rounded-2xl bg-[#FFF9E6] border border-[#FFD447] p-4">
          <p className="font-display font-bold text-[#183B70] mb-1">4. Không trừ điểm khi sai</p>
          <p className="text-sm text-[#183B70]/85 leading-relaxed">
            Nếu chọn chưa đúng, Robot sẽ đưa ra gợi ý dễ hiểu để em tự tin thử lại ngay lập tức!
          </p>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="btn-3d px-6 py-2.5 rounded-2xl bg-[#2388E8] text-white font-display font-bold border-b-4 border-[#183B70] cursor-pointer"
        >
          Đã hiểu, sẵn sàng!
        </button>
      </div>
    </div>
  </ModalWrapper>
);

export const KnowledgeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'parallelogram' | 'rhombus' | 'compare'>('parallelogram');
  const [rotation, setRotation] = useState(0);
  const [showMarkers, setShowMarkers] = useState(true);

  return (
    <ModalWrapper
      title="Kiến thức cần nhớ — Bài 31"
      onClose={onClose}
      icon={<BookOpen className="w-6 h-6" />}
    >
      <div className="space-y-4">
        {/* Segmented Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#EEF6FF] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('parallelogram')}
            className={`px-4 py-2 rounded-xl font-display font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'parallelogram'
                ? 'bg-[#2388E8] text-white shadow-sm'
                : 'text-[#183B70] hover:bg-white/80'
            }`}
          >
            1. Hình bình hành
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rhombus')}
            className={`px-4 py-2 rounded-xl font-display font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'rhombus'
                ? 'bg-[#9670E8] text-white shadow-sm'
                : 'text-[#183B70] hover:bg-white/80'
            }`}
          >
            2. Hình thoi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl font-display font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-[#183B70] text-white shadow-sm'
                : 'text-[#183B70] hover:bg-white/80'
            }`}
          >
            3. So sánh nhanh
          </button>
        </div>

        {activeTab !== 'compare' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-6 bg-[#F8FAFC] border border-[#183B70]/12 rounded-2xl p-4 flex flex-col items-center">
              <div className="w-full h-44 flex items-center justify-center">
                <GeometryShape
                  kind={activeTab}
                  color={activeTab === 'parallelogram' ? '#2388E8' : '#9670E8'}
                  rotationDeg={rotation}
                  showMarkers={showMarkers}
                  className="w-56 h-44"
                />
              </div>

              <div className="w-full mt-2 pt-3 border-t border-[#183B70]/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#183B70]">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-[#2388E8]" />
                    Thử xoay hình để quan sát:
                  </span>
                  <span className="font-num">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={5}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-[#2388E8] cursor-pointer"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMarkers((v) => !v)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-[#183B70]/20 hover:bg-[#EEF6FF] text-[#183B70] cursor-pointer"
                  >
                    {showMarkers ? 'Ẩn ký hiệu cạnh' : 'Hiện ký hiệu cạnh'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation(0)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-[#183B70]/20 hover:bg-[#EEF6FF] text-[#183B70] cursor-pointer"
                  >
                    Góc 0°
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 space-y-3">
              {activeTab === 'parallelogram' ? (
                <>
                  <h3 className="font-display text-xl font-extrabold text-[#2388E8]">
                    Đặc điểm Hình bình hành
                  </h3>
                  <ul className="space-y-2.5 text-sm md:text-base text-[#183B70]">
                    <li className="flex items-start gap-2.5 bg-[#EEF6FF] rounded-xl p-3">
                      <CheckCircle2 className="w-5 h-5 text-[#2388E8] shrink-0 mt-0.5" />
                      <span>
                        Có <strong>hai cặp cạnh đối diện song song</strong> với nhau.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-[#EEF6FF] rounded-xl p-3">
                      <CheckCircle2 className="w-5 h-5 text-[#2388E8] shrink-0 mt-0.5" />
                      <span>
                        Có <strong>hai cặp cạnh đối diện bằng nhau</strong> về độ dài.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-[#FFF9E6] rounded-xl p-3">
                      <Compass className="w-5 h-5 text-[#FF9B42] shrink-0 mt-0.5" />
                      <span>
                        Dù xoay nghiêng sang trái, sang phải hay lộn ngược, các đặc điểm cạnh vẫn không thay đổi!
                      </span>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <h3 className="font-display text-xl font-extrabold text-[#9670E8]">
                    Đặc điểm Hình thoi
                  </h3>
                  <ul className="space-y-2.5 text-sm md:text-base text-[#183B70]">
                    <li className="flex items-start gap-2.5 bg-[#F3EFFE] rounded-xl p-3">
                      <CheckCircle2 className="w-5 h-5 text-[#9670E8] shrink-0 mt-0.5" />
                      <span>
                        Có <strong>hai cặp cạnh đối diện song song</strong> với nhau.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-[#F3EFFE] rounded-xl p-3">
                      <CheckCircle2 className="w-5 h-5 text-[#9670E8] shrink-0 mt-0.5" />
                      <span>
                        Có <strong>bốn cạnh bằng nhau</strong> (cả 4 cạnh xung quanh đều dài bằng nhau).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-[#FFF9E6] rounded-xl p-3">
                      <Compass className="w-5 h-5 text-[#FF9B42] shrink-0 mt-0.5" />
                      <span>
                        Hình thoi không chỉ đứng thẳng như viên kim cương — đặt nằm ngang hay xoay nghiêng vẫn là hình thoi!
                      </span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#183B70]/15">
            <table className="w-full text-left border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-[#183B70] text-white font-display">
                  <th className="p-3.5">Đặc điểm</th>
                  <th className="p-3.5">Hình bình hành</th>
                  <th className="p-3.5">Hình thoi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#183B70]/10">
                <tr className="bg-white">
                  <td className="p-3.5 font-bold">Cặp cạnh đối diện song song</td>
                  <td className="p-3.5 text-[#54C98A] font-bold">2 cặp song song</td>
                  <td className="p-3.5 text-[#54C98A] font-bold">2 cặp song song</td>
                </tr>
                <tr className="bg-[#F8FAFC]">
                  <td className="p-3.5 font-bold">Độ dài các cạnh</td>
                  <td className="p-3.5">2 cặp cạnh đối diện bằng nhau</td>
                  <td className="p-3.5 font-bold text-[#9670E8]">Cả 4 cạnh đều bằng nhau</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3.5 font-bold">Minh họa trực quan</td>
                  <td className="p-3.5">
                    <div className="w-24 h-16">
                      <GeometryShape kind="parallelogram" color="#2388E8" showMarkers />
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="w-24 h-16">
                      <GeometryShape kind="rhombus" color="#9670E8" showMarkers />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export const ResultDetailModal: React.FC<{
  progress: GameProgress;
  onClose: () => void;
}> = ({ progress, onClose }) => {
  const stageTitles: Record<StageNumber, string> = {
    1: 'Chặng 1: Nhận diện hình học',
    2: 'Chặng 2: Nhà thông thái hình học',
    3: 'Chặng 3: Thử thách tư duy',
    4: 'Chặng 4: Hình học quanh em',
  };

  return (
    <ModalWrapper
      title="Chi tiết kết quả học tập"
      onClose={onClose}
      icon={<Award className="w-6 h-6" />}
    >
      <div className="space-y-3">
        {([1, 2, 3, 4] as StageNumber[]).map((num) => {
          const st = progress.stages[num];
          return (
            <div
              key={num}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-[#F8FAFC] border border-[#183B70]/12"
            >
              <div>
                <h4 className="font-display font-bold text-[#183B70]">{stageTitles[num]}</h4>
                <p className="text-sm text-[#183B70]/75">
                  Huy hiệu: <strong>{st.completed ? st.badgeName : 'Chưa mở'}</strong> · Nhiệm vụ:{' '}
                  <span className="font-num font-bold">
                    {st.correctCount}/{st.totalTasks}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Star className="w-5 h-5 text-[#FF9B42] fill-[#FFD447]" />
                <span className="font-num font-bold text-lg text-[#183B70]">
                  +{st.earnedPoints} điểm
                </span>
              </div>
            </div>
          );
        })}

        <div className="pt-2 flex items-center justify-between border-t border-[#183B70]/15">
          <span className="font-display font-bold text-lg text-[#183B70]">Tổng điểm toàn hành trình</span>
          <span className="font-num font-extrabold text-2xl text-[#2388E8]">
            {progress.totalScore} điểm
          </span>
        </div>
      </div>
    </ModalWrapper>
  );
};
