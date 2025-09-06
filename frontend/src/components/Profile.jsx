import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar';
// Your avatar options
const avatarOptions = [
  'https://th.bing.com/th?id=ORMS.ed048131bfcbae2933327f4318b54a71&pid=Wdp&w=268&h=140&qlt=90&c=1&rs=1&dpr=1&p=0',
  'https://th.bing.com/th?id=ORMS.edad18d1f0da77bfb9db67c7e96c3cea&pid=Wdp&w=612&h=304&qlt=90&c=1&rs=1&dpr=1.25&p=0',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
];

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[1]);
  const [showAvatarList, setShowAvatarList] = useState(false);
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Replace this mock data with your actual axios call:
        
        const response = await axios('http://localhost:5000/auth/current_user', {
          withCredentials: true
        });
        const data = response.data;
        
        
        // Mock data for demo
       
        
        setUser(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch user data. Please try logging in again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center p-10 text-lg">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500 text-lg">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-10 text-lg">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <Sidebar onLogout={handleLogout}/>
      <div className="max-w-2xl mx-auto">
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-12 text-center relative">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative py-2.5">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.name || 'User Profile'}
              </h1>
             
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative -mt-16 px-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Avatar Circle */}
                <div 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300 overflow-hidden bg-gray-200"
                  onClick={() => setShowAvatarList(!showAvatarList)}
                >
                  <img 
                    src={selectedAvatar} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Avatar Dropdown */}
                {showAvatarList && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-20 min-w-max">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">Choose Avatar</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {avatarOptions.map((avatar, index) => (
                        <div
                          key={index}
                          className={`w-16 h-16 rounded-full cursor-pointer border-2 overflow-hidden hover:border-purple-400 transition-all duration-200 hover:scale-110 ${
                            selectedAvatar === avatar ? 'border-purple-500 ring-4 ring-purple-200' : 'border-gray-200'
                          }`}
                          onClick={() => {
                            setSelectedAvatar(avatar);
                            setShowAvatarList(false);
                          }}
                        >
                          <img
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Points Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-8 py-4 shadow-lg">
                <span className="text-2xl">⭐</span>
                <span className="text-white font-bold text-xl">{user.points}</span>
                <span className="text-yellow-100 font-medium">Points</span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-8 pb-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6">
              Profile Details
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-800 font-semibold">{user?.name || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Username:</span>
                  <span className="text-gray-800 font-semibold">{user?.username || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Class:</span>
                  <span className="text-gray-800 font-semibold">{user.class || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Points:</span>
                  <span className="text-green-600 font-bold text-lg">{user.points} ✨</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Age:</span>
                  <span className="text-gray-800 font-semibold">{user?.age || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;