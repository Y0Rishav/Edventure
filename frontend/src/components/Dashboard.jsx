import { useEffect, useState } from 'react';
import axios from 'axios';
import ProfileSetup from './ProfileSetup';
import Sidebar from './SideBar'; // Import the Sidebar component
import badge100 from '../assets/badges/100.png';
import badge200 from '../assets/badges/200.png';
import badge300 from '../assets/badges/300.png';
import badge400 from '../assets/badges/400.png';
import badge500 from '../assets/badges/500.png';
import { Link, useNavigate } from 'react-router-dom';

const FlameIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Outer glow */}
    <circle cx="12" cy="12" r="10" fill="url(#streak-glow)" />
    {/* Main streak bolt */}
    <path
      d="M13 2L6 14H12L11 22L18 10H12L13 2Z"
      fill="url(#streak-bolt)"
      stroke="#fff"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <defs>
      <radialGradient id="streak-glow" cx="0" cy="0" r="1" gradientTransform="translate(12 12) scale(10)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700" stopOpacity="0.7"/>
        <stop offset="1" stopColor="#FFD700" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="streak-bolt" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700"/>
        <stop offset="0.5" stopColor="#FF9100"/>
        <stop offset="1" stopColor="#FF3C00"/>
      </linearGradient>
    </defs>
  </svg>
);

function Dashboard() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ top: [], rank: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.log(err);
      setError('Failed to load user data. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/friends', { withCredentials: true });
      setFriends(res.data || []);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/leaderboard', { withCredentials: true });
      setLeaderboard(res.data || { top: [], rank: null });
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchFriends();
    fetchLeaderboard();

    // Refresh user data when window regains focus (useful when returning from Profile page)
    const handleFocus = () => {
      fetchUser();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
      <div className="text-[#9AE9FD] text-xl">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
      <div className="text-red-400 text-xl">{error}</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
      <div className="text-[#9AE9FD] text-xl">Please log in</div>
    </div>
  );

  if (!user.username || !user.age || !user.class || !user.subjects || user.subjects.length === 0) {
    return <ProfileSetup user={user} onComplete={fetchUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0A1F2B] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Use imported Sidebar component instead of inline sidebar */}
      <Sidebar onLogout={handleLogout} />
      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="bg-[#B8C5C9] rounded-2xl p-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#002732] mb-2">Welcome Back, {user.name || user.username}!</h2>
            <div className="flex items-center gap-2">
              <div className="bg-[#144F5F] text-white px-3 py-1 rounded-full text-sm">Level 5</div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-[#002732] rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14C20.49 12.54 22 10.79 22 8.5C22 7.04131 21.4205 5.64236 20.3891 4.61091C19.3576 3.57946 17.9587 3 16.5 3C14.74 3 13.5 3.5 12 5C10.5 3.5 9.26 3 7.5 3C6.04131 3 4.64236 3.57946 3.61091 4.61091C2.57946 5.64236 2 7.04131 2 8.5C2 10.79 3.51 12.54 5 14L12 21L19 14Z" stroke="#9AE9FD" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button className="w-12 h-12 bg-[#002732] rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#9AE9FD" strokeWidth="2" fill="none"/>
                <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#9AE9FD" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <Link to="/profile">
              <img src={user.avatar || 'https://th.bing.com/th?id=ORMS.ed048131bfcbae2933327f4318b54a71&pid=Wdp&w=268&h=140&qlt=90&c=1&rs=1&dpr=1&p=0'} alt="Profile" className="w-12 h-12 rounded-full object-cover cursor-pointer" />
            </Link>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#9AE9FD] mb-6">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-[#1E3A47] rounded-2xl p-6 border border-[#2A4A57]">
        <h4 className="text-white font-semibold mb-2">Squad Members</h4>
        <div className="text-4xl font-bold text-white">{friends.length}</div>
        {/* Names removed — only count shown per design */}
      </div>
            <div className="bg-[#1E3A47] rounded-2xl p-6 border border-[#2A4A57]">
              <h4 className="text-white font-semibold mb-2">Points Earned</h4>
              <div className="text-4xl font-bold text-white flex items-center gap-2">
                {user.points || 0}
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            
            <div className="bg-[#1E3A47] rounded-2xl p-6 border border-[#2A4A57]">
              <h4 className="text-white font-semibold mb-2">Battles Fought</h4>
              <div className="text-4xl font-bold text-white">27</div>
            </div>
            <div className="bg-[#1E3A47] rounded-2xl p-6 border border-[#2A4A57]">
              <h4 className="text-white font-semibold mb-2">Daily Streak</h4>
              <div className="text-4xl font-bold text-white flex items-center gap-2">
                7
                <FlameIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Progress */}
          <div>
            <h3 className="text-2xl font-bold text-[#9AE9FD] mb-6">Your Progress</h3>
            <div className="bg-[#7FB3C1] rounded-2xl p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#002732] font-semibold">Quizzes completed</span>
                    <span className="text-[#002732] text-sm">(433)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div className="bg-[#002732] h-3 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#002732] font-semibold">XP Earned</span>
                    <span className="text-[#002732] text-sm">(400 required to reach next level)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div className="bg-[#002732] h-3 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#002732] font-semibold">Questions completed</span>
                    <span className="text-[#002732] text-sm">(300/1200)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div className="bg-[#002732] h-3 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#002732] font-semibold">Challenges attempted</span>
                    <span className="text-[#002732] text-sm">(7/120)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div className="bg-[#002732] h-3 rounded-full" style={{ width: '6%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#002732] font-semibold">Badges earned</span>
                    <span className="text-[#002732] text-sm">(11/80)</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div className="bg-[#002732] h-3 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges/Achievements */}
          <div>
            <h3 className="text-2xl font-bold text-[#9AE9FD] mb-6">Badges/Achievements</h3>
            <div className="bg-[#7FB3C1] rounded-2xl p-6 mb-6">
              <div className="flex gap-4 justify-center items-center">
                {/* Render circular badge images based on user.points */}
                {(() => {
                  const pts = user?.points || 0;
                  const badges = [];
                  if (pts >= 100) badges.push(badge100);
                  if (pts >= 200) badges.push(badge200);
                  if (pts >= 300) badges.push(badge300);
                  if (pts >= 400) badges.push(badge400);
                  if (pts >= 500) badges.push(badge500);
                  // show at most 5 badges
                  const shown = badges.slice(0,5);
                  if (shown.length === 0) {
                    return <div className="text-slate-200">No badges yet</div>;
                  }
                  return shown.map((b, i) => (
                    <img key={i} src={b} alt={`badge-${i}`} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 md:border-4 border-white/20" />
                  ));
                })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* growth graph */}
                <div>
                <h4 className="text-[#9AE9FD] font-bold mb-4">Growth Graph</h4>
                <div className="bg-[#7FB3C1] rounded-2xl p-6 h-32 flex items-end">
                  {/* Simple SVG line chart for points progress */}
                  <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#002732"
                    strokeWidth="3"
                    points={
                    // Example: simulate 7 days of points, replace with real data if available
                    (() => {
                      const pointsHistory = user.pointsHistory || [100, 200, 300, 350, 400, 470, user.points || 470];
                      const max = Math.max(...pointsHistory, 1);
                      return pointsHistory.map((pt, i) => {
                      const x = (i / (pointsHistory.length - 1)) * 200;
                      const y = 80 - (pt / max) * 70;
                      return `${x},${y}`;
                      }).join(' ');
                    })()
                    }
                  />
                  {/* Dots */}
                  {
                    (() => {
                    const pointsHistory = user.pointsHistory || [100, 200, 300, 350, 400, 470, user.points || 470];
                    const max = Math.max(...pointsHistory, 1);
                    return pointsHistory.map((pt, i) => {
                      const x = (i / (pointsHistory.length - 1)) * 200;
                      const y = 80 - (pt / max) * 70;
                      return (
                      <circle key={i} cx={x} cy={y} r="3" fill="#9AE9FD" stroke="#002732" strokeWidth="1" />
                      );
                    });
                    })()
                  }
                  </svg>
                </div>
                </div>
                <div>
                {/* leaderboard */}
                <h4 className="text-[#9AE9FD] font-bold mb-4 flex items-center gap-2">
                  Leaderboard
                </h4>
                <div className="bg-[#7FB3C1] rounded-2xl p-6 h-32 flex items-center justify-center">
                  <Link to="/leaderboard" className="ml-2 inline-flex items-center hover:scale-110 transition-transform">
                    {/* Leaderboard Icon */}
                    <svg width="130" height="130" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="13" width="4" height="8" rx="1" fill="#ff0000ff"/>
                      <rect x="10" y="9" width="4" height="12" rx="1" fill="#ffe600ff"/>
                      <rect x="17" y="5" width="4" height="16" rx="1" fill="#0073ffff"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold text-[#9AE9FD] mb-6">Daily Grind Goal</h3>
          <div className="bg-[#1E3A47] rounded-2xl p-6">
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-green-500 h-4 rounded-full" 
                style={{ width: '70%' }}
              ></div>
            </div>
            <p className="text-gray-400 italic text-center">
              "In the midst of chaos, there is also opportunity..."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;