const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const path = require('path');

const app = express();

// HTTPS if certs exist, otherwise HTTP
const DOMAIN = process.env.DOMAIN || 'localhost';
const certPath = `/etc/letsencrypt/live/${DOMAIN}`;
let server;

if (fs.existsSync(`${certPath}/fullchain.pem`)) {
  const sslOptions = {
    key: fs.readFileSync(`${certPath}/privkey.pem`),
    cert: fs.readFileSync(`${certPath}/fullchain.pem`)
  };
  server = https.createServer(sslOptions, app);
  // Redirect HTTP -> HTTPS
  const httpRedirect = express();
  httpRedirect.all('*', (req, res) => res.redirect(`https://${DOMAIN}${req.url}`));
  http.createServer(httpRedirect).listen(80, () => console.log('HTTP->HTTPS redirect on :80'));
  console.log('HTTPS enabled');
} else {
  server = http.createServer(app);
  console.log('No certs found, running HTTP only');
}

const io = new Server(server, {
  cors: {
    origin: "*",  // Allow all origins (party game, local network)
    methods: ["GET", "POST"]
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

app.use(express.static(path.join(__dirname, 'public')));

// ---- WORD LIST ----
const WORDS = [
  // Oggetti comuni
  'Pizza', 'Gelato', 'Ombrello', 'Chitarra', 'Bicicletta', 'Semaforo', 'Frigorifero',
  'Cuscino', 'Cavatappi', 'Portafoglio', 'Ciabatte', 'Lavatrice', 'Aspirapolvere',
  'Telecomando', 'Fiammifero', 'Spaghetti', 'Cappuccino', 'Tiramisu', 'Cornetto',
  'Motorino', 'Gondola', 'Vespa', 'Ferrari', 'Colosseo', 'Fontana',
  // Animali
  'Fenicottero', 'Pinguino', 'Coccodrillo', 'Camaleonte', 'Pipistrello', 'Delfino',
  'Polpo', 'Giraffa', 'Bradipo', 'Pavone', 'Rinoceronte', 'Medusa',
  // Concetti / Astratti
  'Deja vu', 'Karma', 'Nostalgia', 'Adrenalina', 'Panico', 'Vergogna',
  'Insonnia', 'Hangover', 'Superstizione', 'Gelosia',
  // Personaggi / Cultura pop
  'Batman', 'Mario Bros', 'Pinocchio', 'Shrek', 'Gollum', 'Darth Vader',
  'Harry Potter', 'Spider-Man', 'Indiana Jones', 'James Bond',
  // Luoghi
  'Ikea', 'Discoteca', 'Pronto Soccorso', 'Autogrill', 'Luna Park',
  'Metropolitana', 'Cimitero', 'Spiaggia', 'Aeroporto', 'Prigione',
  // Cibo
  'Nutella', 'Parmigiano', 'Mozzarella', 'Bruschetta', 'Focaccia',
  'Arancino', 'Panettone', 'Pesto', 'Carbonara', 'Lasagna',
  // Professioni / Ruoli
  'Vigile del fuoco', 'Astronauta', 'Arbitro', 'Parrucchiere', 'Dentista',
  'DJ', 'Bagnino', 'Tassista', 'Cameriere', 'Influencer',
  // Azioni / Situazioni
  'Karaoke', 'Autostop', 'Sonnambulismo', 'Singhiozzo', 'Russare',
  'Selfie', 'Tatuaggio', 'Piercing', 'Sbornia', 'Multa',
  // Circo / Spettacolo
  'Trapezio', 'Giocoleria', 'Palla di cannone', 'Filo del funambolo',
  'Tendone', 'Gabbia dei leoni', 'Carro dei clown', 'Trampolino',
  'Contorsionista', 'Mangiafuoco', 'Uomo forzuto',
  // Varie divertenti
  'Bermuda', 'Bigfoot', 'UFO', 'Loch Ness', 'Area 51',
  'Kamasutra', 'Tinder', 'Hangover', 'Friendzone', 'Catfish',
  'ASMR', 'Meme', 'TikTok', 'Ghosting', 'Red flag', 'Mary Cavallo',
  // Roba italiana
  'Sanremo', 'Grande Fratello', 'Fantacalcio', 'Aperitivo',
  'Spritz', 'Amaro', 'Grappa', 'Limoncello', 'Prosecco',
  'Motorino truccato', 'Fiat Panda', 'Ape Piaggio'
];

// ---- GAME STATE ----
const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms[code]);
  return code;
}

function getRandomWord(usedWords) {
  const available = WORDS.filter(w => !usedWords.includes(w));
  if (available.length === 0) return WORDS[Math.floor(Math.random() * WORDS.length)];
  return available[Math.floor(Math.random() * available.length)];
}

function assignRoles(room) {
  const playerIds = Object.keys(room.players);
  const count = playerIds.length;

  // Shuffle
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

  // 1 Presentatore, then Infiltrati based on count
  const numInfiltrati = count >= 10 ? 2 : 1;

  room.currentRound.presentatore = shuffled[0];
  room.currentRound.infiltrati = shuffled.slice(1, 1 + numInfiltrati);
  room.currentRound.artisti = shuffled.slice(1 + numInfiltrati);

  // Assign to players
  room.players[shuffled[0]].role = 'presentatore';
  for (const id of room.currentRound.infiltrati) {
    room.players[id].role = 'infiltrato';
  }
  for (const id of room.currentRound.artisti) {
    room.players[id].role = 'artista';
  }

  // Pick word
  room.currentRound.word = getRandomWord(room.usedWords);
  room.usedWords.push(room.currentRound.word);
}

// ---- SOCKET HANDLING ----
io.on('connection', (socket) => {
  let currentRoom = null;
  let playerId = null;

  socket.on('create_room', (name) => {
    try {
      // Validate input
      if (!name || typeof name !== 'string') {
        return socket.emit('error_msg', 'Nome non valido!');
      }

      const trimmedName = name.trim();
      if (trimmedName.length === 0 || trimmedName.length > 16) {
        return socket.emit('error_msg', 'Nome deve essere 1-16 caratteri!');
      }

      const code = generateRoomCode();
      playerId = socket.id;

      rooms[code] = {
        host: playerId,
        players: {
          [playerId]: { name: trimmedName, score: 0, role: null }
        },
        state: 'lobby', // lobby, reveal, guessing, discussion, voting, results
        round: 0,
        totalRounds: 5,
        usedWords: [],
        currentRound: {
          word: null,
          presentatore: null,
          infiltrati: [],
          artisti: [],
          votes: {},
          wordGuessed: false
        },
        settings: {
          guessTime: 300, // 5 min
          discussTime: 90  // 1.5 min
        }
      };

      currentRoom = code;
      socket.join(code);
      socket.emit('room_created', { code, players: getPlayerList(code) });

      console.log(`[OK] Room ${code} created by ${trimmedName}`);
    } catch (error) {
      console.error('[ERROR] Error creating room:', error);
      socket.emit('error_msg', 'Errore nella creazione della stanza!');
    }
  });

  socket.on('join_room', ({ code, name }) => {
    try {
      // Validate code
      if (!code || typeof code !== 'string' || code.length !== 4) {
        return socket.emit('error_msg', 'Codice stanza non valido!');
      }

      // Validate name
      if (!name || typeof name !== 'string') {
        return socket.emit('error_msg', 'Nome non valido!');
      }

      const trimmedName = name.trim();
      if (trimmedName.length === 0 || trimmedName.length > 16) {
        return socket.emit('error_msg', 'Nome deve essere 1-16 caratteri!');
      }

      const upperCode = code.toUpperCase();
      const room = rooms[upperCode];

      if (!room) {
        return socket.emit('error_msg', 'Stanza non trovata!');
      }

      if (room.state !== 'lobby') {
        return socket.emit('error_msg', 'Partita già iniziata!');
      }

      playerId = socket.id;
      room.players[playerId] = { name: trimmedName, score: 0, role: null };
      currentRoom = upperCode;
      socket.join(upperCode);
      socket.emit('room_joined', { code: upperCode, players: getPlayerList(upperCode), isHost: false });
      io.to(upperCode).emit('player_list', getPlayerList(upperCode));

      console.log(`[OK] ${trimmedName} joined room ${upperCode}`);
    } catch (error) {
      console.error('[ERROR] Error joining room:', error);
      socket.emit('error_msg', 'Errore nell\'entrare nella stanza!');
    }
  });

  socket.on('start_round', () => {
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host) return;

    const playerCount = Object.keys(room.players).length;
    if (playerCount < 4) return socket.emit('error_msg', 'Servono almeno 4 giocatori!');

    room.round++;
    room.state = 'reveal';
    room.currentRound = {
      word: null,
      presentatore: null,
      infiltrati: [],
      artisti: [],
      votes: {},
      wordGuessed: false
    };

    // Reset roles
    for (const id of Object.keys(room.players)) {
      room.players[id].role = null;
    }

    assignRoles(room);

    // Send role to each player
    for (const [id, player] of Object.entries(room.players)) {
      const sock = io.sockets.sockets.get(id);
      if (sock) {
        const showWord = (player.role === 'presentatore' || player.role === 'infiltrato');
        sock.emit('role_assigned', {
          role: player.role,
          word: showWord ? room.currentRound.word : null,
          round: room.round,
          totalRounds: room.totalRounds
        });
      }
    }

    // After 10 seconds reveal, start guessing phase
    setTimeout(() => {
      if (rooms[currentRoom] && rooms[currentRoom].state === 'reveal') {
        rooms[currentRoom].state = 'guessing';
        io.to(currentRoom).emit('phase_change', {
          phase: 'guessing',
          duration: room.settings.guessTime
        });
      }
    }, 10000);
  });

  socket.on('word_guessed', () => {
    // Host signals the word was guessed
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host || room.state !== 'guessing') return;

    room.currentRound.wordGuessed = true;
    room.state = 'discussion';
    io.to(currentRoom).emit('phase_change', {
      phase: 'discussion',
      duration: room.settings.discussTime,
      word: room.currentRound.word
    });

    // After discussion, go to voting
    setTimeout(() => {
      if (rooms[currentRoom] && rooms[currentRoom].state === 'discussion') {
        rooms[currentRoom].state = 'voting';
        const votableList = Object.entries(room.players)
          .filter(([id]) => id !== room.currentRound.presentatore)
          .map(([id, p]) => ({ id, name: p.name }));
        io.to(currentRoom).emit('phase_change', {
          phase: 'voting',
          candidates: votableList,
          duration: 60
        });
      }
    }, room.settings.discussTime * 1000);
  });

  socket.on('time_up', () => {
    // Host signals time ran out without guessing
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host || room.state !== 'guessing') return;

    room.currentRound.wordGuessed = false;
    room.state = 'results';

    // Infiltrati win automatically
    for (const id of room.currentRound.infiltrati) {
      if (room.players[id]) room.players[id].score += 3;
    }

    io.to(currentRoom).emit('round_results', buildResults(room, false));
  });

  socket.on('vote', ({ targetId }) => {
    const room = rooms[currentRoom];
    if (!room || room.state !== 'voting') return;

    // Can't vote for yourself, can't vote for presentatore
    if (targetId === socket.id || targetId === room.currentRound.presentatore) return;

    room.currentRound.votes[socket.id] = targetId;

    // Check if all non-presentatore have voted
    const eligibleVoters = Object.keys(room.players).length;
    const voteCount = Object.keys(room.currentRound.votes).length;

    io.to(currentRoom).emit('vote_count', { current: voteCount, total: eligibleVoters });

    if (voteCount >= eligibleVoters) {
      resolveVotes(room);
    }
  });

  socket.on('force_results', () => {
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host || room.state !== 'voting') return;
    resolveVotes(room);
  });

  socket.on('force_voting', () => {
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host || room.state !== 'discussion') return;

    // Transition to voting immediately
    room.state = 'voting';
    const votableList = Object.entries(room.players)
      .filter(([id]) => id !== room.currentRound.presentatore)
      .map(([id, p]) => ({ id, name: p.name }));
    io.to(currentRoom).emit('phase_change', {
      phase: 'voting',
      candidates: votableList,
      duration: 60
    });
  });

  socket.on('back_to_lobby', () => {
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host) return;

    room.state = 'lobby';
    // Reset roles
    for (const id of Object.keys(room.players)) {
      room.players[id].role = null;
    }
    io.to(currentRoom).emit('back_to_lobby', {
      players: getPlayerList(currentRoom),
      round: room.round,
      totalRounds: room.totalRounds
    });
  });

  socket.on('reset_game', () => {
    const room = rooms[currentRoom];
    if (!room || socket.id !== room.host) return;

    room.round = 0;
    room.usedWords = [];
    room.state = 'lobby';
    for (const id of Object.keys(room.players)) {
      room.players[id].score = 0;
      room.players[id].role = null;
    }
    io.to(currentRoom).emit('game_reset', { players: getPlayerList(currentRoom) });
  });

  socket.on('leave_room', () => {
    if (!currentRoom || !rooms[currentRoom]) return;

    const room = rooms[currentRoom];
    const wasHost = (socket.id === room.host);

    // Remove player
    delete room.players[playerId];

    // If room is empty, delete it
    if (Object.keys(room.players).length === 0) {
      delete rooms[currentRoom];
      console.log(`[OK] Room ${currentRoom} deleted (empty)`);
    } else {
      // If player was host, assign new host
      if (wasHost) {
        room.host = Object.keys(room.players)[0];
        io.to(currentRoom).emit('new_host', room.host);
      }
      // Update player list for remaining players
      io.to(currentRoom).emit('player_list', getPlayerList(currentRoom));
    }

    socket.leave(currentRoom);
    currentRoom = null;
    playerId = null;
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];
      delete room.players[playerId];

      if (Object.keys(room.players).length === 0) {
        delete rooms[currentRoom];
      } else {
        if (room.host === playerId) {
          room.host = Object.keys(room.players)[0];
          io.to(currentRoom).emit('new_host', room.host);
        }
        io.to(currentRoom).emit('player_list', getPlayerList(currentRoom));
      }
    }
  });
});

function resolveVotes(room) {
  room.state = 'results';
  const votes = room.currentRound.votes;

  // Tally
  const tally = {};
  for (const targetId of Object.values(votes)) {
    tally[targetId] = (tally[targetId] || 0) + 1;
  }

  // Find most voted
  let maxVotes = 0;
  let mostVoted = null;
  for (const [id, count] of Object.entries(tally)) {
    if (count > maxVotes) {
      maxVotes = count;
      mostVoted = id;
    }
  }

  const infiltratiIds = room.currentRound.infiltrati;
  const caughtInfiltrato = infiltratiIds.includes(mostVoted);

  // Scoring
  if (caughtInfiltrato) {
    // Presentatore +2, correct voters +1
    if (room.players[room.currentRound.presentatore]) {
      room.players[room.currentRound.presentatore].score += 2;
    }
    for (const [voterId, targetId] of Object.entries(votes)) {
      if (infiltratiIds.includes(targetId) && room.players[voterId]) {
        room.players[voterId].score += 1;
      }
    }
  } else {
    // Infiltrati survive -> +3 each
    for (const id of infiltratiIds) {
      if (room.players[id]) room.players[id].score += 3;
    }
  }

  const code = Object.keys(rooms).find(c => rooms[c] === room);
  if (code) {
    io.to(code).emit('round_results', buildResults(room, true));
  }
}

function buildResults(room, wordWasGuessed) {
  const infiltratiNames = room.currentRound.infiltrati
    .map(id => room.players[id]?.name || '???');
  const presentatoreName = room.players[room.currentRound.presentatore]?.name || '???';

  // Vote tally for display
  const tally = {};
  for (const targetId of Object.values(room.currentRound.votes)) {
    const name = room.players[targetId]?.name || '???';
    tally[name] = (tally[name] || 0) + 1;
  }

  // Most voted
  let maxVotes = 0;
  let mostVotedId = null;
  const tallyById = {};
  for (const targetId of Object.values(room.currentRound.votes)) {
    tallyById[targetId] = (tallyById[targetId] || 0) + 1;
  }
  for (const [id, count] of Object.entries(tallyById)) {
    if (count > maxVotes) {
      maxVotes = count;
      mostVotedId = id;
    }
  }

  const caught = room.currentRound.infiltrati.includes(mostVotedId);

  return {
    word: room.currentRound.word,
    wordGuessed: wordWasGuessed,
    presentatore: presentatoreName,
    infiltrati: infiltratiNames,
    infiltratiCaught: wordWasGuessed ? caught : false,
    mostVoted: mostVotedId ? (room.players[mostVotedId]?.name || '???') : null,
    voteTally: tally,
    scores: Object.entries(room.players)
      .map(([id, p]) => ({ name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score),
    round: room.round,
    totalRounds: room.totalRounds
  };
}

function getPlayerList(code) {
  const room = rooms[code];
  if (!room) return [];
  return Object.entries(room.players).map(([id, p]) => ({
    id,
    name: p.name,
    score: p.score,
    isHost: id === room.host
  }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Circo Insider running on port ${PORT}`));
