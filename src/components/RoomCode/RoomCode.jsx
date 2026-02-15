import styles from './RoomCode.module.css';

export function RoomCode({ code }) {
  return (
    <div className={styles.roomCode}>
      {code}
    </div>
  );
}
