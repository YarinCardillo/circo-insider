import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { socket, isConnected, myId } = useSocket();
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [players, setPlayers] = useState([]);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [toast, setToast] = useState({ message: '', show: false });
  const [debugLogs, setDebugLogs] = useState([]);
  const [roleData, setRoleData] = useState(null);
  const [phaseData, setPhaseData] = useState(null);
  const [voteStatus, setVoteStatus] = useState({ current: 0, total: 0 });
  const [resultsData, setResultsData] = useState(null);

  // Helper to show toast
  const showToast = (message) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  // Helper for debug logging
  const debugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-9), { time: timestamp, msg: message }]);
    console.log(`[DEBUG] ${message}`);
  };

  // Socket event listeners - ALL 17 EVENTS
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      debugLog('[OK] Connected ID: ' + socket.id.substring(0, 8));
    });

    socket.on('connect_error', (error) => {
      debugLog('[ERROR] Connection failed: ' + error.message);
      showToast('Errore di connessione al server!');
    });

    socket.on('disconnect', () => {
      debugLog('[WARN] Disconnected');
      showToast('Connessione persa. Riconnessione...');
    });

    socket.on('reconnect', () => {
      debugLog('[OK] Reconnected');
      showToast('Riconnesso al server!');
    });

    // Room events
    socket.on('room_created', ({ code, players: playerList }) => {
      debugLog('[RECV] room_created: ' + code);
      setRoomCode(code);
      setIsHost(true);
      setPlayers(playerList);
      setCurrentScreen('lobby');
    });

    socket.on('room_joined', ({ code, players: playerList, isHost: host }) => {
      debugLog('[RECV] room_joined: ' + code);
      setRoomCode(code);
      setIsHost(host);
      setPlayers(playerList);
      setCurrentScreen('lobby');
    });

    socket.on('player_list', (playerList) => {
      setPlayers(playerList);
    });

    socket.on('new_host', (hostId) => {
      setIsHost(hostId === myId);
      showToast(hostId === myId ? 'Sei il nuovo host!' : 'Nuovo host assegnato');
    });

    socket.on('error_msg', (message) => {
      debugLog('[ERROR] ' + message);
      showToast(message);
    });

    // Game flow events
    socket.on('role_assigned', ({ role, word, round: r, totalRounds: total }) => {
      setRoleData({ role, word });
      setRound(r);
      setTotalRounds(total);
      setCurrentScreen('reveal');
    });

    socket.on('phase_change', ({ phase, duration, word, candidates }) => {
      setPhaseData({ phase, duration, word, candidates });
      setCurrentScreen(phase); // 'guessing', 'discussion', or 'voting'
    });

    socket.on('vote_count', ({ current, total }) => {
      setVoteStatus({ current, total });
    });

    socket.on('round_results', (data) => {
      setResultsData(data);
      setCurrentScreen('results');
    });

    socket.on('back_to_lobby', ({ players: playerList, round: r, totalRounds: total }) => {
      setPlayers(playerList);
      setRound(r);
      setTotalRounds(total);
      setCurrentScreen('lobby');
    });

    socket.on('game_reset', ({ players: playerList }) => {
      setPlayers(playerList);
      setRound(0);
      setCurrentScreen('lobby');
      showToast('Punteggi resettati!');
    });

    // Cleanup all listeners on unmount
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('reconnect');
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('player_list');
      socket.off('new_host');
      socket.off('error_msg');
      socket.off('role_assigned');
      socket.off('phase_change');
      socket.off('vote_count');
      socket.off('round_results');
      socket.off('back_to_lobby');
      socket.off('game_reset');
    };
  }, [socket, myId]);

  // Actions (emit helpers)
  const createRoom = (name) => {
    if (!socket?.connected) {
      showToast('Connessione in corso... Riprova tra un attimo.');
      return;
    }
    debugLog('[SEND] create_room: ' + name);
    socket.emit('create_room', name);
  };

  const joinRoom = (code, name) => {
    if (!socket?.connected) {
      showToast('Connessione in corso... Riprova tra un attimo.');
      return;
    }
    debugLog('[SEND] join_room: ' + code);
    socket.emit('join_room', { code, name });
  };

  const leaveRoom = () => {
    if (socket?.connected) {
      debugLog('[SEND] leave_room');
      socket.emit('leave_room');
      setCurrentScreen('home');
      setRoomCode(null);
      setIsHost(false);
      setPlayers([]);
    }
  };

  const startRound = () => {
    if (socket?.connected) {
      debugLog('[SEND] start_round');
      socket.emit('start_round');
    }
  };

  const wordGuessed = () => {
    if (socket?.connected) {
      debugLog('[SEND] word_guessed');
      socket.emit('word_guessed');
    }
  };

  const timeUp = () => {
    if (socket?.connected) {
      debugLog('[SEND] time_up');
      socket.emit('time_up');
    }
  };

  const vote = (targetId) => {
    if (socket?.connected) {
      debugLog('[SEND] vote: ' + targetId);
      socket.emit('vote', { targetId });
    }
  };

  const forceResults = () => {
    if (socket?.connected) {
      debugLog('[SEND] force_results');
      socket.emit('force_results');
    }
  };

  const forceVoting = () => {
    if (socket?.connected) {
      debugLog('[SEND] force_voting');
      socket.emit('force_voting');
    }
  };

  const backToLobby = () => {
    if (socket?.connected) {
      debugLog('[SEND] back_to_lobby');
      socket.emit('back_to_lobby');
    }
  };

  const resetGame = () => {
    if (socket?.connected) {
      debugLog('[SEND] reset_game');
      socket.emit('reset_game');
    }
  };

  const value = {
    socket,
    isConnected,
    myId,
    roomCode,
    isHost,
    currentScreen,
    setCurrentScreen,
    players,
    round,
    totalRounds,
    toast,
    showToast,
    debugLogs,
    debugLog,
    roleData,
    phaseData,
    voteStatus,
    resultsData,
    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    startRound,
    wordGuessed,
    timeUp,
    vote,
    forceResults,
    forceVoting,
    backToLobby,
    resetGame
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}
