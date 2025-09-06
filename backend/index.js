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
const friendsRoutes = require('./routes/friends');
const chatbotRoutes = require('./routes/chatbot');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

// Import AI question generation function
const { generateQuestions } = require('./routes/battlegrounds');

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
app.use('/api/friends', friendsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.get('/', (req, res) => {
  res.send('Gamified Learning Platform API');
});

// Game room management
const gameRooms = new Map();
const waitingPlayers = new Map(); // subject-difficulty-class -> [players]

// Function to load questions from JSON files
async function loadQuestions(subject, difficulty, classLevel) {
  try {
    console.log(`🤖 Generating ${subject} questions for ${difficulty} difficulty, class ${classLevel} using AI...`);
    
    // Generate questions using AI
    const questions = await generateQuestions(subject, difficulty, classLevel);
    
    console.log(`✅ Generated ${questions.length} questions using AI`);
    console.log('📝 First question:', questions[0]?.question);
    
    // Return the generated questions (should be exactly 5)
    return questions;
  } catch (error) {
    console.error('❌ Error generating questions with AI:', error);
    
    // Fallback to static questions if AI fails
    console.log('🔄 Falling back to static questions...');
    try {
      const filePath = path.join(__dirname, `battlegrounds-questions.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Questions file not found: ${filePath}`);
        return [];
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const questionData = JSON.parse(data);
      const allQuestions = questionData.questions || questionData;
      
      // Convert classLevel to number for proper comparison
      const classNum = parseInt(classLevel);
      
      // Filter questions by subject, difficulty and class
      const filteredQuestions = allQuestions.filter(q => 
        q.subject.toLowerCase() === subject.toLowerCase() && 
        q.difficulty === difficulty && 
        q.class === classNum
      );
      
      console.log(`📚 Found ${filteredQuestions.length} fallback questions for ${subject} ${difficulty} class ${classNum}`);
      
      // Return up to 5 random questions (or all available if fewer than 5)
      const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
      const numQuestions = Math.min(5, shuffled.length);
      return shuffled.slice(0, numQuestions);
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      return [];
    }
  }
}

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
  socket.on('join-lobby', async (data) => {
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
      
      // Load questions for the game
      const gameQuestions = await loadQuestions(subject, difficulty, classLevel);
      console.log(`📚 Loaded ${gameQuestions.length} questions for game ${gameId}`);
      
      // Create game room
      gameRooms.set(gameId, {
        id: gameId,
        players: gamePlayers,
        subject,
        difficulty,
        classLevel,
        mode,
        questions: gameQuestions,
        status: 'starting',
        currentQuestion: 0,
        scores: { [gamePlayers[0].socketId]: 0, [gamePlayers[1].socketId]: 0 },
        answers: { [gamePlayers[0].socketId]: [], [gamePlayers[1].socketId]: [] },
        completed: { [gamePlayers[0].socketId]: false, [gamePlayers[1].socketId]: false }
      });      // Notify players that game is starting
      gamePlayers.forEach(player => {
        console.log('📤 Sending game-start to:', player.userData.username);
        console.log('📝 Questions being sent:', gameQuestions.map(q => q.question));
        io.to(player.socketId).emit('game-start', {
          gameId,
          opponent: gamePlayers.find(p => p.socketId !== player.socketId).userData,
          subject,
          difficulty,
          classLevel,
          mode,
          questions: gameQuestions
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
    console.log(`📝 Player ${socket.userData.username} submitted answer for question ${questionIndex}:`, answerIndex);
    
    const game = gameRooms.get(gameId);

    if (!game || !game.questions || !game.questions[questionIndex]) {
      console.error('❌ Game or question not found');
      return;
    }

    const correctAnswer = game.questions[questionIndex].correctAnswer;
    console.log(`✅ Correct answer for question ${questionIndex}:`, correctAnswer);

    // Record answer
    if (!game.answers[socket.id]) game.answers[socket.id] = [];
    game.answers[socket.id][questionIndex] = {
      answerIndex,
      timeLeft,
      isCorrect: answerIndex !== -1 && answerIndex === correctAnswer // -1 means no answer selected
    };

    // Calculate points only for correct answers (and only if an answer was selected)
    if (answerIndex !== -1 && answerIndex === correctAnswer) {
      const basePoints = 10;
      const timeBonus = Math.floor(timeLeft / 3); // Bonus points for speed
      const points = basePoints + timeBonus;
      game.scores[socket.id] += points;
      console.log(`💰 Player ${socket.userData.username} earned ${points} points (base: ${basePoints}, bonus: ${timeBonus})`);
    }

    console.log(`📊 Current scores - ${game.players[0].userData.username}: ${game.scores[game.players[0].socketId]}, ${game.players[1].userData.username}: ${game.scores[game.players[1].socketId]}`);

    // Send results immediately (independent progression)
    const results = {
      questionIndex,
      correctAnswer,
      player1: {
  username: game.players[0].userData.username,
  userId: game.players[0].userData.userId,
        answer: game.answers[game.players[0].socketId][questionIndex]?.answerIndex ?? -1,
        isCorrect: game.answers[game.players[0].socketId][questionIndex]?.isCorrect ?? false,
        timeLeft: game.answers[game.players[0].socketId][questionIndex]?.timeLeft ?? 0,
  points: game.scores[game.players[0].socketId],
  score: game.scores[game.players[0].socketId],
        answers: game.answers[game.players[0].socketId]
      },
      player2: {
  username: game.players[1].userData.username,
  userId: game.players[1].userData.userId,
        answer: game.answers[game.players[1].socketId][questionIndex]?.answerIndex ?? -1,
        isCorrect: game.answers[game.players[1].socketId][questionIndex]?.isCorrect ?? false,
        timeLeft: game.answers[game.players[1].socketId][questionIndex]?.timeLeft ?? 0,
  points: game.scores[game.players[1].socketId],
  score: game.scores[game.players[1].socketId],
        answers: game.answers[game.players[1].socketId]
      }
    };

    // Send results to both players
    game.players.forEach(player => {
      io.to(player.socketId).emit('round-results', results);
    });
  });

  // Handle game completion
  socket.on('game-complete', (data) => {
    const { gameId } = data;
    const game = gameRooms.get(gameId);
    
    if (game) {
      // Mark this player as completed
      game.completed[socket.id] = true;
      console.log(`✅ Player ${socket.userData.username} completed game ${gameId}`);
      
      // Check if both players have completed
      const bothCompleted = Object.values(game.completed).every(completed => completed);
      
      if (bothCompleted) {
        console.log(`🎉 Both players completed game ${gameId}, sending final results`);
        game.status = 'completed';
        
        const finalScores = {
          player1: {
            username: game.players[0].userData.username,
            userId: game.players[0].userData.userId,
            score: game.scores[game.players[0].socketId],
            points: game.scores[game.players[0].socketId],
            answers: game.answers[game.players[0].socketId]
          },
          player2: {
            username: game.players[1].userData.username,
            userId: game.players[1].userData.userId,
            score: game.scores[game.players[1].socketId],
            points: game.scores[game.players[1].socketId],
            answers: game.answers[game.players[1].socketId]
          },
          winner: game.scores[game.players[0].socketId] > game.scores[game.players[1].socketId] 
            ? game.players[0].userData.username 
            : game.scores[game.players[0].socketId] < game.scores[game.players[1].socketId]
            ? game.players[1].userData.username
            : 'tie'
        };
        // Also include a convenient answers map keyed by username for clients
        // Answers map keyed by both username and userId for robust client lookup
        finalScores.answers = {
          [finalScores.player1.username]: finalScores.player1.answers || [],
          [finalScores.player2.username]: finalScores.player2.answers || [],
          [finalScores.player1.userId]: finalScores.player1.answers || [],
          [finalScores.player2.userId]: finalScores.player2.answers || []
        };
        
        // Send final results to both players
        game.players.forEach(player => {
          io.to(player.socketId).emit('game-final-results', finalScores);
        });

        // Persist points to users in DB (safe, best-effort)
        (async () => {
          try {
            const p1 = await User.findOne({ username: finalScores.player1.username });
            const p2 = await User.findOne({ username: finalScores.player2.username });
            if (p1) {
              await User.findByIdAndUpdate(p1._id, { $inc: { points: finalScores.player1.score } });
              console.log(`💾 Updated points for ${p1.username} by ${finalScores.player1.score}`);
            }
            if (p2) {
              await User.findByIdAndUpdate(p2._id, { $inc: { points: finalScores.player2.score } });
              console.log(`💾 Updated points for ${p2.username} by ${finalScores.player2.score}`);
            }
          } catch (err) {
            console.error('❌ Error persisting game points to DB:', err.message || err);
          }
        })();
        
        // Clean up game room after a delay
        setTimeout(() => {
          gameRooms.delete(gameId);
        }, 5000);
      } else {
        console.log(`⏳ Waiting for other player to complete game ${gameId}`);
      }
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
