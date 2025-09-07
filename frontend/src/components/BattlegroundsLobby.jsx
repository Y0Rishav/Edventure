// import { useState, useEffect } from 'react';
// import { useSearchParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useSocket } from '../contexts/SocketContext';

// function BattlegroundsLobby() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { socket, isConnected } = useSocket();

//   const [user, setUser] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [selectedDifficulty, setSelectedDifficulty] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedMode, setSelectedMode] = useState('solo');
//   const [friends, setFriends] = useState([]);
//   const [invitedFriends, setInvitedFriends] = useState([]);
//   const [isWaiting, setIsWaiting] = useState(false);
//   const [waitingMessage, setWaitingMessage] = useState('');
//   const [gameStarting, setGameStarting] = useState(false);

//   const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
//   const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
//   const classes = Array.from({length: 12}, (_, i) => i + 1);
//   const modes = [
//     { value: 'practice', label: 'Practice', description: 'Practice without competing' },
//     { value: 'solo', label: 'Solo', description: 'Compete against Real Players' }
//   ];

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
//         setUser(res.data);
//         console.log('👤 User loaded:', res.data.username);
//         // Set default class based on user's class
//         if (res.data.class) {
//           setSelectedClass(res.data.class.toString());
//         }
//       } catch (err) {
//         console.log('❌ Error loading user:', err);
//         // Show error message instead of auto-redirect
//         alert('Session expired. Please refresh the page and log in again.');
//         // Don't auto-redirect, let user handle it
//         // window.location.href = '/';
//       }
//     };
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     console.log('🎯 BattlegroundsLobby useEffect - socket:', !!socket, 'socketId:', socket?.id);
//     if (!socket) return;

//     // Listen for game start
//     socket.on('game-start', (data) => {
//       console.log('🎮 Game starting in Lobby:', data, 'socketId:', socket?.id);
//       setGameStarting(true);
//       setWaitingMessage('Game starting...');
      
//       // Navigate to game with multiplayer parameters and pass game data as state
//       setTimeout(() => {
//         navigate(`/battlegrounds/game?gameId=${data.gameId}&subject=${data.subject}&difficulty=${data.difficulty}&class=${data.classLevel}&mode=${data.mode}&multiplayer=true`, {
//           state: { gameData: data }
//         });
//       }, 2000);
//     });

//     // Listen for waiting status
//     socket.on('waiting-for-opponent', (data) => {
//       console.log('⏳ Waiting for opponent:', data);
//       setIsWaiting(true);
//       setWaitingMessage(`Waiting for opponent... (${data.position}/2 players)`);
//     });

//     // Listen for opponent disconnection
//     socket.on('opponent-disconnected', () => {
//       console.log('👋 Opponent disconnected');
//       setIsWaiting(false);
//       setWaitingMessage('Opponent disconnected. Please try again.');
//       setTimeout(() => {
//         setWaitingMessage('');
//       }, 3000);
//     });

//     // Listen for already in room
//     socket.on('already-in-room', (data) => {
//       console.log('⚠️ Already in room:', data);
//       setWaitingMessage('You are already in this room. Please wait or refresh the page.');
//       setIsWaiting(false);
//     });

//     return () => {
//       socket.off('game-start');
//       socket.off('waiting-for-opponent');
//       socket.off('opponent-disconnected');
//       socket.off('already-in-room');
//     };
//   }, [socket, navigate]);

//   const handleInviteFriend = (friendId) => {
//     if (!invitedFriends.includes(friendId)) {
//       setInvitedFriends([...invitedFriends, friendId]);
//     }
//   };

//   const handleStartMatch = () => {
//     console.log('🔍 Debug info:', {
//       socket: !!socket,
//       isConnected,
//       user: user ? user.username : 'null',
//       selectedSubject,
//       selectedDifficulty,
//       selectedClass,
//       selectedMode
//     });

//     if (!user) {
//       alert('Please log in first.');
//       console.log('❌ User not logged in');
//       return;
//     }

//     if (!selectedSubject || !selectedDifficulty || !selectedClass) {
//       alert('Please select all options before starting.');
//       return;
//     }

//     // Practice mode - navigate directly and generate questions server-side without matchmaking
//     if (selectedMode === 'practice') {
//       console.log('📚 Starting practice mode');
//       navigate(`/battlegrounds/game?subject=${selectedSubject}&difficulty=${selectedDifficulty}&class=${selectedClass}&mode=practice&multiplayer=false`);
//       return;
//     }

//     // Solo competitive - require socket connection
//     if (!socket || !isConnected) {
//       alert('Not connected to server. Please try again.');
//       console.log('❌ Socket not connected:', { socket: !!socket, isConnected });
//       return;
//     }

//     // Emit a concise join message for 1v1 match
//     const payload = {
//       userId: user._id,
//       username: user.username,
//       subject: selectedSubject,
//       difficulty: selectedDifficulty,
//       classLevel: selectedClass,
//       mode: 'solo'
//     };
//     socket.emit('join-lobby', payload);
//     console.log('🚀 Emitted join-lobby for solo match:', payload);

//     setIsWaiting(true);
//     setWaitingMessage('Finding opponent...');
//   };

//   if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <header className="bg-blue-600 text-white p-4 mb-4 flex justify-between items-center">
//         <h1 className="text-2xl">Battlegrounds Lobby</h1>
//         <div className="flex items-center gap-4">
//           <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
//             isConnected ? 'bg-green-500' : 'bg-red-500'
//           }`}>
//             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-200' : 'bg-red-200'}`}></div>
//             {isConnected ? 'Connected' : 'Disconnected'}
//           </div>
//           <Link to="/battlegrounds" className="text-white underline">Back to Battlegrounds</Link>
//         </div>
//       </header>

//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white p-6 rounded shadow mb-6">
//           <h2 className="text-xl mb-4">Configure Your Battle</h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Subject Selection */}
//             <div>
//               <label className="block text-sm font-medium mb-2">Subject</label>
//               <select
//                 value={selectedSubject}
//                 onChange={(e) => setSelectedSubject(e.target.value)}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="">Select Subject</option>
//                 {subjects.map(subject => (
//                   <option key={subject} value={subject}>{subject}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Difficulty Selection */}
//             <div>
//               <label className="block text-sm font-medium mb-2">Difficulty</label>
//               <select
//                 value={selectedDifficulty}
//                 onChange={(e) => setSelectedDifficulty(e.target.value)}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="">Select Difficulty</option>
//                 {difficulties.map(difficulty => (
//                   <option key={difficulty} value={difficulty}>
//                     {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Class Selection */}
//             <div>
//               <label className="block text-sm font-medium mb-2">Class</label>
//               <select
//                 value={selectedClass}
//                 onChange={(e) => setSelectedClass(e.target.value)}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="">Select Class</option>
//                 {classes.map(cls => (
//                   <option key={cls} value={cls}>Class {cls}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Mode Selection */}
//             <div>
//               <label className="block text-sm font-medium mb-2">Game Mode</label>
//               <select
//                 value={selectedMode}
//                 onChange={(e) => setSelectedMode(e.target.value)}
//                 className="w-full p-2 border rounded"
//               >
//                 {modes.map(mode => (
//                   <option key={mode.value} value={mode.value}>{mode.label}</option>
//                 ))}
//               </select>
//               <p className="text-xs text-gray-600 mt-1">
//                 {modes.find(m => m.value === selectedMode)?.description}
//               </p>
//             </div>
//           </div>
//         </div>

  
//         {/* Start Match Button */}
//         <div className="bg-white p-6 rounded shadow">
//           <div className="text-center">
//             <h3 className="text-lg mb-4">Ready to Battle?</h3>
//             <button
//               onClick={handleStartMatch}
//               disabled={!selectedSubject || !selectedDifficulty || !selectedClass || isWaiting}
//               className={`px-8 py-3 rounded text-white font-medium ${
//                 selectedSubject && selectedDifficulty && selectedClass && !isWaiting
//                   ? 'bg-green-500 hover:bg-green-600'
//                   : 'bg-gray-300 cursor-not-allowed'
//               }`}
//             >
//               {isWaiting ? 'Finding Opponent...' : 'Start Match'}
//             </button>
//             {(!selectedSubject || !selectedDifficulty || !selectedClass) && (
//               <p className="text-sm text-gray-600 mt-2">Please select subject, difficulty, and class to continue</p>
//             )}
//             {!isConnected && (
//               <p className="text-sm text-red-600 mt-2">⚠️ Not connected to server</p>
//             )}
//           </div>
//         </div>

//         {/* Waiting State */}
//         {isWaiting && !gameStarting && (
//           <div className="bg-blue-50 p-6 rounded shadow mt-6">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//               <h3 className="text-lg font-semibold mb-2">Finding Opponent</h3>
//               <p className="text-gray-600">{waitingMessage}</p>
//               <div className="mt-4">
//                 <div className="inline-block animate-pulse">
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Game Starting Animation */}
//         {gameStarting && (
//           <div className="bg-green-50 p-6 rounded shadow mt-6">
//             <div className="text-center">
//               <div className="animate-bounce mb-4">
//                 <span className="text-4xl">⚔️</span>
//               </div>
//               <h3 className="text-lg font-semibold mb-2 text-green-800">Game Starting!</h3>
//               <p className="text-green-600">Get ready for battle...</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default BattlegroundsLobby;


// import { useState, useEffect } from 'react';
// import { useSearchParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useSocket } from '../contexts/SocketContext';

// // Icon Components
// const SwordIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M14.5 17.5L3 6L6 3L17.5 14.5L14.5 17.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <path d="M13 19L19 13L21 15L15 21L13 19Z" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const FlaskIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M9 3H15M9 3V9L4.5 21H19.5L15 9V3" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <path d="M6.5 15H17.5" stroke="currentColor" strokeWidth="2"/>
//   </svg>
// );

// const CompassIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const AtomIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="12" cy="12" r="1" fill="currentColor"/>
//     <path d="M20.2 20.2C13.8 27.5 4 23.4 4 16V12C4 8.1 11.2 0.4 20.2 3.8" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <path d="M3.8 3.8C10.2 -3.5 20 0.6 20 8V12C20 15.9 12.8 23.6 3.8 20.2" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const DNAIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M9 3C9 3 9 9 12 9S15 3 15 3M9 21C9 21 9 15 12 15S15 21 15 21" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <path d="M20 9C16 9 12 12 12 12S8 9 4 9M4 15C8 15 12 12 12 12S16 15 20 15" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const UserIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const EditIcon = () => (
//   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" fill="none"/>
//     <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const ChevronLeftIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// const ChevronRightIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" fill="none"/>
//   </svg>
// );

// function BattlegroundsLobby() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { socket, isConnected } = useSocket();

//   const [user, setUser] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [selectedDifficulty, setSelectedDifficulty] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedMode, setSelectedMode] = useState('solo');
//   const [friends, setFriends] = useState([]);
//   const [invitedFriends, setInvitedFriends] = useState([]);
//   const [isWaiting, setIsWaiting] = useState(false);
//   const [waitingMessage, setWaitingMessage] = useState('');
//   const [gameStarting, setGameStarting] = useState(false);
//   const [classSlideIndex, setClassSlideIndex] = useState(0);

//   const subjects = [
//     { name: 'Chemistry', icon: <FlaskIcon /> },
//     { name: 'Mathematics', icon: <CompassIcon /> },
//     { name: 'Physics', icon: <AtomIcon /> },
//     { name: 'Biology', icon: <DNAIcon /> }
//   ];
  
//   const difficulties = [
//     { name: 'beginner', label: 'B', color: 'bg-blue-500' },
//     { name: 'intermediate', label: 'I', color: 'bg-blue-600' },
//     { name: 'advanced', label: 'A', color: 'bg-blue-700' },
//     { name: 'expert', label: 'E', color: 'bg-blue-800' }
//   ];
  
//   // All 12 classes
//   const allClasses = Array.from({length: 12}, (_, i) => ({
//     number: i + 1,
//     label: `Class ${i + 1}`
//   }));
  
//   // Show 4 classes at a time
//   const classesPerPage = 4;
//   const maxSlideIndex = Math.ceil(allClasses.length / classesPerPage) - 1;
//   const visibleClasses = allClasses.slice(
//     classSlideIndex * classesPerPage, 
//     (classSlideIndex + 1) * classesPerPage
//   );
  
//   const modes = [
//     { value: 'practice', label: 'Practice', description: 'Practice without competing', icon: <EditIcon /> },
//     { value: 'solo', label: '1 v 1', description: 'Compete against Real Players', icon: <UserIcon /> }
//   ];

//   const handleClassSlideNext = () => {
//     if (classSlideIndex < maxSlideIndex) {
//       setClassSlideIndex(classSlideIndex + 1);
//     }
//   };

//   const handleClassSlidePrev = () => {
//     if (classSlideIndex > 0) {
//       setClassSlideIndex(classSlideIndex - 1);
//     }
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
//         setUser(res.data);
//         console.log('👤 User loaded:', res.data.username);
//         if (res.data.class) {
//           setSelectedClass(res.data.class.toString());
//           // Set slide index to show user's class
//           const userClassIndex = Math.floor((res.data.class - 1) / classesPerPage);
//           setClassSlideIndex(userClassIndex);
//         }
//       } catch (err) {
//         console.log('❌ Error loading user:', err);
//         alert('Session expired. Please refresh the page and log in again.');
//       }
//     };
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     console.log('🎯 BattlegroundsLobby useEffect - socket:', !!socket, 'socketId:', socket?.id);
//     if (!socket) return;

//     socket.on('game-start', (data) => {
//       console.log('🎮 Game starting in Lobby:', data, 'socketId:', socket?.id);
//       setGameStarting(true);
//       setWaitingMessage('Game starting...');
      
//       setTimeout(() => {
//         navigate(`/battlegrounds/game?gameId=${data.gameId}&subject=${data.subject}&difficulty=${data.difficulty}&class=${data.classLevel}&mode=${data.mode}&multiplayer=true`, {
//           state: { gameData: data }
//         });
//       }, 2000);
//     });

//     socket.on('waiting-for-opponent', (data) => {
//       console.log('⏳ Waiting for opponent:', data);
//       setIsWaiting(true);
//       setWaitingMessage(`Waiting for opponent... (${data.position}/2 players)`);
//     });

//     socket.on('opponent-disconnected', () => {
//       console.log('👋 Opponent disconnected');
//       setIsWaiting(false);
//       setWaitingMessage('Opponent disconnected. Please try again.');
//       setTimeout(() => {
//         setWaitingMessage('');
//       }, 3000);
//     });

//     socket.on('already-in-room', (data) => {
//       console.log('⚠️ Already in room:', data);
//       setWaitingMessage('You are already in this room. Please wait or refresh the page.');
//       setIsWaiting(false);
//     });

//     socket.on('auth-error', (data) => {
//       console.log('🔐 Authentication error:', data);
//       setWaitingMessage('Authentication failed. Please refresh the page and try again.');
//       setIsWaiting(false);
//     });

//     return () => {
//       socket.off('game-start');
//       socket.off('waiting-for-opponent');
//       socket.off('opponent-disconnected');
//       socket.off('already-in-room');
//       socket.off('auth-error');
//     };
//   }, [socket, navigate]);

//   const handleInviteFriend = (friendId) => {
//     if (!invitedFriends.includes(friendId)) {
//       setInvitedFriends([...invitedFriends, friendId]);
//     }
//   };

//   const handleStartMatch = () => {
//     console.log('🔍 Debug info:', {
//       socket: !!socket,
//       isConnected,
//       user: user ? user.username : 'null',
//       selectedSubject,
//       selectedDifficulty,
//       selectedClass,
//       selectedMode
//     });

//     if (!user) {
//       alert('Please log in first.');
//       console.log('❌ User not logged in');
//       return;
//     }

//     if (!selectedSubject || !selectedDifficulty || !selectedClass) {
//       alert('Please select all options before starting.');
//       return;
//     }

//     if (selectedMode === 'practice') {
//       console.log('📚 Starting practice mode');
//       navigate(`/battlegrounds/game?subject=${selectedSubject}&difficulty=${selectedDifficulty}&class=${selectedClass}&mode=practice&multiplayer=false`);
//       return;
//     }

//     if (!socket || !isConnected) {
//       alert('Not connected to server. Please try again.');
//       console.log('❌ Socket not connected:', { socket: !!socket, isConnected });
//       return;
//     }

//     const payload = {
//       userId: user._id,
//       username: user.username,
//       subject: selectedSubject,
//       difficulty: selectedDifficulty,
//       classLevel: selectedClass,
//       mode: 'solo'
//     };
//     socket.emit('join-lobby', payload);
//     console.log('🚀 Emitted join-lobby for solo match:', payload);

//     setIsWaiting(true);
//     setWaitingMessage('Finding opponent...');
//   };

//   if (!user) return (
//     <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
//       <div className="text-[#9AE9FD] text-xl">Loading...</div>
//     </div>
//   );

//   return (
//     <div 
//       className="min-h-screen bg-[linear-gradient(180deg,rgba(10,31,43,1)_0%,rgba(20,78,94,1)_100%)] text-white p-8"
//       style={{ fontFamily: "Inter, sans-serif" }}
//     >
//       {/* Header */}
//       <div className="bg-[#7FB3C1] rounded-3xl p-6 mb-8 relative overflow-hidden">
//         <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
//           <div className="flex items-center gap-2">
//             <SwordIcon />
//             <SwordIcon />
//           </div>
//         </div>
//         <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
//           <div className="flex items-center gap-2">
//             <SwordIcon />
//             <SwordIcon />
//           </div>
//         </div>
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-[#002732] mb-2">
//             Let the Academic Field Battle Begin!
//           </h1>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto space-y-12">
//         {/* Choose your weapon */}
//         <div>
//           <div className="flex items-center gap-4 mb-8">
//             <div className="bg-[#1E4A3A] px-6 py-3 rounded-full flex items-center gap-3">
//               <SwordIcon />
//               <span className="text-lg font-semibold text-white">Choose your weapon</span>
//             </div>
//             <div className="flex-1 h-px bg-[#1E4A3A]"></div>
//             <div className="bg-[#1E4A3A] p-3 rounded-full">
//               <ChevronRightIcon />
//             </div>
//           </div>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {subjects.map(subject => (
//               <button
//                 key={subject.name}
//                 onClick={() => setSelectedSubject(subject.name)}
//                 className={`group relative bg-[#2A5F5A] rounded-full w-32 h-32 mx-auto flex flex-col items-center justify-center border-4 transition-all duration-300 hover:scale-110 ${
//                   selectedSubject === subject.name 
//                     ? 'border-[#9AE9FD] bg-[#1E4A3A]' 
//                     : 'border-white/30 hover:border-[#9AE9FD]/50'
//                 }`}
//               >
//                 <div className="text-white mb-2 group-hover:scale-110 transition-transform">
//                   {subject.icon}
//                 </div>
//                 <span className="text-white text-sm font-medium">{subject.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Choose difficulty */}
//         <div>
//           <div className="flex items-center gap-4 mb-8">
//             <div className="bg-[#1E3A4A] px-6 py-3 rounded-full flex items-center gap-3">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="white" strokeWidth="2" fill="none"/>
//               </svg>
//               <span className="text-lg font-semibold text-white">Choose difficulty</span>
//             </div>
//             <div className="flex-1 h-px bg-[#1E3A4A]"></div>
//           </div>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {difficulties.map(difficulty => (
//               <button
//                 key={difficulty.name}
//                 onClick={() => setSelectedDifficulty(difficulty.name)}
//                 className={`group relative ${difficulty.color} rounded-full w-32 h-32 mx-auto flex flex-col items-center justify-center border-4 transition-all duration-300 hover:scale-110 ${
//                   selectedDifficulty === difficulty.name 
//                     ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30' 
//                     : 'border-white/30 hover:border-[#9AE9FD]/50'
//                 }`}
//               >
//                 <div className="text-6xl font-black text-white mb-1">{difficulty.label}</div>
//                 <span className="text-white text-sm font-medium capitalize">{difficulty.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Choose your level - with slider */}
//         <div>
//           <div className="flex items-center gap-4 mb-8">
//             <div className="bg-[#4A5F6A] px-6 py-3 rounded-full flex items-center gap-3">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5 12,2" stroke="white" strokeWidth="2" fill="none"/>
//                 <polygon points="12,8 18,12 12,16 6,12 12,8" stroke="white" strokeWidth="2" fill="none"/>
//               </svg>
//               <span className="text-lg font-semibold text-white">Choose your level</span>
//             </div>
//             <div className="flex-1 h-px bg-[#4A5F6A]"></div>
//             <button 
//               onClick={handleClassSlidePrev}
//               disabled={classSlideIndex === 0}
//               className={`bg-[#4A5F6A] p-3 rounded-full transition-all ${
//                 classSlideIndex === 0 
//                   ? 'opacity-50 cursor-not-allowed' 
//                   : 'hover:bg-[#5A6F7A]'
//               }`}
//             >
//               <ChevronLeftIcon />
//             </button>
//             <button 
//               onClick={handleClassSlideNext}
//               disabled={classSlideIndex === maxSlideIndex}
//               className={`bg-[#4A5F6A] p-3 rounded-full transition-all ${
//                 classSlideIndex === maxSlideIndex 
//                   ? 'opacity-50 cursor-not-allowed' 
//                   : 'hover:bg-[#5A6F7A]'
//               }`}
//             >
//               <ChevronRightIcon />
//             </button>
//           </div>
          
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {visibleClasses.map(cls => (
//               <button
//                 key={cls.number}
//                 onClick={() => setSelectedClass(cls.number.toString())}
//                 className={`group relative bg-[#5A6F7A] rounded-full w-32 h-32 mx-auto flex flex-col items-center justify-center border-4 transition-all duration-300 hover:scale-110 ${
//                   selectedClass === cls.number.toString() 
//                     ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30' 
//                     : 'border-white/30 hover:border-[#9AE9FD]/50'
//                 }`}
//               >
//                 <div className="text-6xl font-black text-white mb-1">{cls.number}</div>
//                 <span className="text-white text-sm font-medium">{cls.label}</span>
//               </button>
//             ))}
//           </div>
          
//           {/* Page indicator */}
//           <div className="flex justify-center mt-6 gap-2">
//             {Array.from({length: maxSlideIndex + 1}).map((_, index) => (
//               <div
//                 key={index}
//                 className={`w-3 h-3 rounded-full transition-all ${
//                   index === classSlideIndex 
//                     ? 'bg-[#9AE9FD]' 
//                     : 'bg-white/30'
//                 }`}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Battle Mode - Only Practice and Solo */}
//         <div>
//           <div className="flex items-center gap-4 mb-8">
//             <div className="bg-[#1A4F5F] px-6 py-3 rounded-full flex items-center gap-3">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" fill="none"/>
//               </svg>
//               <span className="text-lg font-semibold text-white">Battle Mode</span>
//             </div>
//             <div className="flex-1 h-px bg-[#1A4F5F]"></div>
//           </div>
          
//           <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
//             {modes.map(mode => (
//               <button
//                 key={mode.value}
//                 onClick={() => setSelectedMode(mode.value)}
//                 className={`group relative bg-[#1A4F5F] rounded-full w-32 h-32 mx-auto flex flex-col items-center justify-center border-4 transition-all duration-300 hover:scale-110 ${
//                   selectedMode === mode.value 
//                     ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30' 
//                     : 'border-white/30 hover:border-[#9AE9FD]/50'
//                 }`}
//               >
//                 <div className="text-white mb-2 group-hover:scale-110 transition-transform">
//                   {mode.icon}
//                 </div>
//                 <span className="text-white text-sm font-medium">{mode.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Connection Status and Start Button */}
//         <div className="text-center space-y-6">
//           <div className="flex justify-center">
//             <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
//               isConnected ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
//             }`}>
//               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
//               <span className={isConnected ? 'text-green-300' : 'text-red-300'}>
//                 {isConnected ? 'Connected' : 'Disconnected'}
//               </span>
//             </div>
//           </div>

//           <button
//             onClick={handleStartMatch}
//             disabled={!selectedSubject || !selectedDifficulty || !selectedClass || isWaiting}
//             className={`px-12 py-4 rounded-full text-xl font-bold transition-all duration-300 ${
//               selectedSubject && selectedDifficulty && selectedClass && !isWaiting
//                 ? 'bg-[#9AE9FD] text-[#002732] hover:bg-[#7FB3C1] hover:scale-105'
//                 : 'bg-gray-600 text-gray-400 cursor-not-allowed'
//             }`}
//           >
//             {isWaiting ? 'Finding Opponent...' : 'ENTER BATTLE'}
//           </button>
          
//           {(!selectedSubject || !selectedDifficulty || !selectedClass) && (
//             <p className="text-gray-400 text-sm">Please select all battle parameters to continue</p>
//           )}
//         </div>

//         {/* Back to Dashboard */}
//         <div className="text-center">
//           <Link 
//             to="/dashboard" 
//             className="text-[#9AE9FD] hover:text-white transition-colors underline"
//           >
//             ← Back to Dashboard
//           </Link>
//         </div>

//         {/* Waiting State */}
//         {isWaiting && !gameStarting && (
//           <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//             <div className="bg-[#1E3A47] rounded-3xl p-12 text-center max-w-md mx-auto">
//               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#9AE9FD] mx-auto mb-6"></div>
//               <h3 className="text-2xl font-bold mb-4 text-[#9AE9FD]">Finding Worthy Opponent</h3>
//               <p className="text-gray-300 text-lg">{waitingMessage}</p>
//               <div className="mt-6">
//                 <div className="flex justify-center space-x-2">
//                   <div className="w-3 h-3 bg-[#9AE9FD] rounded-full animate-pulse"></div>
//                   <div className="w-3 h-3 bg-[#9AE9FD] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
//                   <div className="w-3 h-3 bg-[#9AE9FD] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Game Starting Animation */}
//         {gameStarting && (
//           <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
//             <div className="bg-[#1E3A47] rounded-3xl p-12 text-center max-w-md mx-auto border-2 border-[#9AE9FD]">
//               <div className="animate-bounce mb-6">
//                 <span className="text-8xl">⚔️</span>
//               </div>
//               <h3 className="text-3xl font-bold mb-4 text-[#9AE9FD]">BATTLE COMMENCING!</h3>
//               <p className="text-green-300 text-xl">Prepare for academic combat...</p>
//               <div className="mt-6">
//                 <div className="w-full bg-gray-700 rounded-full h-2">
//                   <div className="bg-gradient-to-r from-green-500 to-[#9AE9FD] h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default BattlegroundsLobby;


import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import Sidebar from './SideBar';

// Icon Components
const SwordIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 17.5L3 6L6 3L17.5 14.5L14.5 17.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M13 19L19 13L21 15L15 21L13 19Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const FlaskIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H15M9 3V9L4.5 21H19.5L15 9V3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M6.5 15H17.5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CompassIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const AtomIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <path d="M20.2 20.2C13.8 27.5 4 23.4 4 16V12C4 8.1 11.2 0.4 20.2 3.8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M3.8 3.8C10.2 -3.5 20 0.6 20 8V12C20 15.9 12.8 23.6 3.8 20.2" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const DNAIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3C9 3 9 9 12 9S15 3 15 3M9 21C9 21 9 15 12 15S15 21 15 21" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M20 9C16 9 12 12 12 12S8 9 4 9M4 15C8 15 12 12 12 12S16 15 20 15" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const UserIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const EditIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5 12,2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <polygon points="12,8 18,12 12,16 6,12 12,8" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

function BattlegroundsLobby() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [user, setUser] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMode, setSelectedMode] = useState('solo');
  const [friends, setFriends] = useState([]);
  const [invitedFriends, setInvitedFriends] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('');
  const [gameStarting, setGameStarting] = useState(false);
  const [classSlideIndex, setClassSlideIndex] = useState(0);

  const subjects = [
    { name: 'Chemistry', icon: <FlaskIcon />, color: 'bg-emerald-600' },
    { name: 'Mathematics', icon: <CompassIcon />, color: 'bg-blue-600' },
    { name: 'Physics', icon: <AtomIcon />, color: 'bg-purple-600' },
    { name: 'Biology', icon: <DNAIcon />, color: 'bg-green-600' }
  ];
  
  const difficulties = [
    { name: 'beginner', label: 'B', color: 'bg-cyan-500' },
    { name: 'intermediate', label: 'I', color: 'bg-cyan-600' },
    { name: 'advanced', label: 'A', color: 'bg-cyan-700' },
    { name: 'expert', label: 'E', color: 'bg-cyan-800' }
  ];
  
  // All 12 classes
  const allClasses = Array.from({length: 12}, (_, i) => ({
    number: i + 1,
    label: `Class ${i + 1}`
  }));
  
  // Show 4 classes at a time
  const classesPerPage = 4;
  const maxSlideIndex = Math.ceil(allClasses.length / classesPerPage) - 1;
  const visibleClasses = allClasses.slice(
    classSlideIndex * classesPerPage, 
    (classSlideIndex + 1) * classesPerPage
  );
  
  const modes = [
    { value: 'practice', label: 'Practice', description: 'Practice without competing', icon: <EditIcon /> },
    { value: 'solo', label: '1 v 1', description: 'Compete against Real Players', icon: <UserIcon /> }
  ];

  // Logout handler for sidebar
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleClassSlideNext = () => {
    if (classSlideIndex < maxSlideIndex) {
      setClassSlideIndex(classSlideIndex + 1);
    }
  };

  const handleClassSlidePrev = () => {
    if (classSlideIndex > 0) {
      setClassSlideIndex(classSlideIndex - 1);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(res.data);
        console.log('👤 User loaded:', res.data.username);
        if (res.data.class) {
          setSelectedClass(res.data.class.toString());
          // Set slide index to show user's class
          const userClassIndex = Math.floor((res.data.class - 1) / classesPerPage);
          setClassSlideIndex(userClassIndex);
        }
      } catch (err) {
        console.log('❌ Error loading user:', err);
        alert('Session expired. Please refresh the page and log in again.');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log('🎯 BattlegroundsLobby useEffect - socket:', !!socket, 'socketId:', socket?.id);
    if (!socket) return;

    socket.on('game-start', (data) => {
      console.log('🎮 Game starting in Lobby:', data, 'socketId:', socket?.id);
      setGameStarting(true);
      setWaitingMessage('Game starting...');
      
      setTimeout(() => {
        navigate(`/battlegrounds/game?gameId=${data.gameId}&subject=${data.subject}&difficulty=${data.difficulty}&class=${data.classLevel}&mode=${data.mode}&multiplayer=true`, {
          state: { gameData: data }
        });
      }, 2000);
    });

    socket.on('waiting-for-opponent', (data) => {
      console.log('⏳ Waiting for opponent:', data);
      setIsWaiting(true);
      setWaitingMessage(`Waiting for opponent... (${data.position}/2 players)`);
    });

    socket.on('opponent-disconnected', () => {
      console.log('👋 Opponent disconnected');
      setIsWaiting(false);
      setWaitingMessage('Opponent disconnected. Please try again.');
      setTimeout(() => {
        setWaitingMessage('');
      }, 3000);
    });

    socket.on('already-in-room', (data) => {
      console.log('⚠️ Already in room:', data);
      setWaitingMessage('You are already in this room. Please wait or refresh the page.');
      setIsWaiting(false);
    });

    socket.on('auth-error', (data) => {
      console.log('🔐 Authentication error:', data);
      setWaitingMessage('Authentication failed. Please refresh the page and try again.');
      setIsWaiting(false);
    });

    return () => {
      socket.off('game-start');
      socket.off('waiting-for-opponent');
      socket.off('opponent-disconnected');
      socket.off('already-in-room');
      socket.off('auth-error');
    };
  }, [socket, navigate]);

  const handleInviteFriend = (friendId) => {
    if (!invitedFriends.includes(friendId)) {
      setInvitedFriends([...invitedFriends, friendId]);
    }
  };

  const handleStartMatch = () => {
    console.log('🔍 Debug info:', {
      socket: !!socket,
      isConnected,
      user: user ? user.username : 'null',
      selectedSubject,
      selectedDifficulty,
      selectedClass,
      selectedMode
    });

    if (!user) {
      alert('Please log in first.');
      console.log('❌ User not logged in');
      return;
    }

    if (!selectedSubject || !selectedDifficulty || !selectedClass) {
      alert('Please select all options before starting.');
      return;
    }

    if (selectedMode === 'practice') {
      console.log('📚 Starting practice mode');
      navigate(`/battlegrounds/game?subject=${selectedSubject}&difficulty=${selectedDifficulty}&class=${selectedClass}&mode=practice&multiplayer=false`);
      return;
    }

    if (!socket || !isConnected) {
      alert('Not connected to server. Please try again.');
      console.log('❌ Socket not connected:', { socket: !!socket, isConnected });
      return;
    }

    const payload = {
      userId: user._id,
      username: user.username,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      classLevel: selectedClass,
      mode: 'solo'
    };
    socket.emit('join-lobby', payload);
    console.log('🚀 Emitted join-lobby for solo match:', payload);

    setIsWaiting(true);
    setWaitingMessage('Finding opponent...');
  };

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative z-50">
        <Sidebar onLogout={handleLogout} />
      </div>
      <div className="text-[#9AE9FD] text-xl ml-64">Loading...</div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-black text-white relative overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="relative z-50">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full z-10">
        <div className="absolute top-[10%] left-[15%] w-32 h-32 border-2 border-[#9AE9FD]/20 rounded-full"></div>
        <div className="absolute top-[60%] right-[10%] w-24 h-24 border-2 border-[#9AE9FD]/20 rounded-full"></div>
        <div className="absolute bottom-[20%] left-[8%] w-40 h-40 border-2 border-[#9AE9FD]/20 rounded-full"></div>
        <div className="absolute top-[30%] right-[25%] w-16 h-16 bg-[#9AE9FD]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[40%] left-[40%] w-20 h-20 bg-[#144F5F]/30 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-20 ml-64 p-6">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-[#001318] border border-[#9AE9FD]/30 rounded-3xl p-8 text-center relative overflow-hidden">
            {/* Header decorative elements */}
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2 text-[#9AE9FD]/40">
              <div className="flex items-center gap-2">
                <SwordIcon />
                <SwordIcon />
              </div>
            </div>
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-[#9AE9FD]/40">
              <div className="flex items-center gap-2">
                <SwordIcon />
                <SwordIcon />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-[#9AE9FD] mb-2">
              Academic Battlegrounds
            </h1>
            <p className="text-xl text-white/80">
              Choose your weapons and prepare for intellectual combat!
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-16">
          {/* Choose your weapon */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-[#144F5F] border border-[#9AE9FD]/40 px-8 py-4 rounded-full flex items-center gap-3">
                <SwordIcon />
                <span className="text-xl font-bold text-white">Choose your weapon</span>
              </div>
              <div className="flex-1 h-px bg-[#9AE9FD]/30"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {subjects.map(subject => (
                <button
                  key={subject.name}
                  onClick={() => setSelectedSubject(subject.name)}
                  className={`group relative bg-[#001318] border-2 rounded-2xl w-full h-40 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#9AE9FD]/20 ${
                    selectedSubject === subject.name 
                      ? 'border-[#9AE9FD] shadow-lg shadow-[#9AE9FD]/30' 
                      : 'border-gray-700 hover:border-[#9AE9FD]/60'
                  }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-[#9AE9FD]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`${subject.color} p-3 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                    <div className="text-white">
                      {subject.icon}
                    </div>
                  </div>
                  <span className="text-white text-lg font-semibold">{subject.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Choose difficulty */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-[#144F5F] border border-[#9AE9FD]/40 px-8 py-4 rounded-full flex items-center gap-3">
                <LightningIcon />
                <span className="text-xl font-bold text-white">Choose difficulty</span>
              </div>
              <div className="flex-1 h-px bg-[#9AE9FD]/30"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty.name}
                  onClick={() => setSelectedDifficulty(difficulty.name)}
                  className={`group relative ${difficulty.color} border-2 rounded-2xl w-full h-40 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 ${
                    selectedDifficulty === difficulty.name 
                      ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30 shadow-lg shadow-cyan-500/30' 
                      : 'border-cyan-400/30 hover:border-[#9AE9FD]'
                  }`}
                >
                  <div className="text-7xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{difficulty.label}</div>
                  <span className="text-white text-lg font-semibold capitalize">{difficulty.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Choose your level - with slider */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-[#144F5F] border border-[#9AE9FD]/40 px-8 py-4 rounded-full flex items-center gap-3">
                <ShieldIcon />
                <span className="text-xl font-bold text-white">Choose your level</span>
              </div>
              <div className="flex-1 h-px bg-[#9AE9FD]/30"></div>
              <button 
                onClick={handleClassSlidePrev}
                disabled={classSlideIndex === 0}
                className={`bg-[#144F5F] border border-[#9AE9FD]/40 p-3 rounded-full transition-all ${
                  classSlideIndex === 0 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-[#1A5A6A] hover:border-[#9AE9FD]'
                }`}
              >
                <ChevronLeftIcon />
              </button>
              <button 
                onClick={handleClassSlideNext}
                disabled={classSlideIndex === maxSlideIndex}
                className={`bg-[#144F5F] border border-[#9AE9FD]/40 p-3 rounded-full transition-all ${
                  classSlideIndex === maxSlideIndex 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-[#1A5A6A] hover:border-[#9AE9FD]'
                }`}
              >
                <ChevronRightIcon />
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleClasses.map(cls => (
                <button
                  key={cls.number}
                  onClick={() => setSelectedClass(cls.number.toString())}
                  className={`group relative bg-[#002732] border-2 rounded-2xl w-full h-40 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#9AE9FD]/20 ${
                    selectedClass === cls.number.toString() 
                      ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30 shadow-lg shadow-[#9AE9FD]/30' 
                      : 'border-gray-600 hover:border-[#9AE9FD]/60'
                  }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-[#9AE9FD]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-7xl font-black text-[#9AE9FD] mb-2 group-hover:scale-110 transition-transform">{cls.number}</div>
                  <span className="text-white text-lg font-semibold">{cls.label}</span>
                </button>
              ))}
            </div>
            
            {/* Page indicator */}
            <div className="flex justify-center mt-8 gap-3">
              {Array.from({length: maxSlideIndex + 1}).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === classSlideIndex 
                      ? 'bg-[#9AE9FD] scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Battle Mode */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-[#144F5F] border border-[#9AE9FD]/40 px-8 py-4 rounded-full flex items-center gap-3">
                <TargetIcon />
                <span className="text-xl font-bold text-white">Battle Mode</span>
              </div>
              <div className="flex-1 h-px bg-[#9AE9FD]/30"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              {modes.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setSelectedMode(mode.value)}
                  className={`group relative bg-[#001318] border-2 rounded-2xl w-full h-48 flex flex-col items-center justify-center p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#9AE9FD]/20 ${
                    selectedMode === mode.value 
                      ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30 shadow-lg shadow-[#9AE9FD]/30' 
                      : 'border-gray-700 hover:border-[#9AE9FD]/60'
                  }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-[#9AE9FD]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-[#9AE9FD] mb-4 group-hover:scale-110 transition-transform">
                    {mode.icon}
                  </div>
                  <span className="text-white text-xl font-bold mb-2">{mode.label}</span>
                  <span className="text-gray-400 text-sm text-center">{mode.description}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Connection Status and Start Button */}
          <section className="text-center space-y-8 pb-8">
            <div className="flex justify-center">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm border-2 ${
                isConnected ? 'bg-green-500/10 border-green-500 text-green-300' : 'bg-red-500/10 border-red-500 text-red-300'
              }`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="font-semibold">
                  {isConnected ? 'Connected to Battle Server' : 'Disconnected from Battle Server'}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartMatch}
              disabled={!selectedSubject || !selectedDifficulty || !selectedClass || isWaiting}
              className={`px-16 py-5 rounded-full text-2xl font-black transition-all duration-300 ${
                selectedSubject && selectedDifficulty && selectedClass && !isWaiting
                  ? 'bg-[#9AE9FD] text-[#002732] hover:bg-[#7FB3C1] hover:scale-105 shadow-lg shadow-[#9AE9FD]/30'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isWaiting ? 'FINDING OPPONENT...' : 'ENTER BATTLE'}
            </button>
            
            {(!selectedSubject || !selectedDifficulty || !selectedClass) && (
              <p className="text-gray-400 text-lg">Please select all battle parameters to continue</p>
            )}

            {/* Back to Dashboard */}
            <div className="pt-8">
              <Link 
                to="/dashboard" 
                className="text-[#9AE9FD] hover:text-white transition-colors underline text-lg"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Waiting State */}
      {isWaiting && !gameStarting && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#001318] border-2 border-[#9AE9FD] rounded-3xl p-12 text-center max-w-md mx-auto relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-[#9AE9FD]/5 animate-pulse rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 border-4 border-[#9AE9FD] border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
              <h3 className="text-3xl font-black mb-4 text-[#9AE9FD]">
                Searching for Worthy Opponent
              </h3>
              <p className="text-white text-xl mb-6">{waitingMessage}</p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-[#9AE9FD] rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-[#9AE9FD] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-[#9AE9FD] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Starting Animation */}
      {gameStarting && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#001318] border-4 border-[#9AE9FD] rounded-3xl p-12 text-center max-w-lg mx-auto relative overflow-hidden">
            {/* Pulsing background effect */}
            <div className="absolute inset-0 bg-[#9AE9FD]/10 animate-pulse rounded-3xl"></div>
            <div className="absolute inset-4 border-2 border-[#9AE9FD]/30 rounded-2xl animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="text-8xl mb-6 animate-bounce">
                ⚔️
              </div>
              <h3 className="text-4xl font-black mb-6 text-[#9AE9FD] animate-pulse">
                BATTLE COMMENCING!
              </h3>
              <p className="text-green-300 text-2xl mb-8 font-bold">
                Prepare for academic combat...
              </p>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 via-[#9AE9FD] to-cyan-400 h-3 rounded-full animate-pulse shadow-lg shadow-[#9AE9FD]/50" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BattlegroundsLobby;