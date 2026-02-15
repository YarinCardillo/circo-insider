import { useState } from 'react';
import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const { createRoom, joinRoom, showToast, isConnected } = useSocketContext();
  const [playerName, setPlayerName] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    const trimmed = playerName.trim();
    if (!trimmed) {
      showToast('Inserisci un nome!');
      return;
    }
    if (trimmed.length > 16) {
      showToast('Nome troppo lungo (max 16 caratteri)!');
      return;
    }
    createRoom(trimmed);
  };

  const handleJoinRoom = () => {
    const trimmedName = playerName.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedName) {
      showToast('Inserisci un nome!');
      return;
    }
    if (trimmedCode.length !== 4) {
      showToast('Codice stanza non valido!');
      return;
    }

    joinRoom(trimmedCode, trimmedName);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showJoin && roomCode) {
        handleJoinRoom();
      } else if (!showJoin) {
        handleCreateRoom();
      }
    }
  };

  return (
    <div className={styles.screen}>
      <h1>CIRCO<br />INSIDER</h1>
      <p className="subtitle">Trova l'Infiltrato tra gli Artisti</p>

      <div className="spacer" />

      <Input
        placeholder="Il tuo nome"
        maxLength={16}
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        onKeyPress={handleKeyPress}
      />

      <div className="spacer" />

      <Button
        variant="gold"
        onClick={handleCreateRoom}
        disabled={!isConnected}
      >
        Crea Stanza
      </Button>

      <Button
        variant="red"
        onClick={() => setShowJoin(!showJoin)}
      >
        {showJoin ? 'Nascondi' : 'Entra in Stanza'}
      </Button>

      {showJoin && (
        <div className={styles.joinSection}>
          <Input
            placeholder="Codice stanza (4 lettere)"
            maxLength={4}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
          />
          <Button
            variant="gold"
            size="small"
            onClick={handleJoinRoom}
            disabled={!isConnected}
          >
            Entra
          </Button>
        </div>
      )}

      {!isConnected && (
        <p className={styles.connecting}>Connessione in corso...</p>
      )}
    </div>
  );
}
