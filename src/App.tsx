import { useEffect, useState } from 'react';
import { AdventureMap } from './components/AdventureMap';
import { EffectsOverlay } from './components/EffectsOverlay';
import { GuideModal, KnowledgeModal, ResultDetailModal } from './components/Modals';
import { SplashScreen } from './components/SplashScreen';
import { Stage1Identify } from './components/Stage1Identify';
import { Stage2Knowledge } from './components/Stage2Knowledge';
import { Stage3Thinking } from './components/Stage3Thinking';
import { Stage4RealWorld } from './components/Stage4RealWorld';
import { SummaryScreen } from './components/SummaryScreen';
import { TopStatusBar } from './components/TopStatusBar';
import { GameProgress, ScreenId, StageNumber } from './types/game';
import { soundEngine } from './utils/sound';

const SESSION_KEY = 'geometry_explorer_v1_progress';

function createInitialProgress(): GameProgress {
  return {
    totalScore: 0,
    answeredIds: [],
    firstTryIds: [],
    sessionSeed: Date.now(),
    stages: {
      1: {
        unlocked: true,
        completed: false,
        answeredCount: 0,
        correctCount: 0,
        totalTasks: 5,
        earnedPoints: 0,
        badgeName: 'Thợ săn hình khối',
      },
      2: {
        unlocked: false,
        completed: false,
        answeredCount: 0,
        correctCount: 0,
        totalTasks: 9,
        earnedPoints: 0,
        badgeName: 'Nhà thông thái',
      },
      3: {
        unlocked: false,
        completed: false,
        answeredCount: 0,
        correctCount: 0,
        totalTasks: 5,
        earnedPoints: 0,
        badgeName: 'Siêu giải mã',
      },
      4: {
        unlocked: false,
        completed: false,
        answeredCount: 0,
        correctCount: 0,
        totalTasks: 4,
        earnedPoints: 0,
        badgeName: 'Kiến trúc sư nhí',
      },
    },
  };
}

const STAGE_TITLES: Record<StageNumber, string> = {
  1: 'Chặng 1: Nhận diện hình học',
  2: 'Chặng 2: Nhà thông thái hình học',
  3: 'Chặng 3: Thử thách tư duy',
  4: 'Chặng 4: Hình học quanh em',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('SPLASH');
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved) as GameProgress;
    } catch {
      // Ignore storage errors
    }
    return createInitialProgress();
  });

  const [showGuide, setShowGuide] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [showResultsDetail, setShowResultsDetail] = useState(false);
  const [muted, setMuted] = useState(false);

  const [starBurstKey, setStarBurstKey] = useState(0);
  const [badgePopup, setBadgePopup] = useState<{
    stage: StageNumber;
    title: string;
    bonus: number;
  } | null>(null);

  // Track active stage question count for TopStatusBar
  const [stageCompletedInRun, setStageCompletedInRun] = useState<Record<StageNumber, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage errors
    }
  }, [progress]);

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.muted = next;
      return next;
    });
  };

  const handleRecordAnswer = (
    stage: StageNumber,
    questionId: string,
    isFirstTry: boolean
  ) => {
    setStarBurstKey((k) => k + 1);
    setStageCompletedInRun((prev) => ({
      ...prev,
      [stage]: prev[stage] + 1,
    }));

    setProgress((prev) => {
      // Prevent double-counting points for the same question ID
      if (prev.answeredIds.includes(questionId)) {
        return prev;
      }
      const nextStage = {
        ...prev.stages[stage],
        answeredCount: prev.stages[stage].answeredCount + 1,
        correctCount: prev.stages[stage].correctCount + 1,
        earnedPoints: prev.stages[stage].earnedPoints + 10,
      };
      return {
        ...prev,
        totalScore: prev.totalScore + 10,
        answeredIds: [...prev.answeredIds, questionId],
        firstTryIds: isFirstTry ? [...prev.firstTryIds, questionId] : prev.firstTryIds,
        stages: {
          ...prev.stages,
          [stage]: nextStage,
        },
      };
    });
  };

  const handleCompleteStage = (
    stage: StageNumber,
    correctCount: number,
    totalTasks: number
  ) => {
    const alreadyCompleted = progress.stages[stage].completed;
    const bonus = alreadyCompleted ? 0 : 20;

    if (stage === 4) {
      soundEngine.playVictory();
    } else {
      soundEngine.playStageComplete();
    }

    setProgress((prev) => {
      const nextStages = { ...prev.stages };
      nextStages[stage] = {
        ...nextStages[stage],
        completed: true,
        correctCount: Math.max(nextStages[stage].correctCount, correctCount),
        totalTasks,
        earnedPoints: nextStages[stage].earnedPoints + bonus,
      };
      if (stage < 4) {
        const nextNum = (stage + 1) as StageNumber;
        nextStages[nextNum] = {
          ...nextStages[nextNum],
          unlocked: true,
        };
      }
      return {
        ...prev,
        totalScore: prev.totalScore + bonus,
        stages: nextStages,
      };
    });

    setBadgePopup({
      stage,
      title: progress.stages[stage].badgeName,
      bonus,
    });
  };

  const handleCloseBadgePopup = () => {
    soundEngine.playClick();
    const finishedStage = badgePopup?.stage;
    setBadgePopup(null);
    if (finishedStage === 4) {
      setScreen('SUMMARY');
    } else {
      setScreen('MAP');
    }
  };

  const handleSelectStage = (stage: StageNumber) => {
    setStageCompletedInRun((prev) => ({ ...prev, [stage]: 0 }));
    setScreen(`STAGE_${stage}` as ScreenId);
  };

  const handleResetGame = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setStageCompletedInRun({ 1: 0, 2: 0, 3: 0, 4: 0 });
    setBadgePopup(null);
    setScreen('MAP');
  };

  const activeStageNumber: StageNumber | null =
    screen === 'STAGE_1'
      ? 1
      : screen === 'STAGE_2'
        ? 2
        : screen === 'STAGE_3'
          ? 3
          : screen === 'STAGE_4'
            ? 4
            : null;

  return (
    <div className="min-h-screen w-full bg-[#0F274D] flex items-center justify-center p-0 lg:p-2 overflow-x-hidden">
      {/* 16:9 Presentation Stage Container on Desktop/Projector, Responsive Full-Fit on Smaller Screens */}
      <main className="w-full min-h-screen lg:min-h-0 lg:w-[min(100vw-16px,calc((100vh-16px)*16/9))] lg:h-[min(100vh-16px,calc((100vw-16px)*9/16))] lg:rounded-3xl lg:shadow-2xl lg:border-4 lg:border-[#2388E8]/40 overflow-hidden flex flex-col bg-[#F8FAFC] relative">
        {activeStageNumber && (
          <TopStatusBar
            stageName={STAGE_TITLES[activeStageNumber]}
            completedCount={stageCompletedInRun[activeStageNumber]}
            totalCount={progress.stages[activeStageNumber].totalTasks}
            totalScore={progress.totalScore}
            onBackToMap={() => setScreen('MAP')}
            onOpenKnowledge={() => setShowKnowledge(true)}
            muted={muted}
            onToggleMute={handleToggleMute}
          />
        )}

        <div className="flex-1 min-h-0 flex flex-col">
          {screen === 'SPLASH' && (
            <SplashScreen
              onStart={() => setScreen('MAP')}
              onOpenGuide={() => setShowGuide(true)}
              onOpenKnowledge={() => setShowKnowledge(true)}
            />
          )}

          {screen === 'MAP' && (
            <AdventureMap
              progress={progress}
              onSelectStage={handleSelectStage}
              onGoHome={() => setScreen('SPLASH')}
              onOpenKnowledge={() => setShowKnowledge(true)}
              onOpenSummary={() => setScreen('SUMMARY')}
              onResetGame={handleResetGame}
            />
          )}

          {screen === 'STAGE_1' && (
            <Stage1Identify
              key={`s1-${progress.sessionSeed}`}
              sessionSeed={progress.sessionSeed}
              answeredIds={progress.answeredIds}
              onRecordAnswer={(qId, firstTry) => handleRecordAnswer(1, qId, firstTry)}
              onCompleteStage={(correct, total) => handleCompleteStage(1, correct, total)}
            />
          )}

          {screen === 'STAGE_2' && (
            <Stage2Knowledge
              key={`s2-${progress.sessionSeed}`}
              sessionSeed={progress.sessionSeed}
              answeredIds={progress.answeredIds}
              onRecordAnswer={(qId, firstTry) => handleRecordAnswer(2, qId, firstTry)}
              onCompleteStage={(correct, total) => handleCompleteStage(2, correct, total)}
            />
          )}

          {screen === 'STAGE_3' && (
            <Stage3Thinking
              key={`s3-${progress.sessionSeed}`}
              sessionSeed={progress.sessionSeed}
              answeredIds={progress.answeredIds}
              onRecordAnswer={(qId, firstTry) => handleRecordAnswer(3, qId, firstTry)}
              onCompleteStage={(correct, total) => handleCompleteStage(3, correct, total)}
            />
          )}

          {screen === 'STAGE_4' && (
            <Stage4RealWorld
              key={`s4-${progress.sessionSeed}`}
              sessionSeed={progress.sessionSeed}
              answeredIds={progress.answeredIds}
              onRecordAnswer={(qId, firstTry) => handleRecordAnswer(4, qId, firstTry)}
              onCompleteStage={(correct, total) => handleCompleteStage(4, correct, total)}
            />
          )}

          {screen === 'SUMMARY' && (
            <SummaryScreen
              progress={progress}
              onReplayAll={handleResetGame}
              onShowDetails={() => setShowResultsDetail(true)}
              onGoHome={() => setScreen('SPLASH')}
            />
          )}
        </div>
      </main>

      {/* Celebration Effects & Modals */}
      <EffectsOverlay
        starBurstKey={starBurstKey}
        badgePopup={badgePopup}
        onCloseBadgePopup={handleCloseBadgePopup}
        showConfetti={screen === 'SUMMARY'}
      />

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showKnowledge && <KnowledgeModal onClose={() => setShowKnowledge(false)} />}
      {showResultsDetail && (
        <ResultDetailModal
          progress={progress}
          onClose={() => setShowResultsDetail(false)}
        />
      )}
    </div>
  );
}
