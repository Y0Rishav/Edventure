import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from './SideBar'; // Import the Sidebar component

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
        // Backend may return either an array or an object { top: [...], rank }
        if (Array.isArray(data)) {
          setUsers(data);
          setRank(null);
        } else if (data && Array.isArray(data.top)) {
          setUsers(data.top);
          setRank(typeof data.rank === 'number' ? data.rank : null);
        } else {
          // unexpected shape -> fallback to empty array
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
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-600';
      case 1: return 'from-gray-300 to-gray-500';
      case 2: return 'from-orange-400 to-orange-600';
      default: return 'from-[#144F5F] to-[#002732]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
        <div className="text-[#9AE9FD] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2B] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Use imported Sidebar component */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="bg-[#B8C5C9] rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[#002732] text-xl font-semibold">🏆 Leaderboard</h1>
            <p className="text-[#002732] text-sm">See how you rank against other students</p>
          </div>
          <Link 
            to="/dashboard" 
            className="bg-[#002732]/20 hover:bg-[#002732]/30 text-[#002732] px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Top 3 Podium */}
        {Array.isArray(users) && users.length >= 3 && (
          <div className="bg-[#1E3A47] rounded-2xl p-6 mb-6 border border-[#2A4A57]">
            <h2 className="text-[#9AE9FD] text-lg font-medium mb-6 text-center">Top Champions</h2>
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div className="bg-[#7FB3C1] rounded-xl p-4 text-center min-w-32 h-20 flex flex-col justify-end">
                  <div className="text-[#002732] font-semibold text-sm truncate">{users[1]?.name}</div>
                  <div className="text-[#144F5F] text-xs">{users[1]?.points} pts</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-xl">👑</span>
                </div>
                <div className="bg-[#7FB3C1] rounded-xl p-4 text-center min-w-32 h-24 flex flex-col justify-end">
                  <div className="text-[#002732] font-semibold text-sm truncate">{users[0]?.name}</div>
                  <div className="text-[#144F5F] text-xs">{users[0]?.points} pts</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div className="bg-[#7FB3C1] rounded-xl p-4 text-center min-w-32 h-16 flex flex-col justify-end">
                  <div className="text-[#002732] font-semibold text-sm truncate">{users[2]?.name}</div>
                  <div className="text-[#144F5F] text-xs">{users[2]?.points} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-[#1E3A47] rounded-2xl p-6 border border-[#2A4A57]">
          <h2 className="text-[#9AE9FD] text-lg font-medium mb-4">Full Rankings</h2>
          <div className="space-y-3">
            {(Array.isArray(users) ? users : []).map((user, index) => (
              <div key={user._id} className="bg-[#7FB3C1] rounded-xl p-4 hover:bg-[#B8C5C9] transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(index)} rounded-xl flex items-center justify-center`}>
                      <span className="text-white font-bold">
                        {index < 3 ? getRankIcon(index) : getRankIcon(index)}
                      </span>
                    </div>
                    <div>
                      <div className="text-[#002732] font-semibold">{user.name}</div>
                      <div className="text-[#144F5F] text-sm">@{user.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#002732] font-bold text-lg">{user.points} pts</div>
                    <div className="text-[#144F5F] text-sm">
                      {user.badges && user.badges.length > 0 ? user.badges.join(', ') : 'No badges yet'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {(!Array.isArray(users) || users.length === 0) && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-[#9AE9FD] text-lg mb-2">No rankings available yet</p>
              <p className="text-white/70">Start learning to climb the leaderboard!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Leaderboard;
