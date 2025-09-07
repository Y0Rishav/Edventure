import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from './SideBar';
import character1 from '../assets/characters/character1.png';
import character2 from '../assets/characters/character2.png';
import character3 from '../assets/characters/character3.png';

const characterImages = [character1, character2, character3];

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/auth/leaderboard')
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setUsers(data);
          setRank(null);
        } else if (data && Array.isArray(data.top)) {
          setUsers(data.top);
          setRank(typeof data.rank === 'number' ? data.rank : null);
        } else {
          console.warn('Unexpected leaderboard response shape', data);
          setUsers([]);
          setRank(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard', err);
        setUsers([]);
        setRank(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'from-yellow-600 to-yellow-800';
      case 1: return 'from-gray-500 to-gray-700';
      case 2: return 'from-orange-600 to-orange-800';
      default: return 'from-[#144F5F] to-[#002732]';
    }
  };

  const getCharacterImage = (index) => {
    return characterImages[index % characterImages.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,rgba(10,31,43,1)_0%,rgba(20,78,94,1)_100%)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#9AE9FD] mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-[#9AE9FD]">Summoning the Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[linear-gradient(180deg,rgba(10,31,43,1)_0%,rgba(20,78,94,1)_100%)] text-white p-6 relative overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Particle Effect Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#9AE9FD] rounded-full opacity-20 animate-float top-10 left-20"></div>
        <div className="absolute w-3 h-3 bg-[#7FB3C1] rounded-full opacity-15 animate-float-slow top-40 right-30"></div>
        <div className="absolute w-2 h-2 bg-[#9AE9FD] rounded-full opacity-15 animate-float bottom-20 left-40"></div>
      </div>

      <Sidebar onLogout={handleLogout} />
      <main className="ml-64 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-[#1E3A47]/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl mb-8 flex justify-between items-center border border-[#9AE9FD]/30">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-[#9AE9FD] rounded-full flex items-center justify-center mr-4 shadow-lg">
              <span className="text-3xl">🏆</span>
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-[#9AE9FD]">Legendary Leaderboard</h1>
              <p className="text-md text-gray-300">Rise to the top and etch your name in glory!</p>
            </div>
          </div>
          <Link 
            to="/dashboard" 
            className="bg-[#002732] text-[#9AE9FD] px-8 py-3 rounded-xl font-semibold hover:bg-[#1E2A32] transition-all duration-300 transform hover:scale-105 shadow-lg border border-[#9AE9FD]/50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Top 3 Podium */}
        {Array.isArray(users) && users.length >= 3 && (
          <div className="relative bg-[#1E3A47]/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl mb-8 border border-[#9AE9FD]/30 overflow-hidden">
            {/* Full Background Images for Podium */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 relative">
                <img 
                  src={getCharacterImage(1)} 
                  alt="Champion 2 BG" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A47]/70 to-transparent"></div>
              </div>
              <div className="w-1/3 relative">
                <img 
                  src={getCharacterImage(0)} 
                  alt="Champion 1 BG" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-[#1E3A47]/70"></div>
              </div>
              <div className="w-1/3 relative">
                <img 
                  src={getCharacterImage(2)} 
                  alt="Champion 3 BG" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#1E3A47]/70 to-transparent"></div>
              </div>
            </div>
            {/* <h2 className="text-4xl font-bold text-[#9AE9FD] mb-10 text-center">Pantheon of Champions</h2> */}
            <div className="flex items-end justify-center gap-12 relative z-10">
              {/* 2nd Place */}
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center mb-3 shadow-xl border-2 border-[#9AE9FD]/50">
                  <span className="text-3xl font-bold text-white">🥈</span>
                </div>
                <div className="bg-gradient-to-b from-[#7FB3C1] to-[#5A9AA8] rounded-2xl p-5 text-center min-w-40 h-24 flex flex-col justify-end shadow-2xl border-2 border-[#9AE9FD]/30">
                  <div className="text-[#002732] font-bold text-lg truncate">{users[1]?.name}</div>
                  <div className="text-[#002732] text-sm">{users[1]?.points} pts</div>
                </div>
                <div className="w-40 h-3 bg-gradient-to-r from-gray-700 to-gray-500 mt-2 rounded-full shadow-inner"></div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center transform hover:scale-110 transition-transform duration-300">
                <div className="w-28 h-28 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center mb-4 shadow-2xl border-2 border-[#FFD700]/70 ">
                  <span className="text-5xl font-bold text-white">👑</span>
                </div>
                <div className="bg-gradient-to-b from-[#9AE9FD] to-[#7FB3C1] rounded-2xl p-6 text-center min-w-48 h-28 flex flex-col justify-end shadow-2xl border-2 border-[#FFD700]/70">
                  <div className="text-[#002732] font-bold text-xl truncate">{users[0]?.name}</div>
                  <div className="text-[#002732] text-md">{users[0]?.points} pts</div>
                </div>
                <div className="w-48 h-4 bg-gradient-to-r from-yellow-800 to-yellow-600 mt-2 rounded-full shadow-inner"></div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-800 rounded-full flex items-center justify-center mb-3 shadow-xl border-2 border-[#9AE9FD]/50">
                  <span className="text-3xl font-bold text-white">🥉</span>
                </div>
                <div className="bg-gradient-to-b from-[#7FB3C1] to-[#5A9AA8] rounded-2xl p-5 text-center min-w-40 h-24 flex flex-col justify-end shadow-2xl border-2 border-[#9AE9FD]/30">
                  <div className="text-[#002732] font-bold text-lg truncate">{users[2]?.name}</div>
                  <div className="text-[#002732] text-sm">{users[2]?.points} pts</div>
                </div>
                <div className="w-40 h-3 bg-gradient-to-r from-orange-800 to-orange-600 mt-2 rounded-full shadow-inner"></div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-[#1E3A47]/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-[#9AE9FD]/30">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#9AE9FD] rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-[#002732]">📊</span>
            </div>
            <h2 className="text-4xl font-bold text-[#9AE9FD]">Rankings Battleground</h2>
          </div>
          <div className="space-y-4">
            {(Array.isArray(users) ? users : []).map((user, index) => (
              <div 
                key={user._id} 
                className="bg-gradient-to-b from-[#2A4A57] to-[#1E3A47] rounded-2xl p-5 hover:bg-[#3A5A67] transition-all duration-300 transform hover:scale-105 shadow-xl border-2 border-[#9AE9FD]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={getCharacterImage(index)} 
                        alt={`Avatar ${index}`} 
                        className="w-14 h-14 rounded-full border-2 border-[#9AE9FD]/50 shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full bg-[#9AE9FD]/20"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center shadow-md" style={{ backgroundImage: `linear-gradient(to bottom right, ${getRankColor(index)})` }}>
                        <span className="text-white font-bold text-sm">{getRankIcon(index)}</span>
                      </div>
                      <div>
                        <div className="text-[#9AE9FD] font-bold text-lg">{user.name}</div>
                        <div className="text-gray-300 text-sm">@{user.username}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#9AE9FD] font-bold text-xl">{user.points} pts</div>
                    <div className="text-gray-300 text-sm flex items-center gap-2 flex-wrap justify-end">
                      {user.badges && user.badges.length > 0 ? (
                        user.badges.map((badge, i) => (
                          <span 
                            key={i} 
                            className="bg-[#9AE9FD]/20 text-[#9AE9FD] px-3 py-1 rounded-full text-xs transition-all duration-300 hover:bg-[#9AE9FD]/30"
                          >
                            {badge}
                          </span>
                        ))
                      ) : (
                        'No badges yet'
                      )}
                    </div>
                    <div className="w-32 bg-gray-700 rounded-full h-2 mt-2 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-[#9AE9FD] to-[#5A9AA8] h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((user.points / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {(!Array.isArray(users) || users.length === 0) && (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-[#9AE9FD] text-2xl mb-2">No warriors in the arena!</p>
              <p className="text-gray-300">Join the battle to claim your rank!</p>
            </div>
          )}
        </div>

      

        {/* Action Buttons */}
        <div className="mt-8 text-center flex flex-wrap gap-4 justify-center">
          <Link 
            to="/battlegrounds/lobby" 
            className="bg-[#9AE9FD] text-[#002732] px-10 py-4 rounded-2xl font-bold text-xl hover:bg-[#7FB3C1] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Enter the Battle!
          </Link>
          <Link 
            to="/rewards" 
            className="bg-[#002732] text-[#9AE9FD] px-10 py-4 rounded-2xl font-bold text-xl hover:bg-[#1E2A32] transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-[#9AE9FD]/50"
          >
            Claim Epic Rewards
          </Link>
        </div>
      </main>

      {/* Custom CSS for Particle Animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Leaderboard;