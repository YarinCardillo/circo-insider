import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/Button/Button';
import { Timer } from '../../components/Timer/Timer';
import styles from './DiscussionScreen.module.css';

export function DiscussionScreen() {
  const { phaseData, isHost, forceVoting } = useSocketContext();

  if (!phaseData) return null;

  const { duration, word } = phaseData;

  return (
    <div className={styles.screen}>
      <h2>Discussione</h2>

      <div className={styles.wordReveal}>{word}</div>

      <p className="info-text">
        Discutete e trovate l'Infiltrato!
      </p>

      <Timer initialSeconds={duration} onEnd={() => {}} label="Tempo rimanente" />

      {isHost ? (
        <Button variant="purple" size="small" onClick={forceVoting}>
          Forza Votazione
        </Button>
      ) : (
        <p className="info-text">
          L'host può terminare prima la discussione
        </p>
      )}
    </div>
  );
}
