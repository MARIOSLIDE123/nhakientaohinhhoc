export type ScreenId =
  | 'SPLASH'
  | 'MAP'
  | 'STAGE_1'
  | 'STAGE_2'
  | 'STAGE_3'
  | 'STAGE_4'
  | 'SUMMARY';

export type StageNumber = 1 | 2 | 3 | 4;

export type RobotMood =
  | 'happy'
  | 'thinking'
  | 'surprised'
  | 'encouraging'
  | 'celebrating';

export type ShapeKind =
  | 'parallelogram'
  | 'rhombus'
  | 'rectangle'
  | 'trapezoid'
  | 'triangle'
  | 'pentagon';

export interface GeometricShapeConfig {
  id: string;
  kind: ShapeKind;
  color: string;
  rotationDeg: number;
  scale?: number;
  /** Skew direction for parallelogram: 1 = right lean, -1 = left lean */
  lean?: 1 | -1;
  /** Ratio or angle tweak so sizes vary authentically */
  aspectRatio?: number;
  label?: string;
}

export interface Stage1MultiSelectTask {
  id: string;
  type: 'multi-select';
  title: string;
  prompt: string;
  targetKind: 'parallelogram' | 'rhombus';
  shapes: GeometricShapeConfig[];
  hint: string;
  successPraise: string;
}

export interface Stage1BinaryTask {
  id: string;
  type: 'binary-classify';
  title: string;
  prompt: string;
  shape: GeometricShapeConfig;
  correctAnswer: 'parallelogram' | 'rhombus';
  allowRotatePreview?: boolean;
  hint: string;
  successPraise: string;
}

export type Stage1Task = Stage1MultiSelectTask | Stage1BinaryTask;

export interface Stage2FillQuestion {
  id: string;
  promptBefore: string;
  promptAfter: string;
  options: string[];
  correctOption: string;
  hint: string;
}

export interface Stage2TrueFalseQuestion {
  id: string;
  statement: string;
  isTrue: boolean;
  hint: string;
}

export interface Stage2MatchCard {
  id: string;
  text: string;
  propertyKey: 'parallel_pairs' | 'equal_opposite' | 'four_equal';
}

export type Stage3Task =
  | {
      id: string;
      kind: 'pattern';
      title: string;
      prompt: string;
      sequence: GeometricShapeConfig[];
      options: (GeometricShapeConfig & { isCorrect: boolean })[];
      hint: string;
      successPraise: string;
    }
  | {
      id: string;
      kind: 'error-spot';
      title: string;
      robotClaim: string;
      isClaimTrue: boolean;
      reasonOptions: { id: string; text: string; isCorrect: boolean }[];
      hint: string;
      successPraise: string;
    }
  | {
      id: string;
      kind: 'condition-match';
      title: string;
      prompt: string;
      conditions: string[];
      options: (GeometricShapeConfig & { isCorrect: boolean })[];
      hint: string;
      successPraise: string;
    }
  | {
      id: string;
      kind: 'decode';
      title: string;
      prompt: string;
      clues: string[];
      revealedShape: GeometricShapeConfig;
      options: { id: string; label: string; isCorrect: boolean }[];
      hint: string;
      successPraise: string;
    }
  | {
      id: string;
      kind: 'distinguish';
      title: string;
      prompt: string;
      shapeA: GeometricShapeConfig;
      shapeB: GeometricShapeConfig;
      targetLabelForA: 'parallelogram' | 'rhombus';
      reasonOptions: { id: string; text: string; isCorrect: boolean }[];
      hint: string;
      successPraise: string;
    };

export interface StageProgress {
  unlocked: boolean;
  completed: boolean;
  answeredCount: number;
  correctCount: number;
  totalTasks: number;
  earnedPoints: number;
  badgeName: string;
}

export interface GameProgress {
  totalScore: number;
  answeredIds: string[];
  firstTryIds: string[];
  stages: Record<StageNumber, StageProgress>;
  sessionSeed: number;
}
