import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/Button/Button';
import { RoomCode } from '../../components/RoomCode/RoomCode';
import { PlayerList } from '../../components/PlayerList/PlayerList';
import styles from './LobbyScreen.module.css';

export function LobbyScreen() {
  const { roomCode, players, isHost, round, totalRounds, startRound, resetGame, leaveRoom, myId } = useSocketContext();

  const canStart = players.length >= 4;

  return (
    <div className={styles.screen}>
      <h2>Lobby</h2>

      <RoomCode code={roomCode} />

      <p className="info-text">
        Condividi il codice per far entrare altri giocatori
      </p>

      <div className="spacer" />

      <PlayerList players={players} myId={myId} />

      <div className="spacer" />

      {round > 0 && (
        <p className={styles.roundInfo}>
          Round {round}/{totalRounds}
        </p>
      )}

      {isHost ? (
        <>
          <Button
            variant="gold"
            onClick={startRound}
            disabled={!canStart}
          >
            {round === 0 ? 'Inizia Partita' : 'Prossimo Round'}
          </Button>

          {!canStart && (
            <p className="info-text" style={{ color: '#EF4444' }}>
              Servono almeno 4 giocatori
            </p>
          )}

          {round > 0 && (
            <Button variant="purple" size="small" onClick={resetGame}>
              Reset Punteggi
            </Button>
          )}

          <Button variant="red" size="small" onClick={leaveRoom}>
            Esci dalla Stanza
          </Button>
        </>
      ) : (
        <>
          <p className="info-text">
            In attesa che l'host avvii la partita...
          </p>

          <Button variant="red" size="small" onClick={leaveRoom}>
            Esci dalla Stanza
          </Button>
        </>
      )}
    </div>
  );
}
