const fs = require('fs');
const path = require('path');

module.exports = function registerGameHandlers(io, generateQuestions, User) {
  // Game room management
  const gameRooms = new Map();
  const waitingPlayers = new Map(); // subject-difficulty-class-mode -> [players]

  // Function to load questions from AI or fallback JSON
  async function loadQuestions(subject, difficulty, classLevel) {
    try {
      console.log(`🤖 Generating ${subject} questions for ${difficulty} difficulty, class ${classLevel} using AI...`);
      const questions = await generateQuestions(subject, difficulty, classLevel);
      console.log(`✅ Generated ${questions.length} questions using AI`);
      console.log('📝 First question:', questions[0]?.question);
      return questions;
    } catch (error) {
      console.error('❌ Error generating questions with AI:', error);
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
        const classNum = parseInt(classLevel);
        const filteredQuestions = allQuestions.filter(q => 
          q.subject.toLowerCase() === subject.toLowerCase() && 
          q.difficulty === difficulty && 
          q.class === classNum
        );
        console.log(`📚 Found ${filteredQuestions.length} fallback questions for ${subject} ${difficulty} class ${classNum}`);
        const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
        const numQuestions = Math.min(5, shuffled.length);
        return shuffled.slice(0, numQuestions);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Socket.IO authentication middleware (removed - now authenticate per event)
  // io.use((socket, next) => {
  //   const sessionId = socket.handshake.headers.cookie?.split(';')
  //     .find(c => c.trim().startsWith('connect.sid='))
  //     ?.split('=')[1];

  //   if (!sessionId) {
  //     console.log('❌ No session found for socket connection');
  //     return next(new Error('Authentication error'));
  //   }

  //   console.log('🔐 Socket authenticated with session:', sessionId.substring(0, 10) + '...');
  //   next();
  // });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join battlegrounds lobby
    socket.on('join-lobby', async (data) => {
      // Authenticate user before allowing battlegrounds access
      const sessionId = socket.handshake.headers.cookie?.split(';')
        .find(c => c.trim().startsWith('connect.sid='))
        ?.split('=')[1];

      if (!sessionId) {
        console.log('❌ No session found for battlegrounds access');
        socket.emit('auth-error', { message: 'Authentication required for battlegrounds' });
        return;
      }

      console.log('🔐 Socket authenticated for battlegrounds with session:', sessionId.substring(0, 10) + '...');

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
        });

        // Notify players that game is starting
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
      // Check if user is authenticated (has userData from join-lobby)
      if (!socket.userData) {
        console.log('❌ Unauthenticated user trying to submit answer');
        socket.emit('auth-error', { message: 'Authentication required' });
        return;
      }

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
      // Check if user is authenticated
      if (!socket.userData) {
        console.log('❌ Unauthenticated user trying to complete game');
        socket.emit('auth-error', { message: 'Authentication required' });
        return;
      }

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
};
