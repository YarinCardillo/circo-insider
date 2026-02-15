import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/Button/Button';
import styles from './ResultsScreen.module.css';

export function ResultsScreen() {
  const { resultsData, isHost, startRound, backToLobby } = useSocketContext();

  if (!resultsData) return null;

  const {
    round,
    totalRounds,
    word,
    presentatore,
    infiltrati,
    wordGuessed,
    infiltratiCaught,
    mostVoted,
    voteTally,
    scores
  } = resultsData;

  return (
    <div className={styles.screen}>
      <h2>Risultati Round {round}</h2>

      <div className={styles.resultBox}>
        <div><strong>Parola:</strong> {word}</div>
        <div><strong>Presentatore:</strong> {presentatore}</div>
        <div><strong>Infiltrati:</strong> {infiltrati.join(', ')}</div>
      </div>

      <div className={styles.resultBox}>
        {!wordGuessed ? (
          <>
            <div className={`${styles.resultOutcome} ${styles.escaped}`}>
              Tempo Scaduto!
            </div>
            <div className={styles.resultDetail}>
              L'Infiltrato vince - nessuno ha indovinato la parola!
            </div>
          </>
        ) : infiltratiCaught ? (
          <>
            <div className={`${styles.resultOutcome} ${styles.caught}`}>
              Infiltrato Smascherato!
            </div>
            <div className={styles.resultDetail}>
              {mostVoted} era l'Infiltrato! Il Circo vince!
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.resultOutcome} ${styles.escaped}`}>
              L'Infiltrato Sfugge!
            </div>
            <div className={styles.resultDetail}>
              Avete votato {mostVoted || 'nessuno'}, ma non era l'Infiltrato!
            </div>
          </>
        )}
      </div>

      {voteTally && Object.keys(voteTally).length > 0 && (
        <div className={styles.resultBox}>
          <h3 style={{ marginBottom: '10px' }}>Voti:</h3>
          {Object.entries(voteTally)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => (
              <div key={name} className={styles.tallyRow}>
                <span>{name}</span>
                <span>{count} vot{count === 1 ? 'o' : 'i'}</span>
              </div>
            ))}
        </div>
      )}

      <div className={styles.scoreTable}>
        <h3 style={{ marginBottom: '10px' }}>Classifica:</h3>
        {scores.map((s, i) => {
          const medal = i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : '';
          return (
            <div key={s.name} className={styles.scoreRow}>
              <span>{medal}{s.name}</span>
              <span className={styles.pts}>{s.score} pt</span>
            </div>
          );
        })}
      </div>

      {isHost && (
        <>
          {round < totalRounds ? (
            <Button variant="gold" onClick={startRound}>
              Prossimo Round
            </Button>
          ) : (
            <p className="info-text" style={{ color: 'var(--gold)', fontSize: '1.2em', fontWeight: '700' }}>
              🎉 Partita Terminata! 🎉
            </p>
          )}

          <Button variant="blue" size="small" onClick={backToLobby}>
            Torna alla Lobby
          </Button>
        </>
      )}

      {!isHost && (
        <p className="info-text">
          In attesa dell'host...
        </p>
      )}
    </div>
  );
}
