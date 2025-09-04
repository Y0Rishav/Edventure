import { useState, useEffect } from 'react';
import axios from 'axios';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchFriends();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/friends', { withCredentials: true });
      setFriends(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/friends/search?q=${encodeURIComponent(searchTerm)}`, { withCredentials: true });
      setSearchResults(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (friendId) => {
    try {
      await axios.post(`http://localhost:5000/api/friends/add/${friendId}`, {}, { withCredentials: true });
      // Refresh friends list
      fetchFriends();
      // Remove from search results
      setSearchResults(searchResults.filter(user => user._id !== friendId));
    } catch (err) {
      console.log(err);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(`http://localhost:5000/api/friends/remove/${friendId}`, { withCredentials: true });
      // Refresh friends list
      fetchFriends();
    } catch (err) {
      console.log(err);
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
            <div className="flex items-center gap-3 py-2 px-3 text-sm font-medium text-slate-900">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Your Squad
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
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
        <div className="bg-slate-300/90 backdrop-blur-sm rounded-3xl px-6 py-4 mb-6">
          <div>
            <h1 className="text-slate-800 text-xl font-semibold">Your Squad</h1>
            <p className="text-slate-600 text-sm">Connect and compete with your friends</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-blue-400 text-lg">🔍</span>
            </div>
            <h2 className="text-white text-lg font-medium">Find Friends</h2>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by username or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-300/80 text-slate-800 rounded-xl border border-slate-400/30 focus:border-blue-500 focus:outline-none placeholder-slate-500"
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
            <button
              onClick={searchUsers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span>🔄</span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white text-lg font-medium mb-4">Search Results</h3>
              <div className="space-y-3">
                {searchResults.map(user => (
                  <div key={user._id} className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 hover:bg-slate-300/90 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-800 font-medium">{user.name}</p>
                          <p className="text-slate-600 text-sm">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => addFriend(user._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <span>👥</span>
                        <span>Add Friend</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-green-400 text-lg">👥</span>
            </div>
            <h2 className="text-white text-lg font-medium">Your Squad ({friends.length})</h2>
          </div>
          
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map(friend => (
                <div key={friend._id} className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 hover:bg-slate-300/90 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-800 font-medium">{friend.name}</p>
                        <p className="text-slate-600 text-sm">@{friend.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1">
                        <span>💬</span>
                        <span>Message</span>
                      </button>
                      <button
                        onClick={() => removeFriend(friend._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                      >
                        <span>❌</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-slate-300 text-lg mb-2">No squad members yet</p>
              <p className="text-slate-400">Search for users above to build your squad!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Friends;
