import { useState, useEffect } from 'react';
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
  const gameId = searchParams.get('gameId');
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
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('loading'); // loading, playing, finished
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
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
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
      setOpponent(data.opponent);
      setGameState('playing');
      console.log('🔄 Game state set to playing');
      // Load questions now that game has started
      fetchQuestions();
    });

    socket.on('round-results', (data) => {
      setRoundResults(data);
      setOpponentScore(data.player2.score);
      setWaitingForOpponent(false);
    });

    socket.on('game-final-results', (data) => {
      setFinalResults(data);
      setGameState('finished');
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
    if (waitingForOpponent) return; // Don't allow selection while waiting
    setSelectedAnswer(answerIndex);
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
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

    const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeTaken: 30 - timeLeft
    };
    setAnswers(newAnswers);

    // Update score
    if (isCorrect) {
      const points = currentQuestion.points + Math.floor(timeLeft / 3); // Bonus for speed
      setScore(prevScore => prevScore + points);
    }

    if (isMultiplayer && socket) {
      // Send answer to server
      socket.emit('submit-answer', {
        gameId,
        questionIndex: currentQuestionIndex,
        answerIndex: selectedAnswer,
        timeLeft
      });
      setWaitingForOpponent(true);
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
    setGameState('finished');

    if (isMultiplayer && socket) {
      // Notify server that game is complete
      socket.emit('game-complete', { gameId });

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
          console.log('� Saved questions for practice mode');
        } catch (err) {
          console.log('❌ Error saving questions for practice:', err);
        }
      }
    } else {
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
    }

    // Update user points in backend
    try {
      await axios.post('http://localhost:5000/auth/update_points', {
        points: score,
        badge: score > 200 ? 'Battle Champion' : null
      }, { withCredentials: true });
    } catch (err) {
      console.log(err);
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
          <h2 className="text-2xl mb-4">Preparing Battle</h2>
          <p className="text-gray-600 mb-2">Setting up your multiplayer battle...</p>
          <p className="text-sm text-gray-500">AI is generating personalized questions for both players</p>
          {opponent && (
            <div className="mt-4">
              <p className="text-lg">vs <span className="font-semibold text-purple-600">{opponent.username}</span></p>
            </div>
          )}
          {!user && (
            <div className="mt-4">
              <p className="text-sm text-red-600">Loading user data...</p>
            </div>
          )}
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded shadow text-center">
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
                  <div className="text-lg font-bold text-blue-600">{score}</div>
                  <div className="text-xs text-gray-600">Your Points</div>
                </div>
                {isMultiplayer && (
                  <div>
                    <div className="text-lg font-bold text-red-600">{opponentScore}</div>
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

        {/* Waiting for Opponent */}
        {waitingForOpponent && (
          <div className="bg-yellow-50 p-4 rounded shadow mb-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
              <p className="text-yellow-800">Waiting for opponent to answer...</p>
            </div>
          </div>
        )}

        {/* Round Results */}
        {roundResults && (
          <div className="bg-green-50 p-4 rounded shadow mb-4">
            <h3 className="text-lg font-semibold mb-2">Round Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-medium">{roundResults.player1.username}</p>
                <p className={`text-sm ${roundResults.player1.answer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                  {roundResults.player1.answer === currentQuestion.correctAnswer ? 'Correct' : 'Incorrect'}
                </p>
                <p className="text-xs text-gray-600">{roundResults.player1.timeLeft}s left</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{roundResults.player2.username}</p>
                <p className={`text-sm ${roundResults.player2.answer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                  {roundResults.player2.answer === currentQuestion.correctAnswer ? 'Correct' : 'Incorrect'}
                </p>
                <p className="text-xs text-gray-600">{roundResults.player2.timeLeft}s left</p>
              </div>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setRoundResults(null);
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setSelectedAnswer(null);
                    setTimeLeft(30);
                  } else {
                    finishGame();
                  }
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Next Question
              </button>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="bg-white p-6 rounded shadow mb-4">
          <h2 className="text-xl mb-6">{currentQuestion.question}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={waitingForOpponent}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  waitingForOpponent
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : selectedAnswer === index
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

        {/* Next Button */}
        <div className="text-center">
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || waitingForOpponent}
            className={`px-8 py-3 rounded text-white font-medium ${
              selectedAnswer !== null && !waitingForOpponent
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {waitingForOpponent ? 'Waiting for Opponent...' : currentQuestionIndex === questions.length - 1 ? 'Finish Battle' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BattlegroundsGame;
