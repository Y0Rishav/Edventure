import { useState, useEffect } from 'react';
import axios from 'axios';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      // For now, we'll simulate friends data
      // In a real app, this would come from the backend
      setFriends([
        { _id: '1', username: 'student1', name: 'Alex Johnson' },
        { _id: '2', username: 'mathwiz', name: 'Sarah Chen' },
        { _id: '3', username: 'sciencefan', name: 'Mike Davis' }
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Simulate search results
      // In a real app, this would search the backend
      const mockResults = [
        { _id: '4', username: 'physics_pro', name: 'Emma Wilson' },
        { _id: '5', username: 'chemistry_master', name: 'David Brown' },
        { _id: '6', username: 'biology_expert', name: 'Lisa Garcia' }
      ].filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (friendId) => {
    try {
      // In a real app, this would send a friend request to the backend
      const friendToAdd = searchResults.find(user => user._id === friendId);
      if (friendToAdd) {
        setFriends([...friends, friendToAdd]);
        setSearchResults(searchResults.filter(user => user._id !== friendId));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      setFriends(friends.filter(friend => friend._id !== friendId));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4">
        <h1 className="text-2xl">Friends</h1>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Search Section */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl mb-4">Find Friends</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by username or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
            <button
              onClick={searchUsers}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg mb-2">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                    <button
                      onClick={() => addFriend(user._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl mb-4">Your Friends ({friends.length})</h2>
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map(friend => (
                <div key={friend._id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-sm text-gray-600">@{friend.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                      Message
                    </button>
                    <button
                      onClick={() => removeFriend(friend._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No friends yet. Search for users to add as friends!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;
