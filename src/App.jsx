import { useSocketContext } from './contexts/SocketContext';
import { HomeScreen } from './screens/HomeScreen/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen/LobbyScreen';
import { RoleRevealScreen } from './screens/RoleRevealScreen/RoleRevealScreen';
import { GuessingScreen } from './screens/GuessingScreen/GuessingScreen';
import { DiscussionScreen } from './screens/DiscussionScreen/DiscussionScreen';
import { VotingScreen } from './screens/VotingScreen/VotingScreen';
import { ResultsScreen } from './screens/ResultsScreen/ResultsScreen';
import { Toast } from './components/Toast/Toast';
import { DebugPanel } from './components/DebugPanel/DebugPanel';

export default function App() {
  const { currentScreen, toast } = useSocketContext();

  return (
    <>
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'lobby' && <LobbyScreen />}
      {currentScreen === 'reveal' && <RoleRevealScreen />}
      {currentScreen === 'guessing' && <GuessingScreen />}
      {currentScreen === 'discussion' && <DiscussionScreen />}
      {currentScreen === 'voting' && <VotingScreen />}
      {currentScreen === 'results' && <ResultsScreen />}

      <Toast message={toast.message} show={toast.show} />
      <DebugPanel />
    </>
  );
}
