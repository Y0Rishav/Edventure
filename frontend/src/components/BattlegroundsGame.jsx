import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

function BattlegroundsGame() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { socket } = useSocket();
  const subject = searchParams.get('subject');
  const difficulty = searchParams.get('difficulty');
  const classLevel = searchParams.get('class');
  const mode = searchParams.get('mode');
  const isMultiplayer = searchParams.get('multiplayer') === 'true';
  const invitedFriends = searchParams.get('invitedFriends')?.split(',') || [];

  // Check if game data was passed from navigation state
  const gameDataFromState = location.state?.gameData;

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameId, setGameId] = useState(searchParams.get('gameId') || null);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const [gameState, setGameState] = useState('loading'); // loading, vs-screen, playing, waiting-opponent, finished
  const [showVsScreen, setShowVsScreen] = useState(false);
  const [powerUps, setPowerUps] = useState({
    fiftyFifty: true,
    extraTime: true,
    skipQuestion: true
  });
  const [usedPowerUps, setUsedPowerUps] = useState({
    fiftyFifty: false,
    extraTime: false,
    skipQuestion: false
  });

  // Multiplayer state
  const [opponent, setOpponent] = useState(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundResults, setRoundResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  // Monitor gameState changes
  useEffect(() => {
    console.log('📊 Game state changed to:', gameState);
  }, [gameState]);

  // Monitor questions changes
  useEffect(() => {
    console.log('❓ Questions updated:', questions.length, 'questions');
    if (questions.length > 0) {
      console.log('📝 First question:', questions[0]);
    }
  }, [questions]);

  useEffect(() => {
    console.log('🔄 First useEffect running - multiplayer:', isMultiplayer, 'socket:', !!socket, 'gameState:', gameState, 'gameDataFromState:', !!gameDataFromState);
    // Don't re-run if game has already started
    if (gameState === 'playing' || gameState === 'finished') return;
    
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(userRes.data);
        console.log('👤 User loaded in game:', userRes.data.username);

        if (isMultiplayer) {
          // Check if we have game data from navigation state
          if (gameDataFromState) {
            console.log('🎯 Using game data from navigation state:', gameDataFromState);
            setOpponent(gameDataFromState.opponent);
            setGameState('playing');
            fetchQuestions();
            return;
          }
          
          // Multiplayer mode - wait for game to start
          setGameState('waiting');
        } else {
          // Single player mode - load questions immediately
          if (mode === 'practice') {
            // Practice mode - load saved practice questions
            await loadPracticeQuestions();
          } else {
            // Regular single player - generate new questions
            const questionsRes = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
            const questionsData = questionsRes.data;
            const gameQuestions = questionsData.questions.slice(0, 10);
            setQuestions(gameQuestions);
            setGameState('playing');
          }
        }
      } catch (err) {
        console.log('❌ Error loading user in game:', err);
        // Show error message instead of auto-redirect
        alert('Session expired. Please refresh the page and log in again.');
        // Don't auto-redirect, let user handle it
        // window.location.href = '/';
      }
    };
    fetchData();
  }, [subject, difficulty, classLevel, isMultiplayer, gameDataFromState]); // Removed socket from dependencies

  // Socket.IO event listeners for multiplayer
  useEffect(() => {
    console.log('🔌 Socket useEffect running - socket:', !!socket, 'isMultiplayer:', isMultiplayer, 'gameState:', gameState, 'socketId:', socket?.id);
    if (!socket || !isMultiplayer) return;

    socket.on('game-start', (data) => {
      console.log('🎮 Game started event received:', data);
      console.log('🎯 Opponent data:', data.opponent);
      console.log('🆔 Game ID:', data.gameId);
      console.log('📚 Questions received:', data.questions?.length || 0);
      console.log('📝 First question:', data.questions?.[0]?.question);
      
      setOpponent(data.opponent);
  setOpponent(data.opponent);
  setGameId(data.gameId);
      
      // Set questions from backend
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        // Show VS screen first
        setGameState('vs-screen');
        setShowVsScreen(true);
        
        // Transition to playing after VS screen animation
        setTimeout(() => {
          setShowVsScreen(false);
          setGameState('playing');
          console.log('🔄 Game state set to playing with shared questions');
        }, 3000); // 3 seconds for VS screen
      } else {
        console.error('❌ No questions received from backend');
        setGameState('error');
      }
    });

    socket.on('round-results', (data) => {
      console.log('📊 Round results received:', data);
      console.log('📊 Current score before update:', score);
      console.log('📊 User loaded:', !!user, user?.username);
      
      // Only process if user is loaded
      if (!user) {
        console.log('⚠️ User not loaded yet, ignoring round-results');
        return;
      }
      
      // Update local score from server data (server may send `score` or `points`)
      const isPlayer1 = data.player1.username === user.username;
      const extractScore = (p) => {
        if (!p) return 0;
        // Accept either `score` or `points` (older code used `points`)
        return Number(p.score ?? p.points ?? 0) || 0;
      };
      const newScore = isPlayer1 ? extractScore(data.player1) : extractScore(data.player2);
      const newOpponentScore = isPlayer1 ? extractScore(data.player2) : extractScore(data.player1);
      
      console.log('📊 Setting score to:', newScore);
      console.log('📊 Setting opponent score to:', newOpponentScore);
      
  // Force state update to numeric values
  console.log('📊 Score state update from', score, 'to', newScore);
  setScore(newScore);
      setOpponentScore(newOpponentScore);
      
      console.log('📊 Score updated to:', newScore);
      
      // Check if both players have finished all questions
      if (data.player1.answers && data.player1.answers.length === questions.length &&
          data.player2.answers && data.player2.answers.length === questions.length) {
        // Both players finished - transition to finished state
        setGameState('finished');
      }
    });

  socket.on('game-final-results', async (data) => {
      console.log('🎉 Received final results (raw):', data);

      // Normalize answers for both players into the client's expected shape
      const normalizeAnswers = (answersArray) => {
        if (!Array.isArray(answersArray)) return [];
        return answersArray.map((a, idx) => {
          const selected = typeof a.answerIndex === 'number' ? a.answerIndex : (typeof a.selectedAnswer === 'number' ? a.selectedAnswer : -1);
          const isCorrect = typeof a.isCorrect === 'boolean' ? a.isCorrect : (selected !== -1 && questions[idx] ? selected === questions[idx].correctAnswer : false);
          let timeTaken = 0;
          if (typeof a.timeTaken === 'number') {
            timeTaken = a.timeTaken;
          } else if (typeof a.timeLeft === 'number') {
            const limit = questions[idx]?.timeLimit || 30;
            timeTaken = Math.max(0, limit - a.timeLeft);
          }
          return {
            questionId: a.questionId || a.id || null,
            selectedAnswer: selected,
            isCorrect,
            timeTaken
          };
        });
      };

      const p1Answers = normalizeAnswers(data.player1?.answers || []);
      const p2Answers = normalizeAnswers(data.player2?.answers || []);

      const normalized = {
        ...data,
        player1: { ...data.player1, answers: p1Answers },
        player2: { ...data.player2, answers: p2Answers },
        answers: {
          // Key answers by both username and userId for robust lookup
          [data.player1?.username]: p1Answers,
          [data.player2?.username]: p2Answers,
          [data.player1?.userId]: p1Answers,
          [data.player2?.userId]: p2Answers
        }
      };

      setFinalResults(normalized);
      setGameState('finished');

      // Update local answers state for this user from the finalized results
      try {
        // Prefer matching by username first, then by userId
        let myFinalAnswers = [];
        if (normalized.player1 && user) {
          const p1Match = (normalized.player1.username === user.username) || (normalized.player1.userId && (String(normalized.player1.userId) === String(user._id) || String(normalized.player1.userId) === String(user.id)));
          if (p1Match) myFinalAnswers = normalized.player1.answers || [];
          else myFinalAnswers = normalized.player2?.answers || [];
        } else {
          // Fallback to answers map
          const myKey = user?._id ?? user?.id ?? user?.username;
          myFinalAnswers = normalized.answers?.[myKey] ?? normalized.answers?.[user?.username] ?? [];
        }

        console.log('🧭 Debug: resolved myFinalAnswers length:', myFinalAnswers?.length, 'for user:', user?.username, 'normalized keys:', Object.keys(normalized.answers || {}));

        if (Array.isArray(myFinalAnswers) && myFinalAnswers.length > 0) {
          // Map to local answer shape
          const updatedLocalAnswers = myFinalAnswers.map((a, idx) => ({
            questionId: a.questionId ?? a.id ?? null,
            selectedAnswer: typeof a.selectedAnswer === 'number' ? a.selectedAnswer : (typeof a.answerIndex === 'number' ? a.answerIndex : -1),
            isCorrect: typeof a.isCorrect === 'boolean' ? a.isCorrect : (typeof a.selectedAnswer === 'number' && questions?.[idx] ? a.selectedAnswer === questions[idx].correctAnswer : false),
            timeTaken: typeof a.timeTaken === 'number' ? a.timeTaken : (typeof a.timeLeft === 'number' ? Math.max(0, (questions?.[idx]?.timeLimit || 30) - a.timeLeft) : 0)
          }));
          setAnswers(updatedLocalAnswers);
        }
      } catch (e) {
        console.error('❌ Error updating local answers from final results:', e);
      }

      // Update user points based on final results (best-effort)
      try {
        if (user) {
          const playerScore = normalized.player1.username === user.username ? Number(normalized.player1.score ?? normalized.player1.points ?? 0) : Number(normalized.player2.score ?? normalized.player2.points ?? 0);
          if (!isNaN(playerScore)) {
            await axios.post('http://localhost:5000/auth/update_points', {
              points: playerScore
            }, { withCredentials: true });
            console.log('💰 Updated user points after multiplayer game:', playerScore);
          }
        }
      } catch (err) {
        console.error('❌ Error updating points after multiplayer game:', err);
      }
  });

    socket.on('opponent-disconnected', () => {
      alert('Your opponent disconnected. Game ended.');
      setGameState('finished');
    });

    return () => {
      socket.off('game-start');
      socket.off('round-results');
      socket.off('game-final-results');
      socket.off('opponent-disconnected');
    };
  }, [socket, isMultiplayer, gameState]);

  const fetchQuestions = async () => {
    console.log('🔍 Fetching questions with params:', { subject, difficulty, classLevel, gameId, isMultiplayer });
    try {
      let questionsData;

      if (isMultiplayer && gameId) {
        // First try to get stored questions
        try {
          console.log('🔍 Trying to get stored questions for game:', gameId);
          const storedResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/game/${gameId}`);
          questionsData = storedResponse.data;
          console.log('✅ Loaded stored questions for game');
        } catch (storedError) {
          console.log('📝 Stored questions not found, generating new ones...');
          // If stored questions don't exist, generate new ones
          const generateResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}&gameId=${gameId}`);
          questionsData = generateResponse.data;
          console.log('✅ Generated new questions for game');
        }
      } else {
        // Single player - generate new questions
        console.log('🔍 Generating questions for single player');
        const generateResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
        questionsData = generateResponse.data;
        console.log('✅ Generated questions for single player');
      }

      console.log('📋 Questions data:', questionsData);

      let gameQuestions;
      if (questionsData.questions) {
        // Response has questions array
        gameQuestions = questionsData.questions.slice(0, 5);
      } else {
        // Fallback for filter endpoint
        gameQuestions = questionsData.slice(0, 5);
      }

      console.log('✂️ Sliced questions:', gameQuestions);
      setQuestions(gameQuestions);
      console.log('✅ Questions loaded for game:', gameQuestions.length);

      if (gameQuestions.length === 0) {
        console.log('⚠️ No questions found for the selected criteria');
        alert('No questions available for the selected criteria. Please try different settings.');
        setGameState('waiting');
      } else {
        setGameState('playing');
      }
    } catch (err) {
      console.log('❌ Error fetching questions:', err);
      console.log('❌ Error details:', err.response?.data, err.message);
      alert('Failed to load questions. Please try again.');
      setGameState('waiting');
    }
  };

  const loadPracticeQuestions = async () => {
    console.log('� Loading practice questions with params:', { subject, difficulty, classLevel });
    try {
      const response = await axios.get(`http://localhost:5000/api/battlegrounds-questions/practice?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
      const practiceData = response.data;

      if (practiceData.questions && practiceData.questions.length > 0) {
        // Shuffle and take up to 10 questions
        const shuffledQuestions = practiceData.questions.sort(() => Math.random() - 0.5);
        const gameQuestions = shuffledQuestions.slice(0, 10);
        setQuestions(gameQuestions);
        setGameState('playing');
        console.log('✅ Practice questions loaded:', gameQuestions.length);
      } else {
        console.log('⚠️ No practice questions found for the selected criteria');
        alert('No practice questions available for the selected criteria. Please play some games first to save questions for practice!');
        // Redirect back to battlegrounds
        window.location.href = '/battlegrounds';
      }
    } catch (err) {
      console.log('❌ Error loading practice questions:', err);
      alert('Failed to load practice questions. Please try again.');
      window.location.href = '/battlegrounds';
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return; // Don't allow selection if already selected

    // Capture current timeLeft snapshot
    const timeSnapshot = timeLeft;

    // Set local selection immediately for UI
    setSelectedAnswer(answerIndex);

    // Clear the countdown timer so it doesn't also trigger next-question
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Proceed to next question after a short delay to show selection
    setTimeout(() => {
      handleNextQuestion(answerIndex, timeSnapshot);
    }, 700); // short delay to show selected state
  };

  // Timer effect
  useEffect(() => {
    // Countdown timer for question
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    } else if (gameState === 'playing' && timeLeft === 0) {
      // Time's up - submit as no answer
      handleNextQuestion(-1, 0);
    }
  }, [timeLeft, gameState]);

  const handlePowerUp = (type) => {
    if (usedPowerUps[type]) return;

    setUsedPowerUps(prev => ({ ...prev, [type]: true }));

    switch (type) {
      case 'fiftyFifty':
        // Remove two wrong answers
        const currentQ = questions[currentQuestionIndex];
        const wrongOptions = currentQ.options.filter((_, index) => index !== currentQ.correctAnswer);
        const optionsToRemove = wrongOptions.slice(0, 2);
        // In a real implementation, you'd modify the displayed options
        alert('50/50 used! Two wrong answers removed.');
        break;
      case 'extraTime':
        setTimeLeft(prev => prev + 15);
        alert('Extra time added! +15 seconds');
        break;
      case 'skipQuestion':
        handleNextQuestion();
        alert('Question skipped!');
        break;
    }
  };

  const handleNextQuestion = (submittedAnswer, timeLeftAtSubmit) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Decide which answer to process: prefer submittedAnswer parameter if provided
    const usedAnswer = typeof submittedAnswer === 'number' ? submittedAnswer : (selectedAnswer !== null ? selectedAnswer : -1);
    const timeUsed = typeof timeLeftAtSubmit === 'number' ? (30 - timeLeftAtSubmit) : (30 - timeLeft);

    // Update answers array (isCorrect will be determined by backend for multiplayer)
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedAnswer: usedAnswer !== null ? usedAnswer : -1,
      isCorrect: !isMultiplayer ? (usedAnswer !== null && usedAnswer !== -1 ? usedAnswer === currentQuestion.correctAnswer : false) : null,
      timeTaken: timeUsed
    };
    setAnswers(newAnswers);

    // For single player, calculate and update score locally
    if (!isMultiplayer) {
      const isCorrect = usedAnswer !== null && usedAnswer !== -1 ? usedAnswer === currentQuestion.correctAnswer : false;
      if (isCorrect) {
        const points = currentQuestion.points + Math.floor((timeLeftAtSubmit ?? timeLeft) / 3); // Bonus for speed
        setScore(prevScore => prevScore + points);
      }
    }

    if (isMultiplayer && socket) {
      // Send answer to server (backend will validate)
      socket.emit('submit-answer', {
        gameId,
        questionIndex: currentQuestionIndex,
        answerIndex: usedAnswer !== null ? usedAnswer : -1, // Send -1 for no answer
        timeLeft: typeof timeLeftAtSubmit === 'number' ? timeLeftAtSubmit : timeLeft
      });
      
      // Proceed to next question immediately (independent progression)
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        // Last question - notify backend and wait for final results
        socket.emit('game-complete', { gameId });
        setGameState('waiting-opponent');
      }
    } else {
      // Single player mode
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        finishGame();
      }
    }
  };

  const finishGame = async () => {
    // Don't set game state here - it will be set by game-final-results event
    console.log('🎮 Game completion initiated');

    // Helper: compute final score deterministically from answers and questions
    const computeFinalScore = () => {
      try {
        if (!questions || questions.length === 0) return 0;
        let total = 0;
        for (let i = 0; i < answers.length; i++) {
          const ans = answers[i];
          const q = questions[i];
          if (!ans || !q) continue;
          const selected = ans.selectedAnswer;
          if (selected !== -1 && selected === q.correctAnswer) {
            const timeTaken = typeof ans.timeTaken === 'number' ? ans.timeTaken : 0;
            const timeLeftForPoint = Math.max(0, (q.timeLimit || 30) - timeTaken);
            const bonus = Math.floor(timeLeftForPoint / 3);
            total += (q.points || 0) + bonus;
          }
        }
        return total;
      } catch (e) {
        console.error('❌ Error computing final score:', e);
        return score || 0;
      }
    };

    if (isMultiplayer && socket) {
      // Notify server that game is complete (already sent above)
      // Save questions for practice instead of deleting (only if not in practice mode)
      if (gameId && questions.length > 0 && mode !== 'practice') {
        try {
          await axios.post('http://localhost:5000/api/battlegrounds-questions/save-practice', {
            gameId,
            subject,
            difficulty,
            classLevel,
            questions
          });
          console.log('💾 Saved questions for practice mode');
        } catch (err) {
          console.error('❌ Error saving questions:', err);
        }
      }
    } else {
      // Single player - finish immediately
      setGameState('finished');

      // Compute final points from answers (avoid relying on possibly-stale `score` state)
      const finalPoints = computeFinalScore();

      // For single player, also save questions for practice (only if not in practice mode)
      if (questions.length > 0 && mode !== 'practice') {
        try {
          await axios.post('http://localhost:5000/api/battlegrounds-questions/save-practice', {
            gameId: `single_${Date.now()}`,
            subject,
            difficulty,
            classLevel,
            questions
          });
          console.log('💾 Saved single-player questions for practice mode');
        } catch (err) {
          console.log('❌ Error saving single-player questions for practice:', err);
        }
      }

      // Update user points with the computed finalPoints
      try {
        await axios.post('http://localhost:5000/auth/update_points', {
          points: finalPoints,
          badge: finalPoints > 200 ? 'Battle Champion' : null
        }, { withCredentials: true });
        console.log('💰 Updated user points (single-player):', finalPoints);
      } catch (err) {
        console.error('❌ Error updating points after single-player game:', err);
      }
    }

    // Update user points in backend
    try {
      await axios.post('http://localhost:5000/auth/update_points', {
        points: score,
        badge: score > 200 ? 'Battle Champion' : null
      }, { withCredentials: true });
      console.log('💰 Updated user points');
    } catch (err) {
      console.error('❌ Error updating points:', err);
    }
  };

  const getResultMessage = () => {
    if (mode === 'practice') {
      return score > 150 ? 'Excellent performance!' : score > 100 ? 'Good job!' : 'Keep practicing!';
    } else {
      if (score > opponentScore) {
        return '🎉 Victory! You won the battle!';
      } else if (score === opponentScore) {
        return '🤝 It\'s a tie! Well played!';
      } else {
        return '💪 Good effort! Try again next time!';
      }
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold mb-2">Generating Questions</p>
          <p className="text-gray-600">AI is creating personalized questions for your battle...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading user data...</p>
          <p className="text-sm text-gray-600 mt-2">If this takes too long, please log in again.</p>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl mb-4">Finding Opponent</h2>
          <p className="text-gray-600 mb-2">Looking for another player...</p>
          <p className="text-sm text-gray-500">Please wait while we match you with an opponent</p>
          {!user && (
            <div className="mt-4">
              <p className="text-sm text-red-600">Loading user data...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'vs-screen' || showVsScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 animate-pulse">BATTLEGROUND</h1>
            <p className="text-xl text-purple-300">Get ready to battle!</p>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-lg font-semibold">{user?.username}</p>
              <p className="text-sm text-purple-300">You</p>
            </div>
            
            <div className="text-6xl font-bold text-yellow-400 animate-bounce">VS</div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold">{opponent?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-lg font-semibold">{opponent?.username}</p>
              <p className="text-sm text-blue-300">Opponent</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="inline-block bg-black bg-opacity-50 px-6 py-3 rounded-full">
              <p className="text-lg">Generating battle questions...</p>
              <div className="flex justify-center mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-300">
            <p>Subject: {subject} • Difficulty: {difficulty} • Class: {classLevel}</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting-opponent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-2xl mb-4">Quiz Complete!</h2>
          <p className="text-gray-600 mb-2">Waiting for {opponent?.username} to finish...</p>
          <p className="text-sm text-gray-500">Your final score: {score} points</p>
          <div className="mt-6 bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Your Performance</h3>
            <div className="grid grid-cols-5 gap-2">
              {answers.map((answer, index) => (
                <div key={index} className={`p-2 rounded text-center text-sm ${
                  answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  Q{index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const resultMessage = finalResults ? 
      (finalResults.winner === user?.username ? '🎉 Victory!' : finalResults.winner === 'tie' ? '🤝 It\'s a tie!' : '💪 Good effort!') :
      getResultMessage();

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded shadow text-center mb-6">
            <h1 className="text-3xl mb-4">Battle Complete!</h1>
            <div className="mb-6">
              <p className="text-xl mb-2">{resultMessage}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">Your Score</h3>
                  <p className="text-2xl text-blue-600">{score} points</p>
                  {finalResults && <p className="text-sm text-gray-600">{user?.username}</p>}
                </div>
                {(isMultiplayer || mode !== 'practice') && (
                  <div className="bg-red-50 p-4 rounded">
                    <h3 className="text-lg font-semibold">
                      {isMultiplayer ? 'Opponent Score' : 'AI Score'}
                    </h3>
                    <p className="text-2xl text-red-600">
                      {isMultiplayer ? opponentScore : opponentScore} points
                    </p>
                    {finalResults && <p className="text-sm text-gray-600">{opponent?.username}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-6 text-center">Battle Analytics</h2>
            
            <div className="space-y-6">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                // Try to get opponent answers from finalResults.answers map first (server provides this),
                // otherwise fall back to finalResults.playerX.answers
                let opponentAnswer = null;
                if (finalResults) {
                  // Prefer lookup by userId; fall back to username
                  const key = opponent?.userId || opponent?.username;
                  opponentAnswer = finalResults.answers?.[key]?.[index] ??
                    (finalResults.player1?.username === opponent?.username ? finalResults.player1.answers?.[index] : finalResults.player2?.answers?.[index]);
                }
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">Question {index + 1}</h3>
                    <p className="text-gray-800 mb-4">{question.question}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Your Answer */}
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-semibold text-blue-800">{user?.username}</h4>
                        <p className={`text-sm ${userAnswer?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {userAnswer && userAnswer.selectedAnswer !== -1 ? question.options[userAnswer.selectedAnswer] : 'No answer'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {userAnswer?.isCorrect ? '✅ Correct' : userAnswer && userAnswer.selectedAnswer === -1 ? '⏰ Time out' : '❌ Incorrect'}
                        </p>
                      </div>
                      
                      {/* Opponent Answer */}
                      {isMultiplayer && (
                        <div className="bg-red-50 p-3 rounded">
                          <h4 className="font-semibold text-red-800">{opponent?.username}</h4>
                          <p className={`text-sm ${opponentAnswer?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {opponentAnswer && opponentAnswer.selectedAnswer !== -1 ? question.options[opponentAnswer.selectedAnswer] : 'No answer'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {opponentAnswer?.isCorrect ? '✅ Correct' : opponentAnswer && opponentAnswer.selectedAnswer === -1 ? '⏰ Time out' : '❌ Incorrect'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Correct Answer */}
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <h4 className="font-semibold text-green-800">Correct Answer</h4>
                      <p className="text-green-700">{question.options[question.correctAnswer]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex gap-4 justify-center">
              <Link to="/battlegrounds/lobby" className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
                Play Again
              </Link>
              <Link to="/battlegrounds/leaderboard" className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600">
                View Leaderboard
              </Link>
              <Link to="/dashboard" className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="min-h-screen flex items-center justify-center">No questions available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Battlegrounds - {subject}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
              {isMultiplayer && opponent && (
                <p className="text-sm text-purple-600">vs {opponent.username}</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold text-blue-600">{score} points</div>
                  <div className="text-xs text-gray-600">Your Points</div>
                </div>
                {isMultiplayer && (
                  <div>
                    <div className="text-lg font-bold text-red-600">{opponentScore} points</div>
                    <div className="text-xs text-gray-600">Opponent</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Time Left:</span>
            <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white p-6 rounded shadow mb-4">
          <h2 className="text-xl mb-6">{currentQuestion.question}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Power-ups */}
        <div className="bg-yellow-50 p-4 rounded shadow mb-4">
          <h3 className="text-lg font-semibold mb-3">Power-ups</h3>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handlePowerUp('fiftyFifty')}
              disabled={usedPowerUps.fiftyFifty}
              className={`px-4 py-2 rounded text-sm font-medium ${
                usedPowerUps.fiftyFifty
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              50/50 🎯
            </button>
            <button
              onClick={() => handlePowerUp('extraTime')}
              disabled={usedPowerUps.extraTime}
              className={`px-4 py-2 rounded text-sm font-medium ${
                usedPowerUps.extraTime
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              +15s ⏰
            </button>
            <button
              onClick={() => handlePowerUp('skipQuestion')}
              disabled={usedPowerUps.skipQuestion}
              className={`px-4 py-2 rounded text-sm font-medium ${
                usedPowerUps.skipQuestion
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Skip 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattlegroundsGame;
