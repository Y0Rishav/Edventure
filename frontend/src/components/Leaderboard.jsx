import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/leaderboard')
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
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
      default: return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex">
      {/* Sidebar */}
      <aside className="w-52 bg-slate-400/80 backdrop-blur-sm text-slate-800 flex flex-col p-4">
        <div className="font-bold text-xl mb-8 text-center">Edventure</div>
        
        <nav className="flex-1">
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Dashboard
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Subjects
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Your Squad
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm font-medium text-slate-900">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Battle Arena
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Rewards
            </div>
          </div>
          
          <hr className="border-slate-600/30 mb-6" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Home
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Help
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Contact Us
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="bg-slate-300/90 backdrop-blur-sm rounded-3xl px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-semibold">🏆 Leaderboard</h1>
            <p className="text-slate-600 text-sm">See how you rank against other students</p>
          </div>
          <Link 
            to="/dashboard" 
            className="bg-slate-600/20 hover:bg-slate-600/30 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <h2 className="text-white text-lg font-medium mb-6 text-center">Top Champions</h2>
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center min-w-32 h-20 flex flex-col justify-end">
                  <div className="text-slate-800 font-semibold text-sm truncate">{users[1]?.name}</div>
                  <div className="text-slate-600 text-xs">{users[1]?.points} pts</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-xl">👑</span>
                </div>
                <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center min-w-32 h-24 flex flex-col justify-end">
                  <div className="text-slate-800 font-semibold text-sm truncate">{users[0]?.name}</div>
                  <div className="text-slate-600 text-xs">{users[0]?.points} pts</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center min-w-32 h-16 flex flex-col justify-end">
                  <div className="text-slate-800 font-semibold text-sm truncate">{users[2]?.name}</div>
                  <div className="text-slate-600 text-xs">{users[2]?.points} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-6">
          <h2 className="text-white text-lg font-medium mb-4">Full Rankings</h2>
          <div className="space-y-3">
            {users.map((user, index) => (
              <div key={user._id} className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 hover:bg-slate-300/90 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(index)} rounded-xl flex items-center justify-center`}>
                      <span className="text-white font-bold">
                        {index < 3 ? getRankIcon(index) : getRankIcon(index)}
                      </span>
                    </div>
                    <div>
                      <div className="text-slate-800 font-semibold">{user.name}</div>
                      <div className="text-slate-600 text-sm">@{user.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-800 font-bold text-lg">{user.points} pts</div>
                    <div className="text-slate-600 text-sm">
                      {user.badges && user.badges.length > 0 ? user.badges.join(', ') : 'No badges yet'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-slate-300 text-lg mb-2">No rankings available yet</p>
              <p className="text-slate-400">Start learning to climb the leaderboard!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Leaderboard;
