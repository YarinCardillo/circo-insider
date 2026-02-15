import { useState } from 'react';
import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/Button/Button';
import { Timer } from '../../components/Timer/Timer';
import styles from './VotingScreen.module.css';

export function VotingScreen() {
  const { phaseData, voteStatus, isHost, myId, vote, forceResults } = useSocketContext();
  const [selectedVote, setSelectedVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  if (!phaseData) return null;

  const { duration, candidates } = phaseData;

  const handleSelectVote = (candidateId) => {
    if (hasVoted || candidateId === myId) return;
    setSelectedVote(candidateId);
  };

  const handleConfirmVote = () => {
    if (!selectedVote || hasVoted) return;
    vote(selectedVote);
    setHasVoted(true);
  };

  return (
    <div className={styles.screen}>
      <h2>Votazione</h2>

      <p className="info-text">Chi è l'Infiltrato?</p>

      <Timer initialSeconds={duration || 60} onEnd={forceResults} label="Tempo rimanente" />

      <div className={styles.voteGrid}>
        {candidates && candidates.map((candidate) => {
          const isMe = candidate.id === myId;
          const isSelected = selectedVote === candidate.id;

          return (
            <div
              key={candidate.id}
              className={`${styles.voteOption} ${isSelected ? styles.selected : ''} ${hasVoted ? styles.voted : ''}`}
              onClick={() => handleSelectVote(candidate.id)}
            >
              {candidate.name}
              {isMe && <span style={{ fontSize: '0.7em', display: 'block' }}>(Tu)</span>}
            </div>
          );
        })}
      </div>

      <div className="vote-status" style={{ margin: '10px 0' }}>
        Voti: {voteStatus.current}/{voteStatus.total}
      </div>

      {selectedVote && !hasVoted && (
        <Button variant="red" onClick={handleConfirmVote}>
          Conferma Voto
        </Button>
      )}

      {hasVoted && (
        <p className="info-text" style={{ color: 'var(--green)' }}>
          ✓ Voto registrato!
        </p>
      )}

      {isHost && (
        <Button variant="purple" size="small" onClick={forceResults}>
          Forza Risultati
        </Button>
      )}
    </div>
  );
}
