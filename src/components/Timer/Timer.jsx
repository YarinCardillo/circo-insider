import { useTimer } from '../../hooks/useTimer';
import styles from './Timer.module.css';

export function Timer({ initialSeconds, onEnd, label = '' }) {
  const { formattedTime, isUrgent } = useTimer(initialSeconds, onEnd);

  return (
    <div className={styles.timerContainer}>
      <div className={`${styles.timerDisplay} ${isUrgent ? styles.urgent : ''}`}>
        {formattedTime}
      </div>
      {label && <div className={styles.timerLabel}>{label}</div>}
    </div>
  );
}
