import { Link } from 'react-router-dom';

function Battlegrounds() {
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
            <h1 className="text-slate-800 text-xl font-semibold">Battlegrounds</h1>
            <p className="text-slate-600 text-sm">Challenge yourself and compete!</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/leaderboard" className="text-slate-700 hover:text-slate-900 text-sm font-medium">
              🏆 Leaderboard
            </Link>
            <Link to="/dashboard" className="text-slate-700 hover:text-slate-900 text-sm font-medium">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h2 className="text-white text-lg font-medium mb-4">Welcome to Battlegrounds!</h2>
          <p className="text-slate-300 mb-6">Challenge yourself and compete with others in educational battles. Test your knowledge and climb the ranks!</p>
          
          {/* Battle Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-300/80 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-300/90 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-slate-800 font-semibold">Practice Mode</h3>
                  <p className="text-slate-600 text-sm">Test your knowledge without pressure</p>
                </div>
              </div>
              <Link 
                to="/battlegrounds/lobby?mode=practice" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>Start Practice</span>
                <span>🚀</span>
              </Link>
            </div>

            <div className="bg-slate-300/80 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-300/90 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">⚔️</span>
                </div>
                <div>
                  <h3 className="text-slate-800 font-semibold">Solo Competitive</h3>
                  <p className="text-slate-600 text-sm">Compete against other players</p>
                </div>
              </div>
              <Link 
                to="/battlegrounds/lobby?mode=solo" 
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>Enter Lobby</span>
                <span>🔥</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-white text-sm mb-2">Your Rank</div>
            <div className="text-white text-2xl font-bold">#42</div>
          </div>
          <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-white text-sm mb-2">Win Rate</div>
            <div className="text-white text-2xl font-bold">67%</div>
          </div>
          <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-white text-sm mb-2">Battles Won</div>
            <div className="text-white text-2xl font-bold">23</div>
          </div>
          <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-white text-sm mb-2">Points</div>
            <div className="text-white text-2xl font-bold flex items-center justify-center gap-1">
              1250 <span className="text-yellow-400">🏆</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Battlegrounds;
