import styles from './PlayerList.module.css';

export function PlayerList({ players, myId }) {
  return (
    <ul className={styles.playerList}>
      {players.map((player) => (
        <li key={player.id}>
          <span>{player.name}</span>
          <span>
            {player.isHost && (
              <span className={styles.hostBadge}>HOST</span>
            )}
            {player.score > 0 && (
              <span className={styles.scoreBadge}>{player.score} pt</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
