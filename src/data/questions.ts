import {
  Stage1Task,
  Stage2FillQuestion,
  Stage2MatchCard,
  Stage2TrueFalseQuestion,
  Stage3Task,
} from '../types/game';

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================================
// CHẶNG 1: NHẬN DIỆN HÌNH HỌC (Ngân hàng 6 câu, chọn 5 câu ngẫu nhiên không lặp)
// ============================================================================
export const STAGE_1_BANK: Stage1Task[] = [
  {
    id: 's1_find_parallelogram',
    type: 'multi-select',
    title: 'Nhiệm vụ: Tìm hình bình hành',
    prompt: 'Em hãy chọn TẤT CẢ các hình bình hành trong bảng dưới đây!',
    targetKind: 'parallelogram',
    shapes: [
      { id: 's1_q1_a', kind: 'parallelogram', color: '#2388E8', rotationDeg: 14, lean: 1, aspectRatio: 1.05 },
      { id: 's1_q1_b', kind: 'rhombus', color: '#FFD447', rotationDeg: 32, aspectRatio: 0.9 },
      { id: 's1_q1_c', kind: 'triangle', color: '#FF9B42', rotationDeg: -10 },
      { id: 's1_q1_d', kind: 'parallelogram', color: '#54C98A', rotationDeg: -18, lean: -1, aspectRatio: 0.92 },
      { id: 's1_q1_e', kind: 'trapezoid', color: '#9670E8', rotationDeg: 0 },
      { id: 's1_q1_f', kind: 'rectangle', color: '#38BDF8', rotationDeg: 12 },
    ],
    hint: 'Gợi ý: Hình bình hành có 2 cặp cạnh đối diện song song và bằng nhau, các góc không vuông và 2 cạnh kề không bằng nhau. Hãy tìm cả hình nghiêng sang phải và nghiêng sang trái nhé!',
    successPraise: 'Tuyệt vời! Em đã nhận ra cả hai hình bình hành dù chúng nghiêng và xoay theo hướng khác nhau!',
  },
  {
    id: 's1_find_rhombus',
    type: 'multi-select',
    title: 'Nhiệm vụ: Tìm hình thoi',
    prompt: 'Em hãy chọn TẤT CẢ những hình có BỐN CẠNH BẰNG NHAU (hình thoi)!',
    targetKind: 'rhombus',
    shapes: [
      { id: 's1_q2_a', kind: 'rhombus', color: '#FF9B42', rotationDeg: 36, aspectRatio: 0.95 },
      { id: 's1_q2_b', kind: 'parallelogram', color: '#2388E8', rotationDeg: 0, lean: 1, aspectRatio: 1.1 },
      { id: 's1_q2_c', kind: 'rhombus', color: '#9670E8', rotationDeg: 90, aspectRatio: 1.05 },
      { id: 's1_q2_d', kind: 'trapezoid', color: '#54C98A', rotationDeg: 18 },
      { id: 's1_q2_e', kind: 'rhombus', color: '#FFD447', rotationDeg: -24, aspectRatio: 0.9 },
      { id: 's1_q2_f', kind: 'pentagon', color: '#EC4899', rotationDeg: 15 },
    ],
    hint: 'Gợi ý: Hình thoi luôn có 4 cạnh bằng nhau dù được đặt nằm ngang hay xoay nghiêng, không nhất thiết đứng như viên kim cương đâu nhé!',
    successPraise: 'Chính xác! Cả 3 hình thoi đều có 4 cạnh bằng nhau dù xoay ở nhiều góc khác nhau!',
  },
  {
    id: 's1_binary_1',
    type: 'binary-classify',
    title: 'Nhận diện qua hình ảnh',
    prompt: 'Quan sát thật kỹ các cạnh của hình bên dưới. Đây là hình gì?',
    shape: { id: 's1_b1', kind: 'parallelogram', color: '#2388E8', rotationDeg: 24, lean: 1, aspectRatio: 1.12 },
    correctAnswer: 'parallelogram',
    allowRotatePreview: true,
    hint: 'Gợi ý: Hãy nhìn độ dài 2 cạnh liền kề nhau — một cạnh dài hơn và một cạnh ngắn hơn, không bằng nhau cả 4 cạnh.',
    successPraise: 'Chuẩn xác! Đây là hình bình hành với 2 cặp cạnh đối diện song song và bằng nhau!',
  },
  {
    id: 's1_binary_2',
    type: 'binary-classify',
    title: 'Thử thách xoay góc',
    prompt: 'Hình màu tím đang xoay nghiêng này có 4 cạnh bằng nhau. Nó là hình gì?',
    shape: { id: 's1_b2', kind: 'rhombus', color: '#9670E8', rotationDeg: 62, aspectRatio: 0.9 },
    correctAnswer: 'rhombus',
    allowRotatePreview: true,
    hint: 'Gợi ý: Khi một hình có hai cặp cạnh đối diện song song VÀ 4 cạnh đều dài bằng nhau, đó chính là hình thoi!',
    successPraise: 'Quá đỉnh! Dù xoay nghiêng 62 độ thì 4 cạnh bằng nhau vẫn là hình thoi!',
  },
  {
    id: 's1_binary_3',
    type: 'binary-classify',
    title: 'Quan sát nhanh nhạy',
    prompt: 'Hình màu xanh lá nghiêng sang trái này thuộc loại hình nào?',
    shape: { id: 's1_b3', kind: 'parallelogram', color: '#54C98A', rotationDeg: -28, lean: -1, aspectRatio: 1.15 },
    correctAnswer: 'parallelogram',
    allowRotatePreview: true,
    hint: 'Gợi ý: Hình có cặp cạnh dài song song bằng nhau và cặp cạnh ngắn song song bằng nhau.',
    successPraise: 'Giỏi lắm! Hướng nghiêng hay màu sắc không làm em bị nhầm lẫn!',
  },
  {
    id: 's1_binary_4',
    type: 'binary-classify',
    title: 'Bức màn hình học',
    prompt: 'Hình màu cam đặt nằm ngang này là hình bình hành hay hình thoi?',
    shape: { id: 's1_b4', kind: 'rhombus', color: '#FF9B42', rotationDeg: 90, aspectRatio: 0.92 },
    correctAnswer: 'rhombus',
    allowRotatePreview: true,
    hint: 'Gợi ý: Em hãy chú ý độ dài 4 cạnh xung quanh — cả 4 cạnh đều dài bằng nhau đấy!',
    successPraise: 'Tuyệt vời! Em đã nhận diện rất chính xác hình thoi nằm ngang!',
  },
];

// ============================================================================
// CHẶNG 2: NHÀ THÔNG THÁI HÌNH HỌC
// ============================================================================
export const STAGE_2_FILL_BANK: Stage2FillQuestion[] = [
  {
    id: 's2_fill_1',
    promptBefore: 'Hình bình hành có hai cặp cạnh đối diện ',
    promptAfter: '.',
    options: ['Song song', 'Vuông góc', 'Cắt nhau'],
    correctOption: 'Song song',
    hint: 'Gợi ý: Hai cạnh đối diện của hình bình hành kéo dài mãi không bao giờ cắt nhau — chúng song song với nhau!',
  },
  {
    id: 's2_fill_2',
    promptBefore: 'Hình thoi có ',
    promptAfter: ' cạnh bằng nhau.',
    options: ['Hai', 'Ba', 'Bốn'],
    correctOption: 'Bốn',
    hint: 'Gợi ý: Đặc điểm nổi bật nhất của hình thoi là cả 4 cạnh xung quanh đều có độ dài bằng nhau.',
  },
  {
    id: 's2_fill_3',
    promptBefore: 'Hình bình hành có hai cặp cạnh đối diện ',
    promptAfter: '.',
    options: ['Bằng nhau', 'Không liên quan', 'Vuông góc'],
    correctOption: 'Bằng nhau',
    hint: 'Gợi ý: Hai cạnh đối diện trong hình bình hành vừa song song vừa có độ dài bằng nhau!',
  },
];

export const STAGE_2_TF_BANK: Stage2TrueFalseQuestion[] = [
  {
    id: 's2_tf_1',
    statement: 'Hình bình hành có hai cặp cạnh đối diện song song.',
    isTrue: true,
    hint: 'Gợi ý: Nhớ lại định nghĩa trong Bài 31 — hình bình hành luôn có 2 cặp cạnh đối diện song song và bằng nhau.',
  },
  {
    id: 's2_tf_2',
    statement: 'Hình thoi có bốn cạnh bằng nhau.',
    isTrue: true,
    hint: 'Gợi ý: Cả bốn cạnh của hình thoi luôn có độ dài bằng nhau.',
  },
  {
    id: 's2_tf_3',
    statement: 'Hình thoi chỉ có hai cạnh bằng nhau.',
    isTrue: false,
    hint: 'Gợi ý: Hãy kiểm tra lại số cạnh bằng nhau của hình thoi nhé — phải là tất cả 4 cạnh!',
  },
  {
    id: 's2_tf_4',
    statement: 'Hình bình hành có bốn cạnh bằng nhau trong mọi trường hợp.',
    isTrue: false,
    hint: 'Gợi ý: Hình bình hành chỉ bắt buộc có 2 cặp cạnh đối diện bằng nhau, không nhất thiết cả 4 cạnh đều bằng nhau.',
  },
  {
    id: 's2_tf_5',
    statement: 'Hình thoi có hai cặp cạnh đối diện song song.',
    isTrue: true,
    hint: 'Gợi ý: Giống như hình bình hành, hai cặp cạnh đối diện của hình thoi cũng song song với nhau.',
  },
];

export const STAGE_2_MATCH_CARDS: Stage2MatchCard[] = [
  { id: 'm_card_1', text: 'Hai cặp cạnh đối diện song song', propertyKey: 'parallel_pairs' },
  { id: 'm_card_2', text: 'Hai cặp cạnh đối diện bằng nhau', propertyKey: 'equal_opposite' },
  { id: 'm_card_3', text: 'Bốn cạnh bằng nhau', propertyKey: 'four_equal' },
  { id: 'm_card_4', text: 'Hai cặp cạnh đối diện song song', propertyKey: 'parallel_pairs' },
];

// ============================================================================
// CHẶNG 3: THỬ THÁCH TƯ DUY (5 nhiệm vụ giải mã)
// ============================================================================
export const STAGE_3_BANK: Stage3Task[] = [
  {
    id: 's3_pattern',
    kind: 'pattern',
    title: 'Mật mã 1: Tìm hình còn thiếu',
    prompt: 'Quan sát quy luật của dãy hình dưới đây và chọn hình đúng cho dấu "?"',
    sequence: [
      { id: 'seq_1', kind: 'parallelogram', color: '#2388E8', rotationDeg: 0, lean: 1 },
      { id: 'seq_2', kind: 'rhombus', color: '#FFD447', rotationDeg: 0 },
      { id: 'seq_3', kind: 'parallelogram', color: '#2388E8', rotationDeg: 0, lean: 1 },
    ],
    options: [
      { id: 'opt_p1', kind: 'rhombus', color: '#FFD447', rotationDeg: 0, isCorrect: true },
      { id: 'opt_p2', kind: 'parallelogram', color: '#2388E8', rotationDeg: 0, lean: 1, isCorrect: false },
      { id: 'opt_p3', kind: 'trapezoid', color: '#54C98A', rotationDeg: 0, isCorrect: false },
    ],
    hint: 'Gợi ý: Dãy hình lặp lại xen kẽ theo cặp: Hình bình hành xanh → Hình thoi vàng → Hình bình hành xanh → ...',
    successPraise: 'Chuẩn không cần chỉnh! Quy luật xen kẽ: tiếp theo chắc chắn là Hình thoi vàng!',
  },
  {
    id: 's3_error_spot',
    kind: 'error-spot',
    title: 'Mật mã 2: Phát hiện lỗi sai',
    robotClaim: '“Tất cả các hình bình hành đều có bốn cạnh bằng nhau.”',
    isClaimTrue: false,
    reasonOptions: [
      {
        id: 'err_r1',
        text: 'Vì hình bình hành có hai cặp cạnh đối diện bằng nhau, không nhất thiết bốn cạnh đều bằng nhau.',
        isCorrect: true,
      },
      {
        id: 'err_r2',
        text: 'Vì hình bình hành có bốn góc vuông.',
        isCorrect: false,
      },
      {
        id: 'err_r3',
        text: 'Vì hình bình hành chỉ có hai cạnh song song.',
        isCorrect: false,
      },
    ],
    hint: 'Gợi ý: Chỉ hình thoi mới luôn có 4 cạnh bằng nhau, còn hình bình hành có thể có chiều dài và cạnh bên khác nhau!',
    successPraise: 'Tuyệt vời! Em lập luận rất sắc bén để giúp Robot sửa lại nhận định!',
  },
  {
    id: 's3_condition',
    kind: 'condition-match',
    title: 'Mật mã 3: Tìm hình theo điều kiện',
    prompt: 'Chọn hình thỏa mãn ĐỒNG THỜI cả hai điều kiện mật mã sau:',
    conditions: [
      'Có hai cặp cạnh đối diện song song',
      'Có bốn cạnh bằng nhau',
    ],
    options: [
      { id: 'cond_1', kind: 'rhombus', color: '#9670E8', rotationDeg: 26, aspectRatio: 0.9, isCorrect: true },
      { id: 'cond_2', kind: 'parallelogram', color: '#2388E8', rotationDeg: -14, lean: 1, aspectRatio: 1.12, isCorrect: false },
      { id: 'cond_3', kind: 'rectangle', color: '#FF9B42', rotationDeg: 8, isCorrect: false },
      { id: 'cond_4', kind: 'trapezoid', color: '#54C98A', rotationDeg: 0, isCorrect: false },
    ],
    hint: 'Gợi ý: Điều kiện thứ nhất loại hình thang; điều kiện "bốn cạnh bằng nhau" chỉ ra chính xác hình thoi!',
    successPraise: 'Xuất sắc! Em đã tìm ra đúng hình thoi thỏa mãn cả hai điều kiện!',
  },
  {
    id: 's3_decode',
    kind: 'decode',
    title: 'Mật mã 4: Giải mã hộp bí ẩn',
    prompt: 'Đọc các dữ kiện mật mã bên dưới để mở khóa tên hình bí ẩn!',
    clues: [
      'Dữ kiện 1: Hai cặp cạnh đối diện song song.',
      'Dữ kiện 2: Bốn cạnh đều có độ dài bằng nhau.',
    ],
    revealedShape: { id: 'dec_shape', kind: 'rhombus', color: '#54C98A', rotationDeg: 40, aspectRatio: 0.95 },
    options: [
      { id: 'dec_1', label: 'Hình thoi', isCorrect: true },
      { id: 'dec_2', label: 'Hình bình hành', isCorrect: false },
      { id: 'dec_3', label: 'Hình thang', isCorrect: false },
      { id: 'dec_4', label: 'Hình tam giác', isCorrect: false },
    ],
    hint: 'Gợi ý: Hình nào vừa có 2 cặp cạnh đối diện song song vừa có 4 cạnh bằng nhau?',
    successPraise: 'Giải mã thành công! Hộp bí ẩn chứa một Hình thoi hoàn hảo!',
  },
  {
    id: 's3_distinguish',
    kind: 'distinguish',
    title: 'Mật mã 5: Thử thách phân biệt',
    prompt: 'Hai hình dưới đây CÓ CÙNG MÀU XANH và đang xoay nghiêng. Em hãy chọn hình nào là HÌNH THOI và chọn căn cứ giải thích!',
    shapeA: { id: 'dist_a', kind: 'parallelogram', color: '#2388E8', rotationDeg: -22, lean: -1, aspectRatio: 1.15 },
    shapeB: { id: 'dist_b', kind: 'rhombus', color: '#2388E8', rotationDeg: 58, aspectRatio: 0.9 },
    targetLabelForA: 'parallelogram',
    reasonOptions: [
      {
        id: 'dist_r1',
        text: 'Dựa vào đặc điểm cạnh: Hình thoi có 4 cạnh bằng nhau; hình bình hành có 2 cặp cạnh đối diện bằng nhau.',
        isCorrect: true,
      },
      {
        id: 'dist_r2',
        text: 'Dựa vào hướng xoay nghiêng nhiều hay ít.',
        isCorrect: false,
      },
      {
        id: 'dist_r3',
        text: 'Dựa vào kích thước to hay nhỏ của hình.',
        isCorrect: false,
      },
    ],
    hint: 'Gợi ý: Màu sắc và hướng xoay không quyết định tên hình. Hãy đo bằng mắt độ dài 4 cạnh của Hình A và Hình B!',
    successPraise: 'Tuyệt đỉnh! Em đã phân biệt chính xác dựa trên đặc điểm cạnh chứ không bị đánh lừa bởi màu sắc hay góc xoay!',
  },
];

// ============================================================================
// CHẶNG 4: HÌNH HỌC QUANH EM (4 địa điểm thành phố hình học)
// ============================================================================
export const STAGE_4_GARDEN_TILES = [
  { id: 'tile_1', kind: 'rhombus' as const, color: '#54C98A', rotationDeg: 28, aspectRatio: 0.92, name: 'Viên gạch A' },
  { id: 'tile_2', kind: 'parallelogram' as const, color: '#2388E8', rotationDeg: 0, lean: 1 as const, aspectRatio: 1.1, name: 'Viên gạch B' },
  { id: 'tile_3', kind: 'rhombus' as const, color: '#FF9B42', rotationDeg: 90, aspectRatio: 0.95, name: 'Viên gạch C' },
  { id: 'tile_4', kind: 'rectangle' as const, color: '#9670E8', rotationDeg: 0, name: 'Viên gạch D' },
  { id: 'tile_5', kind: 'rhombus' as const, color: '#FFD447', rotationDeg: -16, aspectRatio: 0.9, name: 'Viên gạch E' },
  { id: 'tile_6', kind: 'parallelogram' as const, color: '#38BDF8', rotationDeg: 14, lean: -1 as const, aspectRatio: 1.08, name: 'Viên gạch F' },
];

export const STAGE_4_HOUSE_ITEMS = [
  {
    id: 'house_frame',
    title: 'Khung trang trí phòng khách',
    kind: 'parallelogram' as const,
    color: '#FF9B42',
    rotationDeg: 0,
    lean: 1 as const,
    aspectRatio: 1.15,
    correctAnswer: 'parallelogram' as const,
  },
  {
    id: 'house_window',
    title: 'Ô kính hoa văn cửa sổ',
    kind: 'rhombus' as const,
    color: '#2388E8',
    rotationDeg: 0,
    aspectRatio: 0.9,
    correctAnswer: 'rhombus' as const,
  },
  {
    id: 'house_plaque',
    title: 'Tấm biển trang trí ban công',
    kind: 'parallelogram' as const,
    color: '#54C98A',
    rotationDeg: 8,
    lean: -1 as const,
    aspectRatio: 1.1,
    correctAnswer: 'parallelogram' as const,
  },
];

export const STAGE_4_WORKSHOP_PIECES = [
  { id: 'wp_1', kind: 'parallelogram' as const, color: '#2388E8', rotationDeg: 0, lean: 1 as const, aspectRatio: 1.1, label: 'Thanh gỗ bình hành' },
  { id: 'wp_2', kind: 'rhombus' as const, color: '#FFD447', rotationDeg: 0, aspectRatio: 0.92, label: 'Mảnh kính hình thoi' },
  { id: 'wp_3', kind: 'trapezoid' as const, color: '#9670E8', rotationDeg: 0, label: 'Mảnh hình thang' },
  { id: 'wp_4', kind: 'triangle' as const, color: '#FF9B42', rotationDeg: 0, label: 'Mảnh tam giác' },
];
