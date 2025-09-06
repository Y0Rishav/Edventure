import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './SideBar'; // Import the Sidebar component

function Friends() {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

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

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-[#0A1F2B] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Use imported Sidebar component */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="bg-[#B8C5C9] rounded-2xl p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#002732] mb-2">Your Squad</h1>
            <p className="text-[#002732] text-sm">Connect and compete with your friends • {friends.length} members</p>
          </div>
          <div className="bg-[#0A1F2B] rounded-xl p-4">
            <div className="text-white text-2xl font-bold">{friends.length}</div>
            <div className="text-[#9AE9FD] text-xs">Squad Size</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-[#0A1F2B] rounded-2xl p-6 mb-8 border border-[#2A4A57]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#9AE9FD]/20 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="#9AE9FD" strokeWidth="2"/>
                <path d="21 21L16.65 16.65" stroke="#9AE9FD" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-[#9AE9FD] text-xl font-semibold">Find New Squad Members</h2>
              <p className="text-white/70 text-sm">Search for friends to expand your learning squad</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by username or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-[#7FB3C1] text-[#002732] rounded-xl border-2 border-transparent focus:border-[#9AE9FD] focus:outline-none placeholder-[#144F5F] font-medium"
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#144F5F]" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <button
              onClick={searchUsers}
              disabled={loading}
              className="bg-[#144F5F] hover:bg-[#002732] disabled:bg-[#2A4A57] disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h3 className="text-[#9AE9FD] text-lg font-semibold mb-4 flex items-center gap-2">
                <span>✨</span>
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-3">
                {searchResults.map(user => (
                  <div key={user._id} className="bg-[#0A1F2B] rounded-xl p-5 hover:bg-[#B8C5C9] transition-all duration-300 shadow-md hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="text-[#002732] font-semibold text-lg">{user.name}</p>
                          <p className="text-[#144F5F] text-sm flex items-center gap-1">
                            <span>@</span>{user.username}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addFriend(user._id)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>Add to Squad</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="bg-[#0A1F2B] rounded-2xl p-6 border border-[#2A4A57]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="2"/>
                  <circle cx="8.5" cy="7" r="4" stroke="white" strokeWidth="2"/>
                  <path d="M20 8V14M23 11H17" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-[#9AE9FD] text-xl font-semibold">Squad Members</h2>
                <p className="text-white/70 text-sm">{friends.length} active members in your learning squad</p>
              </div>
            </div>
          </div>
          
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {friends.map(friend => (
                <div key={friend._id} className="bg-[#7FB3C1] rounded-xl p-5 hover:bg-[#B8C5C9] transition-all duration-300 shadow-md hover:shadow-lg group">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">
                          {getInitials(friend.name)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[#002732] font-semibold text-lg">{friend.name}</p>
                      <p className="text-[#144F5F] text-sm">@{friend.username}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[#144F5F] text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Online</span>
                      </div>
                      <span>•</span>
                      <span>Squad Member</span>
                    </div>
                    
                    <div className="pt-2 w-full">
                      <button
                        onClick={() => removeFriend(friend._id)}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          <path d="M23 11H17" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>Remove from Squad</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[#2A4A57] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9AE9FD" strokeWidth="2"/>
                  <circle cx="8.5" cy="7" r="4" stroke="#9AE9FD" strokeWidth="2"/>
                  <path d="M20 8V14M23 11H17" stroke="#9AE9FD" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-[#9AE9FD] text-xl font-semibold mb-3">No Squad Members Yet</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">Start building your learning squad by searching for friends above. Learning together makes everything more fun!</p>
              <div className="flex justify-center">
                <button 
                  onClick={() => document.querySelector('input').focus()}
                  className="bg-[#144F5F] hover:bg-[#002732] text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Start Searching</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Friends;
