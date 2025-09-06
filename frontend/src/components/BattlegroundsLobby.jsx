import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

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

  const subjects = ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology'];
  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
  const classes = Array.from({length: 12}, (_, i) => i + 1);
  const modes = [
    { value: 'practice', label: 'Practice', description: 'Practice without competing' },
    { value: 'solo', label: 'Solo', description: 'Compete against Real Players' }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(res.data);
        console.log('👤 User loaded:', res.data.username);
        // Set default class based on user's class
        if (res.data.class) {
          setSelectedClass(res.data.class.toString());
        }
      } catch (err) {
        console.log('❌ Error loading user:', err);
        // Show error message instead of auto-redirect
        alert('Session expired. Please refresh the page and log in again.');
        // Don't auto-redirect, let user handle it
        // window.location.href = '/';
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log('🎯 BattlegroundsLobby useEffect - socket:', !!socket, 'socketId:', socket?.id);
    if (!socket) return;

    // Listen for game start
    socket.on('game-start', (data) => {
      console.log('🎮 Game starting in Lobby:', data, 'socketId:', socket?.id);
      setGameStarting(true);
      setWaitingMessage('Game starting...');
      
      // Navigate to game with multiplayer parameters and pass game data as state
      setTimeout(() => {
        navigate(`/battlegrounds/game?gameId=${data.gameId}&subject=${data.subject}&difficulty=${data.difficulty}&class=${data.classLevel}&mode=${data.mode}&multiplayer=true`, {
          state: { gameData: data }
        });
      }, 2000);
    });

    // Listen for waiting status
    socket.on('waiting-for-opponent', (data) => {
      console.log('⏳ Waiting for opponent:', data);
      setIsWaiting(true);
      setWaitingMessage(`Waiting for opponent... (${data.position}/2 players)`);
    });

    // Listen for opponent disconnection
    socket.on('opponent-disconnected', () => {
      console.log('👋 Opponent disconnected');
      setIsWaiting(false);
      setWaitingMessage('Opponent disconnected. Please try again.');
      setTimeout(() => {
        setWaitingMessage('');
      }, 3000);
    });

    // Listen for already in room
    socket.on('already-in-room', (data) => {
      console.log('⚠️ Already in room:', data);
      setWaitingMessage('You are already in this room. Please wait or refresh the page.');
      setIsWaiting(false);
    });

    return () => {
      socket.off('game-start');
      socket.off('waiting-for-opponent');
      socket.off('opponent-disconnected');
      socket.off('already-in-room');
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

    // Practice mode - navigate directly and generate questions server-side without matchmaking
    if (selectedMode === 'practice') {
      console.log('📚 Starting practice mode');
      navigate(`/battlegrounds/game?subject=${selectedSubject}&difficulty=${selectedDifficulty}&class=${selectedClass}&mode=practice&multiplayer=false`);
      return;
    }

    // Solo competitive - require socket connection
    if (!socket || !isConnected) {
      alert('Not connected to server. Please try again.');
      console.log('❌ Socket not connected:', { socket: !!socket, isConnected });
      return;
    }

    // Emit a concise join message for 1v1 match
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

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4 flex justify-between items-center">
        <h1 className="text-2xl">Battlegrounds Lobby</h1>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-200' : 'bg-red-200'}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <Link to="/battlegrounds" className="text-white underline">Back to Battlegrounds</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl mb-4">Configure Your Battle</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Game Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {modes.map(mode => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                {modes.find(m => m.value === selectedMode)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Friends Invitation Section - Removed for solo and practice modes */}
        {/* {(selectedMode === 'duo' || selectedMode === 'squad') && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg mb-4">Invite Friends</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Friends:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {friends.length > 0 ? friends.map(friend => (
                  <div key={friend._id} className="flex items-center justify-between p-2 border rounded">
                    <span>{friend.username}</span>
                    <button
                      onClick={() => handleInviteFriend(friend._id)}
                      disabled={invitedFriends.includes(friend._id)}
                      className={`px-3 py-1 rounded text-sm ${
                        invitedFriends.includes(friend._id)
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {invitedFriends.includes(friend._id) ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                )) : (
                  <p className="text-gray-500">No friends added yet. Add friends from your dashboard!</p>
                )}
              </div>
            </div>
            {invitedFriends.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Invited Friends:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {invitedFriends.map(friendId => {
                    const friend = friends.find(f => f._id === friendId);
                    return (
                      <span key={friendId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {friend?.username || 'Unknown'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )} */}

        {/* Start Match Button */}
        <div className="bg-white p-6 rounded shadow">
          <div className="text-center">
            <h3 className="text-lg mb-4">Ready to Battle?</h3>
            <button
              onClick={handleStartMatch}
              disabled={!selectedSubject || !selectedDifficulty || !selectedClass || isWaiting}
              className={`px-8 py-3 rounded text-white font-medium ${
                selectedSubject && selectedDifficulty && selectedClass && !isWaiting
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isWaiting ? 'Finding Opponent...' : 'Start Match'}
            </button>
            {(!selectedSubject || !selectedDifficulty || !selectedClass) && (
              <p className="text-sm text-gray-600 mt-2">Please select subject, difficulty, and class to continue</p>
            )}
            {!isConnected && (
              <p className="text-sm text-red-600 mt-2">⚠️ Not connected to server</p>
            )}
          </div>
        </div>

        {/* Waiting State */}
        {isWaiting && !gameStarting && (
          <div className="bg-blue-50 p-6 rounded shadow mt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Finding Opponent</h3>
              <p className="text-gray-600">{waitingMessage}</p>
              <div className="mt-4">
                <div className="inline-block animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Starting Animation */}
        {gameStarting && (
          <div className="bg-green-50 p-6 rounded shadow mt-6">
            <div className="text-center">
              <div className="animate-bounce mb-4">
                <span className="text-4xl">⚔️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-800">Game Starting!</h3>
              <p className="text-green-600">Get ready for battle...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BattlegroundsLobby;
