import { useEffect } from 'react';
import { useSocketContext } from '../../contexts/SocketContext';
import styles from './RoleRevealScreen.module.css';

export function RoleRevealScreen() {
  const { roleData, round, totalRounds, setCurrentScreen } = useSocketContext();

  useEffect(() => {
    // Auto-transition to guessing after 10 seconds
    const timer = setTimeout(() => {
      setCurrentScreen('guessing');
    }, 10000);

    return () => clearTimeout(timer);
  }, [setCurrentScreen]);

  if (!roleData) return null;

  const { role, word } = roleData;

  const getRoleIcon = () => {
    if (role === 'presentatore') return '🎤';
    if (role === 'infiltrato') return '🎭';
    return '🎨';
  };

  const getRoleName = () => {
    if (role === 'presentatore') return 'Presentatore';
    if (role === 'infiltrato') return 'Infiltrato';
    return 'Artista';
  };

  const getRoleDescription = () => {
    if (role === 'presentatore') {
      return 'Rispondi SI/NO alle domande. Non rivelare la parola!';
    }
    if (role === 'infiltrato') {
      return 'Conosci la parola. Depista e sabota senza farti scoprire!';
    }
    return 'Fai domande per indovinare la parola. Trova l\'Infiltrato!';
  };

  const showWord = role === 'presentatore' || role === 'infiltrato';

  return (
    <div className={styles.screen}>
      <h3>Round {round}/{totalRounds}</h3>

      <div className={`${styles.roleCard} ${styles[role]}`}>
        <div className={styles.roleIcon}>{getRoleIcon()}</div>
        <div className={`${styles.roleName} ${styles[role]}`}>
          {getRoleName()}
        </div>
        {showWord && (
          <div className={styles.wordReveal}>{word}</div>
        )}
        <div className={styles.roleDesc}>{getRoleDescription()}</div>
      </div>

      <p className="info-text" style={{ marginTop: '20px' }}>
        La partita inizia tra poco...
      </p>
    </div>
  );
}
