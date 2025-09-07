// import { useState, useEffect, useRef } from 'react';
// import { useSearchParams, Link, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import { useSocket } from '../contexts/SocketContext';

// function BattlegroundsGame() {
//   const [searchParams] = useSearchParams();
//   const location = useLocation();
//   const { socket } = useSocket();
//   const subject = searchParams.get('subject');
//   const difficulty = searchParams.get('difficulty');
//   const classLevel = searchParams.get('class');
//   const mode = searchParams.get('mode');
//   const isMultiplayer = searchParams.get('multiplayer') === 'true';
//   const invitedFriends = searchParams.get('invitedFriends')?.split(',') || [];

//   // Check if game data was passed from navigation state
//   const gameDataFromState = location.state?.gameData;

//   const [user, setUser] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState(null);
//   const [score, setScore] = useState(0);
//   const [gameId, setGameId] = useState(searchParams.get('gameId') || null);
//   const [timeLeft, setTimeLeft] = useState(30);
//   const timerRef = useRef(null);
//   const [gameState, setGameState] = useState('loading'); // loading, vs-screen, playing, waiting-opponent, finished
//   const [showVsScreen, setShowVsScreen] = useState(false);

//   // Multiplayer state
//   const [opponent, setOpponent] = useState(null);
//   const [opponentScore, setOpponentScore] = useState(0);
//   const [roundResults, setRoundResults] = useState(null);
//   const [finalResults, setFinalResults] = useState(null);

//   // Monitor gameState changes
//   useEffect(() => {
//     console.log('📊 Game state changed to:', gameState);
//   }, [gameState]);

//   // Monitor questions changes
//   useEffect(() => {
//     console.log('❓ Questions updated:', questions.length, 'questions');
//     if (questions.length > 0) {
//       console.log('📝 First question:', questions[0]);
//     }
//   }, [questions]);

//   useEffect(() => {
//     console.log('🔄 First useEffect running - multiplayer:', isMultiplayer, 'socket:', !!socket, 'gameState:', gameState, 'gameDataFromState:', !!gameDataFromState);
//     // Don't re-run if game has already started
//     if (gameState === 'playing' || gameState === 'finished') return;
    
//     const fetchData = async () => {
//       try {
//         const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
//         setUser(userRes.data);
//         console.log('👤 User loaded in game:', userRes.data.username);

//         if (isMultiplayer) {
//           // Check if we have game data from navigation state
//           if (gameDataFromState) {
//             console.log('🎯 Using game data from navigation state:', gameDataFromState);
//             setOpponent(gameDataFromState.opponent);
//             setGameState('playing');
//             fetchQuestions();
//             return;
//           }
          
//           // Multiplayer mode - wait for game to start
//           setGameState('waiting');
//         } else {
//           // Single player mode - load questions immediately
//           if (mode === 'practice') {
//             // Practice mode - load saved practice questions
//             await loadPracticeQuestions();
//           } else {
//             // Regular single player - generate new questions
//             const questionsRes = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
//             const questionsData = questionsRes.data;
//             const gameQuestions = questionsData.questions.slice(0, 10);
//             setQuestions(gameQuestions);
//             setGameState('playing');
//           }
//         }
//       } catch (err) {
//         console.log('❌ Error loading user in game:', err);
//         alert('Session expired. Please refresh the page and log in again.');
//       }
//     };
//     fetchData();
//   }, [subject, difficulty, classLevel, isMultiplayer, gameDataFromState]);

//   // Socket.IO event listeners for multiplayer
//   useEffect(() => {
//     console.log('🔌 Socket useEffect running - socket:', !!socket, 'isMultiplayer:', isMultiplayer, 'gameState:', gameState, 'socketId:', socket?.id);
//     if (!socket || !isMultiplayer) return;

//     socket.on('game-start', (data) => {
//       console.log('🎮 Game started event received:', data);
//       console.log('🎯 Opponent data:', data.opponent);
//       console.log('🆔 Game ID:', data.gameId);
//       console.log('📚 Questions received:', data.questions?.length || 0);
//       console.log('📝 First question:', data.questions?.[0]?.question);
      
//       setOpponent(data.opponent);
//       setGameId(data.gameId);
      
//       // Set questions from backend
//       if (data.questions && data.questions.length > 0) {
//         setQuestions(data.questions);
//         // Show VS screen first
//         setGameState('vs-screen');
//         setShowVsScreen(true);
        
//         // Transition to playing after VS screen animation
//         setTimeout(() => {
//           setShowVsScreen(false);
//           setGameState('playing');
//           console.log('🔄 Game state set to playing with shared questions');
//         }, 3000); // 3 seconds for VS screen
//       } else {
//         console.error('❌ No questions received from backend');
//         setGameState('error');
//       }
//     });

//     socket.on('round-results', (data) => {
//       console.log('📊 Round results received:', data);
//       console.log('📊 Current score before update:', score);
//       console.log('📊 User loaded:', !!user, user?.username);
      
//       if (!user) {
//         console.log('⚠️ User not loaded yet, ignoring round-results');
//         return;
//       }
      
//       const isPlayer1 = data.player1.username === user.username;
//       const extractScore = (p) => {
//         if (!p) return 0;
//         return Number(p.score ?? p.points ?? 0) || 0;
//       };
//       const newScore = isPlayer1 ? extractScore(data.player1) : extractScore(data.player2);
//       const newOpponentScore = isPlayer1 ? extractScore(data.player2) : extractScore(data.player1);
      
//       console.log('📊 Setting score to:', newScore);
//       console.log('📊 Setting opponent score to:', newOpponentScore);
      
//       console.log('📊 Score state update from', score, 'to', newScore);
//       setScore(newScore);
//       setOpponentScore(newOpponentScore);
      
//       console.log('📊 Score updated to:', newScore);
      
//       if (data.player1.answers && data.player1.answers.length === questions.length &&
//           data.player2.answers && data.player2.answers.length === questions.length) {
//         setGameState('finished');
//       }
//     });

//     socket.on('game-final-results', async (data) => {
//       console.log('🎉 Received final results (raw):', data);

//       const normalizeAnswers = (answersArray) => {
//         if (!Array.isArray(answersArray)) return [];
//         return answersArray.map((a, idx) => {
//           const selected = typeof a.answerIndex === 'number' ? a.answerIndex : (typeof a.selectedAnswer === 'number' ? a.selectedAnswer : -1);
//           const isCorrect = typeof a.isCorrect === 'boolean' ? a.isCorrect : (selected !== -1 && questions[idx] ? selected === questions[idx].correctAnswer : false);
//           let timeTaken = 0;
//           if (typeof a.timeTaken === 'number') {
//             timeTaken = a.timeTaken;
//           } else if (typeof a.timeLeft === 'number') {
//             const limit = questions[idx]?.timeLimit || 30;
//             timeTaken = Math.max(0, limit - a.timeLeft);
//           }
//           return {
//             questionId: a.questionId || a.id || null,
//             selectedAnswer: selected,
//             isCorrect,
//             timeTaken
//           };
//         });
//       };

//       const p1Answers = normalizeAnswers(data.player1?.answers || []);
//       const p2Answers = normalizeAnswers(data.player2?.answers || []);

//       const normalized = {
//         ...data,
//         player1: { ...data.player1, answers: p1Answers },
//         player2: { ...data.player2, answers: p2Answers },
//         answers: {
//           [data.player1?.username]: p1Answers,
//           [data.player2?.username]: p2Answers,
//           [data.player1?.userId]: p1Answers,
//           [data.player2?.userId]: p2Answers
//         }
//       };

//       setFinalResults(normalized);
//       setGameState('finished');

//       try {
//         let myFinalAnswers = [];
//         if (normalized.player1 && user) {
//           const p1Match = (normalized.player1.username === user.username) || (normalized.player1.userId && (String(normalized.player1.userId) === String(user._id) || String(normalized.player1.userId) === String(user.id)));
//           if (p1Match) myFinalAnswers = normalized.player1.answers || [];
//           else myFinalAnswers = normalized.player2?.answers || [];
//         } else {
//           const myKey = user?._id ?? user?.id ?? user?.username;
//           myFinalAnswers = normalized.answers?.[myKey] ?? normalized.answers?.[user?.username] ?? [];
//         }

//         console.log('🧭 Debug: resolved myFinalAnswers length:', myFinalAnswers?.length, 'for user:', user?.username, 'normalized keys:', Object.keys(normalized.answers || {}));

//         if (Array.isArray(myFinalAnswers) && myFinalAnswers.length > 0) {
//           const updatedLocalAnswers = myFinalAnswers.map((a, idx) => ({
//             questionId: a.questionId ?? a.id ?? null,
//             selectedAnswer: typeof a.selectedAnswer === 'number' ? a.selectedAnswer : (typeof a.answerIndex === 'number' ? a.answerIndex : -1),
//             isCorrect: typeof a.isCorrect === 'boolean' ? a.isCorrect : (typeof a.selectedAnswer === 'number' && questions?.[idx] ? a.selectedAnswer === questions[idx].correctAnswer : false),
//             timeTaken: typeof a.timeTaken === 'number' ? a.timeTaken : (typeof a.timeLeft === 'number' ? Math.max(0, (questions?.[idx]?.timeLimit || 30) - a.timeLeft) : 0)
//           }));
//           setAnswers(updatedLocalAnswers);
//         }
//       } catch (e) {
//         console.error('❌ Error updating local answers from final results:', e);
//       }

//       try {
//         if (user) {
//           const playerScore = normalized.player1.username === user.username ? Number(normalized.player1.score ?? normalized.player1.points ?? 0) : Number(normalized.player2.score ?? normalized.player2.points ?? 0);
//           if (!isNaN(playerScore)) {
//             await axios.post('http://localhost:5000/auth/update_points', {
//               points: playerScore
//             }, { withCredentials: true });
//             console.log('💰 Updated user points after multiplayer game:', playerScore);
//           }
//         }
//       } catch (err) {
//         console.error('❌ Error updating points after multiplayer game:', err);
//       }
//     });

//     socket.on('opponent-disconnected', () => {
//       alert('Your opponent disconnected. Game ended.');
//       setGameState('finished');
//     });

//     socket.on('auth-error', (data) => {
//       console.log('🔐 Authentication error:', data);
//       alert('Authentication failed. Please refresh the page and try again.');
//       setGameState('finished');
//     });

//     return () => {
//       socket.off('game-start');
//       socket.off('round-results');
//       socket.off('game-final-results');
//       socket.off('opponent-disconnected');
//       socket.off('auth-error');
//     };
//   }, [socket, isMultiplayer, gameState]);

//   const fetchQuestions = async () => {
//     console.log('🔍 Fetching questions with params:', { subject, difficulty, classLevel, gameId, isMultiplayer });
//     try {
//       let questionsData;

//       if (isMultiplayer && gameId) {
//         try {
//           console.log('🔍 Trying to get stored questions for game:', gameId);
//           const storedResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/game/${gameId}`);
//           questionsData = storedResponse.data;
//           console.log('✅ Loaded stored questions for game');
//         } catch (storedError) {
//           console.log('📝 Stored questions not found, generating new ones...');
//           const generateResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}&gameId=${gameId}`);
//           questionsData = generateResponse.data;
//           console.log('✅ Generated new questions for game');
//         }
//       } else {
//         console.log('🔍 Generating questions for single player');
//         const generateResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
//         questionsData = generateResponse.data;
//         console.log('✅ Generated questions for single player');
//       }

//       console.log('📋 Questions data:', questionsData);

//       let gameQuestions;
//       if (questionsData.questions) {
//         gameQuestions = questionsData.questions.slice(0, 10);
//       } else {
//         gameQuestions = questionsData.slice(0, 10);
//       }

//       console.log('✂️ Sliced questions:', gameQuestions);
//       setQuestions(gameQuestions);
//       console.log('✅ Questions loaded for game:', gameQuestions.length);

//       if (gameQuestions.length === 0) {
//         console.log('⚠️ No questions found for the selected criteria');
//         alert('No questions available for the selected criteria. Please try different settings.');
//         setGameState('waiting');
//       } else {
//         setGameState('playing');
//       }
//     } catch (err) {
//       console.log('❌ Error fetching questions:', err);
//       console.log('❌ Error details:', err.response?.data, err.message);
//       alert('Failed to load questions. Please try again.');
//       setGameState('waiting');
//     }
//   };

//   const loadPracticeQuestions = async () => {
//     console.log('� Loading practice questions with params:', { subject, difficulty, classLevel });
//     try {
//       const response = await axios.get(`http://localhost:5000/api/battlegrounds-questions/practice?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
//       const practiceData = response.data;

//       if (practiceData.questions && practiceData.questions.length > 0) {
//         const shuffledQuestions = practiceData.questions.sort(() => Math.random() - 0.5);
//         const gameQuestions = shuffledQuestions.slice(0, 10);
//         setQuestions(gameQuestions);
//         setGameState('playing');
//         console.log('✅ Practice questions loaded:', gameQuestions.length);
//       } else {
//         console.log('⚠️ No practice questions found for the selected criteria');
//         alert('No practice questions available for the selected criteria. Please play some games first to save questions for practice!');
//         window.location.href = '/battlegrounds';
//       }
//     } catch (err) {
//       console.log('❌ Error loading practice questions:', err);
//       alert('Failed to load practice questions. Please try again.');
//       window.location.href = '/battlegrounds';
//     }
//   };

//   const handleAnswerSelect = (answerIndex) => {
//     if (selectedAnswer !== null) return;

//     const timeSnapshot = timeLeft;
//     setSelectedAnswer(answerIndex);

//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }

//     setTimeout(() => {
//       handleNextQuestion(answerIndex, timeSnapshot);
//     }, 700);
//   };

//   useEffect(() => {
//     if (gameState === 'playing' && timeLeft > 0) {
//       timerRef.current = setTimeout(() => {
//         setTimeLeft(prev => prev - 1);
//       }, 1000);
//       return () => {
//         if (timerRef.current) {
//           clearTimeout(timerRef.current);
//           timerRef.current = null;
//         }
//       };
//     } else if (gameState === 'playing' && timeLeft === 0) {
//       handleNextQuestion(-1, 0);
//     }
//   }, [timeLeft, gameState]);

//   const handleNextQuestion = (submittedAnswer, timeLeftAtSubmit) => {
//     const currentQuestion = questions[currentQuestionIndex];

//     const usedAnswer = typeof submittedAnswer === 'number' ? submittedAnswer : (selectedAnswer !== null ? selectedAnswer : -1);
//     const timeUsed = typeof timeLeftAtSubmit === 'number' ? (30 - timeLeftAtSubmit) : (30 - timeLeft);

//     const newAnswers = [...answers];
//     newAnswers[currentQuestionIndex] = {
//       questionId: currentQuestion.id,
//       selectedAnswer: usedAnswer !== null ? usedAnswer : -1,
//       isCorrect: !isMultiplayer ? (usedAnswer !== null && usedAnswer !== -1 ? usedAnswer === currentQuestion.correctAnswer : false) : null,
//       timeTaken: timeUsed
//     };
//     setAnswers(newAnswers);

//     if (!isMultiplayer) {
//       const isCorrect = usedAnswer !== null && usedAnswer !== -1 ? usedAnswer === currentQuestion.correctAnswer : false;
//       if (isCorrect) {
//         const points = currentQuestion.points + Math.floor((timeLeftAtSubmit ?? timeLeft) / 3);
//         setScore(prevScore => prevScore + points);
//       }
//     }

//     if (isMultiplayer && socket) {
//       socket.emit('submit-answer', {
//         gameId,
//         questionIndex: currentQuestionIndex,
//         answerIndex: usedAnswer !== null ? usedAnswer : -1,
//         timeLeft: typeof timeLeftAtSubmit === 'number' ? timeLeftAtSubmit : timeLeft
//       });
      
//       if (currentQuestionIndex < questions.length - 1) {
//         setCurrentQuestionIndex(currentQuestionIndex + 1);
//         setSelectedAnswer(null);
//         setTimeLeft(30);
//       } else {
//         socket.emit('game-complete', { gameId });
//         setGameState('waiting-opponent');
//       }
//     } else {
//       if (currentQuestionIndex < questions.length - 1) {
//         setCurrentQuestionIndex(currentQuestionIndex + 1);
//         setSelectedAnswer(null);
//         setTimeLeft(30);
//       } else {
//         finishGame();
//       }
//     }
//   };

//   const finishGame = async () => {
//     console.log('🎮 Game completion initiated');

//     const computeFinalScore = () => {
//       try {
//         if (!questions || questions.length === 0) return 0;
//         let total = 0;
//         for (let i = 0; i < answers.length; i++) {
//           const ans = answers[i];
//           const q = questions[i];
//           if (!ans || !q) continue;
//           const selected = ans.selectedAnswer;
//           if (selected !== -1 && selected === q.correctAnswer) {
//             const timeTaken = typeof ans.timeTaken === 'number' ? ans.timeTaken : 0;
//             const timeLeftForPoint = Math.max(0, (q.timeLimit || 30) - timeTaken);
//             const bonus = Math.floor(timeLeftForPoint / 3);
//             total += (q.points || 0) + bonus;
//           }
//         }
//         return total;
//       } catch (e) {
//         console.error('❌ Error computing final score:', e);
//         return score || 0;
//       }
//     };

//     if (isMultiplayer && socket) {
//       if (gameId && questions.length > 0 && mode !== 'practice') {
//         try {
//           await axios.post('http://localhost:5000/api/battlegrounds-questions/save-practice', {
//             gameId,
//             subject,
//             difficulty,
//             classLevel,
//             questions
//           });
//           console.log('💾 Saved questions for practice mode');
//         } catch (err) {
//           console.error('❌ Error saving questions:', err);
//         }
//       }
//     } else {
//       setGameState('finished');

//       const finalPoints = computeFinalScore();

//       if (questions.length > 0 && mode !== 'practice') {
//         try {
//           await axios.post('http://localhost:5000/api/battlegrounds-questions/save-practice', {
//             gameId: `single_${Date.now()}`,
//             subject,
//             difficulty,
//             classLevel,
//             questions
//           });
//           console.log('💾 Saved single-player questions for practice mode');
//         } catch (err) {
//           console.log('❌ Error saving single-player questions for practice:', err);
//         }
//       }

//       try {
//         await axios.post('http://localhost:5000/auth/update_points', {
//           points: finalPoints,
//           badge: finalPoints > 200 ? 'Battle Champion' : null
//         }, { withCredentials: true });
//         console.log('💰 Updated user points (single-player):', finalPoints);
//       } catch (err) {
//         console.error('❌ Error updating points after single-player game:', err);
//       }
//     }

//     try {
//       await axios.post('http://localhost:5000/auth/update_points', {
//         points: score,
//         badge: score > 200 ? 'Battle Champion' : null
//       }, { withCredentials: true });
//       console.log('💰 Updated user points');
//     } catch (err) {
//       console.error('❌ Error updating points:', err);
//     }
//   };

//   const getResultMessage = () => {
//     if (mode === 'practice') {
//       return score > 150 ? 'Excellent performance!' : score > 100 ? 'Good job!' : 'Keep practicing!';
//     } else {
//       if (score > opponentScore) {
//         return '🎉 Victory! You won the battle!';
//       } else if (score === opponentScore) {
//         return '🤝 It\'s a tie! Well played!';
//       } else {
//         return '💪 Good effort! Try again next time!';
//       }
//     }
//   };

//   if (gameState === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9AE9FD] mx-auto mb-4"></div>
//           <p className="text-lg font-semibold mb-2 text-[#9AE9FD]">Generating Questions</p>
//           <p className="text-gray-400">AI is creating personalized questions for your battle...</p>
//           <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9AE9FD] mx-auto mb-4"></div>
//           <p className="text-[#9AE9FD]">Loading user data...</p>
//           <p className="text-sm text-gray-400 mt-2">If this takes too long, please log in again.</p>
//         </div>
//       </div>
//     );
//   }

//   if (gameState === 'waiting') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
//           <h2 className="text-2xl mb-4 text-[#9AE9FD]">Finding Opponent</h2>
//           <p className="text-gray-400 mb-2">Looking for another player...</p>
//           <p className="text-sm text-gray-500">Please wait while we match you with an opponent</p>
//           {!user && (
//             <div className="mt-4">
//               <p className="text-sm text-red-400">Loading user data...</p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (gameState === 'vs-screen' || showVsScreen) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
//         <div className="text-center text-white">
//           <div className="mb-8">
//             <h1 className="text-4xl font-bold mb-2 animate-pulse">BATTLEGROUND</h1>
//             <p className="text-xl text-purple-300">Get ready to battle!</p>
//           </div>
          
//           <div className="flex items-center justify-center space-x-8 mb-8">
//             <div className="text-center transform hover:scale-105 transition-transform duration-300">
//               <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <span className="text-2xl font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
//               </div>
//               <p className="text-lg font-semibold">{user?.username}</p>
//               <p className="text-sm text-purple-300">You</p>
//             </div>
            
//             <div className="text-6xl font-bold text-yellow-400 animate-bounce">VS</div>
            
//             <div className="text-center transform hover:scale-105 transition-transform duration-300">
//               <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <span className="text-2xl font-bold">{opponent?.username?.charAt(0).toUpperCase()}</span>
//               </div>
//               <p className="text-lg font-semibold">{opponent?.username}</p>
//               <p className="text-sm text-blue-300">Opponent</p>
//             </div>
//           </div>
          
//           <div className="mb-6">
//             <div className="inline-block bg-black bg-opacity-50 px-6 py-3 rounded-full">
//               <p className="text-lg">Generating battle questions...</p>
//               <div className="flex justify-center mt-2">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//               </div>
//             </div>
//           </div>
          
//           <div className="text-sm text-gray-300">
//             <p>Subject: {subject} • Difficulty: {difficulty} • Class: {classLevel}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (gameState === 'waiting-opponent') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
//           <h2 className="text-2xl mb-4 text-[#9AE9FD]">Quiz Complete!</h2>
//           <p className="text-gray-400 mb-2">Waiting for {opponent?.username} to finish...</p>
//           <p className="text-sm text-gray-500">Your final score: {score} points</p>
//           <div className="mt-6 bg-[#1E3A47] p-4 rounded shadow">
//             <h3 className="text-lg font-semibold mb-2 text-[#9AE9FD]">Your Performance</h3>
//             <div className="grid grid-cols-5 gap-2">
//               {answers.map((answer, index) => (
//                 <div key={index} className={`p-2 rounded text-center text-sm ${
//                   answer.isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
//                 }`}>
//                   Q{index + 1}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (gameState === 'finished') {
//     const resultMessage = finalResults ? 
//       (finalResults.winner === user?.username ? '🎉 Victory!' : finalResults.winner === 'tie' ? '🤝 It\'s a tie!' : '💪 Good effort!') :
//       getResultMessage();

//     return (
//       <div className="min-h-screen bg-[#0A1F2B] p-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-[#1E3A47] p-8 rounded shadow text-center mb-6">
//             <h1 className="text-3xl mb-4 text-[#9AE9FD]">Battle Complete!</h1>
//             <div className="mb-6">
//               <p className="text-xl mb-2 text-white">{resultMessage}</p>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//                 <div className="bg-blue-500/20 p-4 rounded">
//                   <h3 className="text-lg font-semibold text-blue-300">Your Score</h3>
//                   <p className="text-2xl text-blue-400">{score} points</p>
//                   {finalResults && <p className="text-sm text-gray-400">{user?.username}</p>}
//                 </div>
//                 {(isMultiplayer || mode !== 'practice') && (
//                   <div className="bg-red-500/20 p-4 rounded">
//                     <h3 className="text-lg font-semibold text-red-300">
//                       {isMultiplayer ? 'Opponent Score' : 'AI Score'}
//                     </h3>
//                     <p className="text-2xl text-red-400">
//                       {isMultiplayer ? opponentScore : opponentScore} points
//                     </p>
//                     {finalResults && <p className="text-sm text-gray-400">{opponent?.username}</p>}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Detailed Analytics */}
//           <div className="bg-[#1E3A47] p-6 rounded shadow">
//             <h2 className="text-2xl font-semibold mb-6 text-center text-[#9AE9FD]">Battle Analytics</h2>
            
//             <div className="space-y-6">
//               {questions.map((question, index) => {
//                 const userAnswer = answers[index];
//                 let opponentAnswer = null;
//                 if (finalResults) {
//                   const key = opponent?.userId || opponent?.username;
//                   opponentAnswer = finalResults.answers?.[key]?.[index] ??
//                     (finalResults.player1?.username === opponent?.username ? finalResults.player1.answers?.[index] : finalResults.player2?.answers?.[index]);
//                 }
                
//                 return (
//                   <div key={index} className="border border-gray-600 rounded-lg p-4 bg-[#0A1F2B]">
//                     <h3 className="text-lg font-medium mb-3 text-[#9AE9FD]">Question {index + 1}</h3>
//                     <p className="text-gray-300 mb-4">{question.question}</p>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {/* Your Answer */}
//                       <div className="bg-blue-500/20 p-3 rounded">
//                         <h4 className="font-semibold text-blue-300">{user?.username}</h4>
//                         <p className={`text-sm ${userAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
//                           {userAnswer && userAnswer.selectedAnswer !== -1 ? question.options[userAnswer.selectedAnswer] : 'No answer'}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           {userAnswer?.isCorrect ? '✅ Correct' : userAnswer && userAnswer.selectedAnswer === -1 ? '⏰ Time out' : '❌ Incorrect'}
//                         </p>
//                       </div>
                      
//                       {/* Opponent Answer */}
//                       {isMultiplayer && (
//                         <div className="bg-red-500/20 p-3 rounded">
//                           <h4 className="font-semibold text-red-300">{opponent?.username}</h4>
//                           <p className={`text-sm ${opponentAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
//                             {opponentAnswer && opponentAnswer.selectedAnswer !== -1 ? question.options[opponentAnswer.selectedAnswer] : 'No answer'}
//                           </p>
//                           <p className="text-xs text-gray-400 mt-1">
//                             {opponentAnswer?.isCorrect ? '✅ Correct' : opponentAnswer && opponentAnswer.selectedAnswer === -1 ? '⏰ Time out' : '❌ Incorrect'}
//                           </p>
//                         </div>
//                       )}
//                     </div>
                    
//                     {/* Correct Answer */}
//                     <div className="mt-3 p-3 bg-green-500/20 rounded">
//                       <h4 className="font-semibold text-green-300">Correct Answer</h4>
//                       <p className="text-green-400">{question.options[question.correctAnswer]}</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="mt-6 text-center">
//             <div className="flex gap-4 justify-center">
//               <Link to="/battlegrounds/lobby" className="bg-[#9AE9FD] text-[#002732] px-6 py-3 rounded hover:bg-[#7FB3C1] font-bold">
//                 Play Again
//               </Link>
//               <Link to="/leaderboard" className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 font-bold">
//                 View Leaderboard
//               </Link>
//               <Link to="/dashboard" className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 font-bold">
//                 Back to Dashboard
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   if (!currentQuestion) {
//     return <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B] text-[#9AE9FD]">No questions available</div>;
//   }

//   return (
//     <div 
//       className="min-h-screen bg-[linear-gradient(180deg,rgba(10,31,43,1)_0%,rgba(20,78,94,1)_100%)] text-white p-4"
//       style={{ fontFamily: "Inter, sans-serif" }}
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-[#1E3A47] p-6 rounded-3xl shadow mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-[#9AE9FD]">Battlegrounds - {subject}</h1>
//               <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
//               {isMultiplayer && opponent && (
//                 <p className="text-sm text-purple-400">vs {opponent.username}</p>
//               )}
//             </div>
//             <div className="text-right">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-2xl font-bold text-[#9AE9FD]">{score} points</div>
//                   <div className="text-xs text-gray-400">Your Points</div>
//                 </div>
//                 {isMultiplayer && (
//                   <div>
//                     <div className="text-2xl font-bold text-red-400">{opponentScore} points</div>
//                     <div className="text-xs text-gray-400">Opponent</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Timer */}
//         <div className="bg-[#1E3A47] p-4 rounded-2xl shadow mb-6">
//           <div className="flex justify-between items-center">
//             <span className="text-lg font-medium text-white">Time Left:</span>
//             <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-[#9AE9FD]'}`}>
//               {timeLeft}s
//             </span>
//           </div>
//           <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
//             <div
//               className={`h-3 rounded-full transition-all duration-1000 ${
//                 timeLeft <= 10 ? 'bg-red-500' : 'bg-[#9AE9FD]'
//               }`}
//               style={{ width: `${(timeLeft / 30) * 100}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Question */}
//         <div className="bg-[#7FB3C1] p-8 rounded-3xl shadow mb-6">
//           <div className="bg-[#5A9AA8] rounded-2xl p-6 mb-6">
//             <div className="flex items-start gap-4">
//               <div className="text-6xl font-black text-[#002732]">Q.</div>
//               <div className="flex-1">
//                 <h2 className="text-2xl font-medium text-[#002732] leading-relaxed">
//                   {currentQuestion.question}
//                 </h2>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {currentQuestion.options.map((option, index) => {
//               // Determine classes based on whether an answer was selected and correctness
//               let optionClass = 'bg-[#002732] text-white hover:bg-[#1E2A32]';
//               if (selectedAnswer !== null) {
//                 // After selection: highlight correct answer green, selected wrong answer red, others muted
//                 if (index === currentQuestion.correctAnswer) {
//                   optionClass = 'bg-green-500 text-white';
//                 } else if (selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer) {
//                   optionClass = 'bg-red-500 text-white';
//                 } else {
//                   optionClass = 'bg-[#002732] text-gray-300';
//                 }
//               }

//               return (
//                 <button
//                   key={index}
//                   onClick={() => handleAnswerSelect(index)}
//                   disabled={selectedAnswer !== null}
//                   className={`p-4 rounded-xl text-left font-medium transition-all duration-300 ${optionClass}`}
//                 >
//                   <span className="font-bold mr-3 text-lg">
//                     {String.fromCharCode(65 + index)}.
//                   </span>
//                   {option}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Next Button */}
//         <div className="text-center">
//           <button
//             onClick={() => handleNextQuestion(selectedAnswer, timeLeft)}
//             disabled={selectedAnswer === null}
//             className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all ${
//               selectedAnswer !== null 
//                 ? 'bg-[#002732] text-white hover:bg-[#1E2A32]' 
//                 : 'bg-gray-600 text-gray-400 cursor-not-allowed'
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BattlegroundsGame;

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
        alert('Session expired. Please refresh the page and log in again.');
      }
    };
    fetchData();
  }, [subject, difficulty, classLevel, isMultiplayer, gameDataFromState]);

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
      
      if (!user) {
        console.log('⚠️ User not loaded yet, ignoring round-results');
        return;
      }
      
      const isPlayer1 = data.player1.username === user.username;
      const extractScore = (p) => {
        if (!p) return 0;
        return Number(p.score ?? p.points ?? 0) || 0;
      };
      const newScore = isPlayer1 ? extractScore(data.player1) : extractScore(data.player2);
      const newOpponentScore = isPlayer1 ? extractScore(data.player2) : extractScore(data.player1);
      
      console.log('📊 Setting score to:', newScore);
      console.log('📊 Setting opponent score to:', newOpponentScore);
      
      console.log('📊 Score state update from', score, 'to', newScore);
      setScore(newScore);
      setOpponentScore(newOpponentScore);
      
      console.log('📊 Score updated to:', newScore);
      
      if (data.player1.answers && data.player1.answers.length === questions.length &&
          data.player2.answers && data.player2.answers.length === questions.length) {
        setGameState('finished');
      }
    });

    socket.on('game-final-results', async (data) => {
      console.log('🎉 Received final results (raw):', data);

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
          [data.player1?.username]: p1Answers,
          [data.player2?.username]: p2Answers,
          [data.player1?.userId]: p1Answers,
          [data.player2?.userId]: p2Answers
        }
      };

      setFinalResults(normalized);
      setGameState('finished');

      try {
        let myFinalAnswers = [];
        if (normalized.player1 && user) {
          const p1Match = (normalized.player1.username === user.username) || (normalized.player1.userId && (String(normalized.player1.userId) === String(user._id) || String(normalized.player1.userId) === String(user.id)));
          if (p1Match) myFinalAnswers = normalized.player1.answers || [];
          else myFinalAnswers = normalized.player2?.answers || [];
        } else {
          const myKey = user?._id ?? user?.id ?? user?.username;
          myFinalAnswers = normalized.answers?.[myKey] ?? normalized.answers?.[user?.username] ?? [];
        }

        console.log('🧭 Debug: resolved myFinalAnswers length:', myFinalAnswers?.length, 'for user:', user?.username, 'normalized keys:', Object.keys(normalized.answers || {}));

        if (Array.isArray(myFinalAnswers) && myFinalAnswers.length > 0) {
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

    socket.on('auth-error', (data) => {
      console.log('🔐 Authentication error:', data);
      alert('Authentication failed. Please refresh the page and try again.');
      setGameState('finished');
    });

    return () => {
      socket.off('game-start');
      socket.off('round-results');
      socket.off('game-final-results');
      socket.off('opponent-disconnected');
      socket.off('auth-error');
    };
  }, [socket, isMultiplayer, gameState]);

  const fetchQuestions = async () => {
    console.log('🔍 Fetching questions with params:', { subject, difficulty, classLevel, gameId, isMultiplayer });
    try {
      let questionsData;

      if (isMultiplayer && gameId) {
        try {
          console.log('🔍 Trying to get stored questions for game:', gameId);
          const storedResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/game/${gameId}`);
          questionsData = storedResponse.data;
          console.log('✅ Loaded stored questions for game');
        } catch (storedError) {
          console.log('📝 Stored questions not found, generating new ones...');
          const generateResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}&gameId=${gameId}`);
          questionsData = generateResponse.data;
          console.log('✅ Generated new questions for game');
        }
      } else {
        console.log('🔍 Generating questions for single player');
        const generateResponse = await axios.get(`http://localhost:5000/api/battlegrounds-questions/filter?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
        questionsData = generateResponse.data;
        console.log('✅ Generated questions for single player');
      }

      console.log('📋 Questions data:', questionsData);

      let gameQuestions;
      if (questionsData.questions) {
        gameQuestions = questionsData.questions.slice(0, 10);
      } else {
        gameQuestions = questionsData.slice(0, 10);
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
    console.log('📚 Loading practice questions with params:', { subject, difficulty, classLevel });
    try {
      const response = await axios.get(`http://localhost:5000/api/battlegrounds-questions/practice?subject=${subject}&difficulty=${difficulty}&class=${classLevel}`);
      const practiceData = response.data;

      if (practiceData.questions && practiceData.questions.length > 0) {
        const shuffledQuestions = practiceData.questions.sort(() => Math.random() - 0.5);
        const gameQuestions = shuffledQuestions.slice(0, 10);
        setQuestions(gameQuestions);
        setGameState('playing');
        console.log('✅ Practice questions loaded:', gameQuestions.length);
      } else {
        console.log('⚠️ No practice questions found for the selected criteria');
        alert('No practice questions available for the selected criteria. Please play some games first to save questions for practice!');
        window.location.href = '/battlegrounds';
      }
    } catch (err) {
      console.log('❌ Error loading practice questions:', err);
      alert('Failed to load practice questions. Please try again.');
      window.location.href = '/battlegrounds';
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;

    const timeSnapshot = timeLeft;
    setSelectedAnswer(answerIndex);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setTimeout(() => {
      handleNextQuestion(answerIndex, timeSnapshot);
    }, 700);
  };

  useEffect(() => {
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
      handleNextQuestion(-1, 0);
    }
  }, [timeLeft, gameState]);

  const handleNextQuestion = (submittedAnswer, timeLeftAtSubmit) => {
    const currentQuestion = questions[currentQuestionIndex];

    const usedAnswer = typeof submittedAnswer === 'number' ? submittedAnswer : (selectedAnswer !== null ? selectedAnswer : -1);
    const timeUsed = typeof timeLeftAtSubmit === 'number' ? (30 - timeLeftAtSubmit) : (30 - timeLeft);

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedAnswer: usedAnswer !== null ? usedAnswer : -1,
      isCorrect: !isMultiplayer ? (usedAnswer !== null && usedAnswer !== -1 ? usedAnswer === currentQuestion.correctAnswer : false) : null,
      timeTaken: timeUsed
    };
    setAnswers(newAnswers);

    if (!isMultiplayer) {
      const isCorrect = usedAnswer !== null && usedAnswer !== -1 ? usedAnswer === currentQuestion.correctAnswer : false;
      if (isCorrect) {
        const points = currentQuestion.points + Math.floor((timeLeftAtSubmit ?? timeLeft) / 3);
        setScore(prevScore => prevScore + points);
      }
    }

    if (isMultiplayer && socket) {
      socket.emit('submit-answer', {
        gameId,
        questionIndex: currentQuestionIndex,
        answerIndex: usedAnswer !== null ? usedAnswer : -1,
        timeLeft: typeof timeLeftAtSubmit === 'number' ? timeLeftAtSubmit : timeLeft
      });
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        socket.emit('game-complete', { gameId });
        setGameState('waiting-opponent');
      }
    } else {
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
    console.log('🎮 Game completion initiated');

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
      setGameState('finished');

      const finalPoints = computeFinalScore();

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
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9AE9FD] mx-auto mb-4"></div>
          <p className="text-lg font-semibold mb-2 text-[#9AE9FD]">Generating Questions</p>
          <p className="text-gray-400">AI is creating personalized questions for your battle...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9AE9FD] mx-auto mb-4"></div>
          <p className="text-[#9AE9FD]">Loading user data...</p>
          <p className="text-sm text-gray-400 mt-2">If this takes too long, please log in again.</p>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl mb-4 text-[#9AE9FD]">Finding Opponent</h2>
          <p className="text-gray-400 mb-2">Looking for another player...</p>
          <p className="text-sm text-gray-500">Please wait while we match you with an opponent</p>
          {!user && (
            <div className="mt-4">
              <p className="text-sm text-red-400">Loading user data...</p>
            </div>
          )}
        </div>
      </div>
    );
  }


  if (gameState === 'vs-screen' || showVsScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B]">
        <div className="text-center text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 animate-pulse text-[#9AE9FD]">BATTLEGROUND</h1>
            <p className="text-xl text-[#7FB3C1]">Get ready to battle!</p>
          </div>
          
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-[#7FB3C1] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-2xl font-bold text-[#002732]">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-lg font-semibold text-[#9AE9FD]">{user?.username}</p>
              <p className="text-sm text-[#7FB3C1]">You</p>
            </div>
            
            <div className="text-6xl font-bold text-[#9AE9FD] animate-bounce">VS</div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 bg-[#1E3A47] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <span className="text-2xl font-bold text-[#9AE9FD]">{opponent?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-lg font-semibold text-[#9AE9FD]">{opponent?.username}</p>
              <p className="text-sm text-[#7FB3C1]">Opponent</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="inline-block bg-[#1E3A47] px-6 py-3 rounded-full shadow-lg">
              <p className="text-lg text-[#9AE9FD]">Generating battle questions...</p>
              <div className="flex justify-center mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9AE9FD]"></div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-[#7FB3C1]">
            <p>Subject: {subject} • Difficulty: {difficulty} • Class: {classLevel}</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting-opponent') {
    return (
      <div className="min-h-screen bg-[#0A1F2B] p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1E3A47] p-8 rounded-3xl shadow text-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9AE9FD] mx-auto mb-6"></div>
            <h2 className="text-3xl mb-4 text-[#9AE9FD] font-bold">Quiz Complete!</h2>
            <p className="text-lg text-gray-300 mb-2">Waiting for {opponent?.username} to finish...</p>
            <div className="bg-[#7FB3C1] p-4 rounded-2xl mb-6 inline-block">
              <p className="text-2xl font-bold text-[#002732]">{score} points</p>
              <p className="text-sm text-[#002732]">Your Final Score</p>
            </div>
          </div>

          {/* Enhanced Performance Preview */}
          
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const resultMessage = finalResults ? 
      (finalResults.winner === user?.username ? '🎉 Victory!' : finalResults.winner === 'tie' ? '🤝 It\'s a tie!' : '💪 Good effort!') :
      getResultMessage();

    return (
      <div className="min-h-screen bg-[#0A1F2B] p-4">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Results Header */}
          <div className="bg-[#1E3A47] p-8 rounded-3xl shadow text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-[#9AE9FD] rounded-full flex items-center justify-center mr-4 shadow-lg">
                <span className="text-3xl">🎮</span>
              </div>
              <h1 className="text-4xl font-bold text-[#9AE9FD]">Battle Complete!</h1>
            </div>
            
            <div className="mb-6">
              <p className="text-2xl mb-4 text-white font-semibold">{resultMessage}</p>
              
              {/* Enhanced Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
                <div className="bg-[#7FB3C1] p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-[#002732] rounded-full flex items-center justify-center mr-3">
                      <span className="text-xl font-bold text-[#9AE9FD]">{user?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#002732]">Your Score</h3>
                      {finalResults && <p className="text-sm text-[#002732]/70">{user?.username}</p>}
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-[#002732]">{score}</p>
                  <p className="text-sm text-[#002732]/70">points</p>
                </div>
                
                {(isMultiplayer || mode !== 'practice') && (
                  <div className="bg-[#002732] p-6 rounded-2xl shadow-lg border-2 border-[#1E3A47] transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-[#1E3A47] rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl font-bold text-[#9AE9FD]">
                          {isMultiplayer ? opponent?.username?.charAt(0).toUpperCase() : 'AI'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#9AE9FD]">
                          {isMultiplayer ? 'Opponent Score' : 'AI Score'}
                        </h3>
                        {finalResults && <p className="text-sm text-[#7FB3C1]">{opponent?.username}</p>}
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-[#9AE9FD]">{opponentScore}</p>
                    <p className="text-sm text-[#7FB3C1]">points</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Battle Analytics */}
          <div className="bg-[#1E3A47] p-6 rounded-3xl shadow">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-[#9AE9FD] rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-3xl font-bold text-[#9AE9FD]">Battle Analytics</h2>
            </div>
            
            <div className="space-y-8">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                let opponentAnswer = null;
                if (finalResults) {
                  const key = opponent?.userId || opponent?.username;
                  opponentAnswer = finalResults.answers?.[key]?.[index] ??
                    (finalResults.player1?.username === opponent?.username ? finalResults.player1.answers?.[index] : finalResults.player2?.answers?.[index]);
                }
                
                return (
                  <div key={index} className="bg-[#0A1F2B] rounded-2xl p-6 shadow-lg border border-[#002732]">
                    {/* Question Header */}
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-[#9AE9FD] rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-lg font-bold text-[#002732]">{index + 1}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-[#9AE9FD]">Question {index + 1}</h3>
                    </div>
                    
                    {/* Question Text */}
                    <div className="bg-[#7FB3C1]/10 p-4 rounded-xl mb-6 border border-[#7FB3C1]/20">
                      <p className="text-lg text-gray-200 leading-relaxed">{question.question}</p>
                    </div>
                    
                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Your Answer */}
                      <div className="bg-[#7FB3C1]/20 p-4 rounded-xl border border-[#7FB3C1]/30">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-[#7FB3C1] rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-[#002732]">{user?.username?.charAt(0).toUpperCase()}</span>
                          </div>
                          <h4 className="font-bold text-[#7FB3C1]">Your Answer</h4>
                        </div>
                        
                        <div className="bg-[#002732] p-3 rounded-lg mb-3">
                          <p className={`font-medium ${userAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {userAnswer && userAnswer.selectedAnswer !== -1 ? 
                              `${String.fromCharCode(65 + userAnswer.selectedAnswer)}. ${question.options[userAnswer.selectedAnswer]}` : 
                              'No answer selected'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            userAnswer?.isCorrect ? 'bg-green-500/20 text-green-400' : 
                            userAnswer && userAnswer.selectedAnswer === -1 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {userAnswer?.isCorrect ? '✅ Correct' : 
                             userAnswer && userAnswer.selectedAnswer === -1 ? '⏰ Timeout' : '❌ Incorrect'}
                          </span>
                          {userAnswer?.timeTaken && (
                            <span className="text-xs text-gray-400">
                              {userAnswer.timeTaken}s
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Opponent Answer */}
                      {isMultiplayer && (
                        <div className="bg-[#1E3A47]/50 p-4 rounded-xl border border-[#1E3A47]">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-[#1E3A47] rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-bold text-[#9AE9FD]">{opponent?.username?.charAt(0).toUpperCase()}</span>
                            </div>
                            <h4 className="font-bold text-[#9AE9FD]">{opponent?.username}</h4>
                          </div>
                          
                          <div className="bg-[#002732] p-3 rounded-lg mb-3">
                            <p className={`font-medium ${opponentAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {opponentAnswer && opponentAnswer.selectedAnswer !== -1 ? 
                                `${String.fromCharCode(65 + opponentAnswer.selectedAnswer)}. ${question.options[opponentAnswer.selectedAnswer]}` : 
                                'No answer selected'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              opponentAnswer?.isCorrect ? 'bg-green-500/20 text-green-400' : 
                              opponentAnswer && opponentAnswer.selectedAnswer === -1 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {opponentAnswer?.isCorrect ? '✅ Correct' : 
                               opponentAnswer && opponentAnswer.selectedAnswer === -1 ? '⏰ Timeout' : '❌ Incorrect'}
                            </span>
                            {opponentAnswer?.timeTaken && (
                              <span className="text-xs text-gray-400">
                                {opponentAnswer.timeTaken}s
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Correct Answer */}
                    <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm">✓</span>
                        </span>
                        <h4 className="font-bold text-green-400">Correct Answer</h4>
                      </div>
                      <p className="text-green-300 font-medium">
                        {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/battlegrounds/lobby" 
                className="bg-[#9AE9FD] text-[#002732] px-8 py-4 rounded-2xl hover:bg-[#7FB3C1] font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Play Again
              </Link>
              <Link 
                to="/leaderboard" 
                className="bg-[#7FB3C1] text-[#002732] px-8 py-4 rounded-2xl hover:bg-[#5A9AA8] font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                View Leaderboard
              </Link>
              <Link 
                to="/dashboard" 
                className="bg-[#1E3A47] text-[#9AE9FD] px-8 py-4 rounded-2xl hover:bg-[#2A4A57] font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-[#9AE9FD]/30"
              >
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
    return <div className="min-h-screen flex items-center justify-center bg-[#0A1F2B] text-[#9AE9FD]">No questions available</div>;
  }

  return (
    <div 
      className="min-h-screen bg-[linear-gradient(180deg,rgba(10,31,43,1)_0%,rgba(20,78,94,1)_100%)] text-white p-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[#1E3A47] p-6 rounded-3xl shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#9AE9FD]">Battlegrounds - {subject}</h1>
              <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
              {isMultiplayer && opponent && (
                <p className="text-sm text-purple-400">vs {opponent.username}</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-[#9AE9FD]">{score} points</div>
                  <div className="text-xs text-gray-400">Your Points</div>
                </div>
                {isMultiplayer && (
                  <div>
                    <div className="text-2xl font-bold text-red-400">{opponentScore} points</div>
                    <div className="text-xs text-gray-400">Opponent</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-[#1E3A47] p-4 rounded-2xl shadow mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-white">Time Left:</span>
            <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-[#9AE9FD]'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                timeLeft <= 10 ? 'bg-red-500' : 'bg-[#9AE9FD]'
              }`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-[#7FB3C1] p-8 rounded-3xl shadow mb-6">
          <div className="bg-[#5A9AA8] rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-6xl font-black text-[#002732]">Q.</div>
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-[#002732] leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              // Determine classes based on whether an answer was selected and correctness
              let optionClass = 'bg-[#002732] text-white hover:bg-[#1E2A32]';
              if (selectedAnswer !== null) {
                // After selection: highlight correct answer green, selected wrong answer red, others muted
                if (index === currentQuestion.correctAnswer) {
                  optionClass = 'bg-green-500 text-white';
                } else if (selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer) {
                  optionClass = 'bg-red-500 text-white';
                } else {
                  optionClass = 'bg-[#002732] text-gray-300';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-xl text-left font-medium transition-all duration-300 ${optionClass}`}
                >
                  <span className="font-bold mr-3 text-lg">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <div className="text-center">
          <button
            onClick={() => handleNextQuestion(selectedAnswer, timeLeft)}
            disabled={selectedAnswer === null}
            className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all ${
              selectedAnswer !== null 
                ? 'bg-[#002732] text-white hover:bg-[#1E2A32]' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default BattlegroundsGame;