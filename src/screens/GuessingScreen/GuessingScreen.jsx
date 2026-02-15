import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/Button/Button';
import { Timer } from '../../components/Timer/Timer';
import styles from './GuessingScreen.module.css';

export function GuessingScreen() {
  const { phaseData, isHost, wordGuessed, timeUp } = useSocketContext();

  if (!phaseData) return null;

  const { duration } = phaseData;

  return (
    <div className={styles.screen}>
      <h2>Fase Indovinamento</h2>

      <Timer initialSeconds={duration} onEnd={() => {}} label="Tempo rimanente" />

      <p className="info-text" style={{ maxWidth: '400px', marginTop: '20px' }}>
        Fate domande SI/NO al Presentatore per indovinare la parola!
      </p>

      {isHost ? (
        <div className={styles.hostButtons}>
          <Button variant="green" onClick={wordGuessed}>
            Parola Indovinata!
          </Button>

          <Button variant="red" size="small" onClick={timeUp}>
            Tempo Scaduto
          </Button>
        </div>
      ) : (
        <div id="guess-wait" className={styles.waitMessage}>
          <p className="info-text">
            In attesa che qualcuno indovini la parola o che scada il tempo...
          </p>
        </div>
      )}
    </div>
  );
}
