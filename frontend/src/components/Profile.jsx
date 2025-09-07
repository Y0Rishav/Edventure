import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar';
import avatar1 from '../assets/avatars/1.png';
import avatar2 from '../assets/avatars/2.png';
import avatar3 from '../assets/avatars/3.png';
import avatar4 from '../assets/avatars/4.png';

// A predefined list of avatar options for the user to choose from
const avatarOptions = [
  avatar1,
  avatar2,
  avatar3,
  avatar4
];

// Placeholder Sidebar component to resolve the dependency error.
// In a real application, this would be in its own file (e.g., ./SideBar.jsx).

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]); // A default before user data loads
  const [showAvatarList, setShowAvatarList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    class: '',
    age: ''
  });
  const [updating, setUpdating] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios('http://localhost:5000/auth/current_user', {
          withCredentials: true
        });
        const data = response.data;
        
        if (data) {
          setUser(data);
          // Set the displayed avatar from the user's saved preference in the database
          if (data.avatar) {
            setSelectedAvatar(data.avatar);
          }
          // Set form data for editing
          setFormData({
            username: data.username || '',
            class: data.class || '',
            age: data.age || ''
          });
        }
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

  // Function to handle updating the avatar
  const handleAvatarSelect = async (newAvatarUrl) => {
    // 1. Optimistically update the UI for a responsive feel
    setSelectedAvatar(newAvatarUrl);
    setShowAvatarList(false);

    try {
      // 2. Call the backend route to save the new avatar URL
      await axios.post('http://localhost:5000/auth/update-avatar', 
        { avatarUrl: newAvatarUrl }, // The request body
        { withCredentials: true }
      );
      // 3. Update the main user state to keep it in sync
      setUser(prevUser => ({ ...prevUser, avatar: newAvatarUrl }));
    } catch (err) {
      console.error('Failed to save avatar:', err);
      // 4. If the API call fails, revert the change and notify the user
      if (user && user.avatar) {
        setSelectedAvatar(user.avatar);
      }
      alert('Could not save your new avatar. Please try again.');
    }
  };

  // Function to handle updating profile
  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const response = await axios.post('http://localhost:5000/auth/update_profile', 
        {
          username: formData.username,
          age: formData.age,
          class: formData.class
        },
        { withCredentials: true }
      );
      
      // Update the user state with new data
      setUser(prevUser => ({
        ...prevUser,
        username: formData.username,
        age: formData.age,
        class: formData.class
      }));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar onLogout={handleLogout}/>
      {/* Main content needs a left margin to not be hidden by the fixed sidebar */}
      <div className="md:ml-64 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-12 text-center relative">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative py-2.5">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.name || 'User Profile'}
                </h1>
              </div>
            </div>

            <div className="relative -mt-16 px-8">
              <div className="flex justify-center mb-8">
                <div className="relative">
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
                            onClick={() => handleAvatarSelect(avatar)}
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

              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-8 py-4 shadow-lg">
                  <span className="text-2xl">⭐</span>
                  <span className="text-white font-bold text-xl">{user.points}</span>
                  <span className="text-yellow-100 font-medium">Points</span>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3">
                  Profile Details
                </h2>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form data to current user data
                          setFormData({
                            username: user.username || '',
                            class: user.class || '',
                            age: user.age || ''
                          });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updating}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        {updating ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="text-gray-800 font-semibold">{user?.name || 'Not specified'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-600 font-medium">Username:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                      />
                    ) : (
                      <span className="text-gray-800 font-semibold">{user?.username || 'Not specified'}</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-600 font-medium">Class:</span>
                    {isEditing ? (
                      <select
                        value={formData.class}
                        onChange={(e) => handleInputChange('class', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select class</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-800 font-semibold">{user.class || 'Not specified'}</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Points:</span>
                    <span className="text-green-600 font-bold text-lg">{user.points} ✨</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-600 font-medium">Age:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter age"
                        min="1"
                        max="100"
                      />
                    ) : (
                      <span className="text-gray-800 font-semibold">{user?.age || 'Not specified'}</span>
                    )}
                  </div>
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