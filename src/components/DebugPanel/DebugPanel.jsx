import { useState } from 'react';
import { useSocketContext } from '../../contexts/SocketContext';
import styles from './DebugPanel.module.css';

export function DebugPanel() {
  const { debugLogs, isConnected, myId } = useSocketContext();
  const [isOpen, setIsOpen] = useState(false);

  const statusColor = isConnected ? '#0f0' : '#f00';
  const statusText = isConnected
    ? `🟢 Connected${myId ? ': ' + myId.substring(0, 8) : ''}`
    : '🔴 Disconnected';

  return (
    <>
      <button
        className={styles.debugOpenBtn}
        onClick={() => setIsOpen(true)}
      >
        DEBUG
      </button>

      {isOpen && (
        <div className={styles.debugPanel}>
          <div className={styles.debugHeader}>
            <span style={{ color: statusColor }}>{statusText}</span>
            <button
              className={styles.debugCloseBtn}
              onClick={() => setIsOpen(false)}
            >
              CHIUDI
            </button>
          </div>
          <pre className={styles.debugLogs}>
            {debugLogs.length === 0 ? 'Nessun log...' : debugLogs.map((log, i) => (
              <div key={i}>
                [{log.time}] {log.msg}
              </div>
            ))}
          </pre>
        </div>
      )}
    </>
  );
}
