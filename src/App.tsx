import { useProgress } from './game/store';
import ChambersScreen from './screens/ChambersScreen';

export default function App() {
  const { progress, recordAnswer, rollInsight, chooseActivity, answerSurprise, setGender, setName, reset, unlockQueue, shiftUnlock } =
    useProgress();
  return (
    <ChambersScreen
      progress={progress}
      recordAnswer={recordAnswer}
      rollInsight={rollInsight}
      chooseActivity={chooseActivity}
      answerSurprise={answerSurprise}
      setGender={setGender}
      setName={setName}
      unlocked={unlockQueue[0]}
      onUnlockSeen={shiftUnlock}
      onReset={reset}
    />
  );
}
