const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const chapterRoutes = require('./routes/chapters');
const videoRoutes = require('./routes/videos');
const battlegroundsRoutes = require('./routes/battlegrounds');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api', videoRoutes);
app.use('/api', battlegroundsRoutes);
app.get('/', (req, res) => {
  res.send('Gamified Learning Platform API');
});

// Game room management
const gameRooms = new Map();
const waitingPlayers = new Map(); // subject-difficulty-class -> [players]

// Socket.IO authentication middleware
io.use((socket, next) => {
  const sessionId = socket.handshake.headers.cookie?.split(';')
    .find(c => c.trim().startsWith('connect.sid='))
    ?.split('=')[1];

  if (!sessionId) {
    console.log('❌ No session found for socket connection');
    return next(new Error('Authentication error'));
  }

  // For now, we'll allow connections but log the session
  console.log('🔐 Socket authenticated with session:', sessionId.substring(0, 10) + '...');
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join battlegrounds lobby
  socket.on('join-lobby', (data) => {
    console.log('🎯 Player joining lobby:', data);
    const { userId, username, subject, difficulty, classLevel, mode } = data;
    socket.userData = { userId, username, subject, difficulty, classLevel, mode };
    
    const roomKey = `${subject}-${difficulty}-${classLevel}-${mode}`;
    console.log('🏷️ Room key:', roomKey);
    
    if (!waitingPlayers.has(roomKey)) {
      waitingPlayers.set(roomKey, []);
    }
    
    const players = waitingPlayers.get(roomKey);
    
    // Check if user is already in this room
    const existingPlayer = players.find(p => p.userData.userId === userId);
    if (existingPlayer) {
      console.log(`⚠️ User ${username} already in room ${roomKey}, ignoring duplicate join`);
      socket.emit('already-in-room', { roomKey });
      return;
    }
    
    players.push({ socketId: socket.id, userData: socket.userData });
    
    socket.join(roomKey);
    console.log(`${username} joined lobby for ${roomKey}. Total players in room: ${players.length}`);
    
    // Check if we have enough players to start a game
    if (players.length >= 2) {
      console.log('🎮 Starting game - enough players found!');
      const gamePlayers = players.splice(0, 2); // Take first 2 players
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create game room
      gameRooms.set(gameId, {
        id: gameId,
        players: gamePlayers,
        subject,
        difficulty,
        classLevel,
        mode,
        status: 'starting',
        currentQuestion: 0,
        scores: { [gamePlayers[0].socketId]: 0, [gamePlayers[1].socketId]: 0 },
        answers: { [gamePlayers[0].socketId]: [], [gamePlayers[1].socketId]: [] }
      });      // Notify players that game is starting
      gamePlayers.forEach(player => {
        console.log('📤 Sending game-start to:', player.userData.username);
        io.to(player.socketId).emit('game-start', {
          gameId,
          opponent: gamePlayers.find(p => p.socketId !== player.socketId).userData,
          subject,
          difficulty,
          classLevel,
          mode
        });
      });
      
      console.log(`✅ Game ${gameId} started with players: ${gamePlayers.map(p => p.userData.username).join(' vs ')}`);
    } else {
      // Tell player they're waiting
      console.log('⏳ Not enough players, sending waiting message');
      socket.emit('waiting-for-opponent', { position: players.length });
    }
  });

  // Handle player answer
  socket.on('submit-answer', (data) => {
    const { gameId, questionIndex, answerIndex, timeLeft } = data;
    const game = gameRooms.get(gameId);
    
    if (!game) return;
    
    // Record answer
    if (!game.answers[socket.id]) game.answers[socket.id] = [];
    game.answers[socket.id][questionIndex] = { answerIndex, timeLeft };
    
    // Calculate points (faster answers get more points)
    const basePoints = 10;
    const timeBonus = Math.floor(timeLeft / 3); // Bonus points for speed
    const points = basePoints + timeBonus;
    
    game.scores[socket.id] += points;
    
    // Check if both players have answered
    const player1Answered = game.answers[game.players[0].socketId][questionIndex] !== undefined;
    const player2Answered = game.answers[game.players[1].socketId][questionIndex] !== undefined;
    
    if (player1Answered && player2Answered) {
      // Both players answered, send results
      const results = {
        questionIndex,
        player1: {
          username: game.players[0].userData.username,
          answer: game.answers[game.players[0].socketId][questionIndex].answerIndex,
          timeLeft: game.answers[game.players[0].socketId][questionIndex].timeLeft,
          points: game.scores[game.players[0].socketId]
        },
        player2: {
          username: game.players[1].userData.username,
          answer: game.answers[game.players[1].socketId][questionIndex].answerIndex,
          timeLeft: game.answers[game.players[1].socketId][questionIndex].timeLeft,
          points: game.scores[game.players[1].socketId]
        }
      };
      
      // Send results to both players
      game.players.forEach(player => {
        io.to(player.socketId).emit('round-results', results);
      });
    }
  });

  // Handle game completion
  socket.on('game-complete', (data) => {
    const { gameId } = data;
    const game = gameRooms.get(gameId);
    
    if (game) {
      game.status = 'completed';
      
      const finalScores = {
        player1: {
          username: game.players[0].userData.username,
          score: game.scores[game.players[0].socketId]
        },
        player2: {
          username: game.players[1].userData.username,
          score: game.scores[game.players[1].socketId]
        },
        winner: game.scores[game.players[0].socketId] > game.scores[game.players[1].socketId] 
          ? game.players[0].userData.username 
          : game.scores[game.players[0].socketId] < game.scores[game.players[1].socketId]
          ? game.players[1].userData.username
          : 'tie'
      };
      
      // Send final results to both players
      game.players.forEach(player => {
        io.to(player.socketId).emit('game-final-results', finalScores);
      });
      
      // Clean up game room after a delay
      setTimeout(() => {
        gameRooms.delete(gameId);
      }, 5000);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from waiting players
    waitingPlayers.forEach((players, roomKey) => {
      const index = players.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        console.log(`Removed ${socket.userData?.username} from waiting list`);
      }
    });
    
    // Handle game room cleanup
    gameRooms.forEach((game, gameId) => {
      const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        game.status = 'abandoned';
        const otherPlayer = game.players[1 - playerIndex];
        io.to(otherPlayer.socketId).emit('opponent-disconnected');
        
        // Clean up after delay
        setTimeout(() => {
          gameRooms.delete(gameId);
        }, 10000);
      }
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
