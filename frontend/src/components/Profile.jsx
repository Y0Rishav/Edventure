import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Sidebar from './SideBar';
import avatar1 from '../assets/avatars/1.png';
import avatar2 from '../assets/avatars/2.png';
import avatar3 from '../assets/avatars/3.png';
import avatar4 from '../assets/avatars/4.png';

const avatarOptions = [avatar1, avatar2, avatar3, avatar4];

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios('http://localhost:5000/auth/current_user', { withCredentials: true });
        const data = response.data;
        
        if (data) {
          setUser(data);
          if (data.avatar) {
            setSelectedAvatar(data.avatar);
          }
          setFormData({
            username: data.username || '',
            class: data.class || '',
            age: data.age || ''
          });
        }
        setError('');
      } catch (err) {
        setError('Failed to summon hero data. Please try logging in again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarSelect = async (newAvatarUrl) => {
    setSelectedAvatar(newAvatarUrl);
    setShowAvatarList(false);

    try {
      await axios.post('http://localhost:5000/auth/update-avatar', 
        { avatarUrl: newAvatarUrl },
        { withCredentials: true }
      );
      setUser(prevUser => ({ ...prevUser, avatar: newAvatarUrl }));
    } catch (err) {
      console.error('Failed to save avatar:', err);
      if (user && user.avatar) {
        setSelectedAvatar(user.avatar);
      }
      alert('Could not save your new avatar. Please try again.');
    }
  };

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
      
      setUser(prevUser => ({
        ...prevUser,
        username: formData.username,
        age: formData.age,
        class: formData.class
      }));
      
      setIsEditing(false);
      alert('Hero profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#9AE9FD] mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-[#9AE9FD] animate-pulse">Summoning Hero Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
        <div className="text-center text-[#9AE9FD] text-2xl">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
        <div className="text-center text-[#9AE9FD] text-2xl">Hero not found.</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#0A1F2B] flex relative overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Particle Effect Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#9AE9FD] rounded-full opacity-20 animate-float top-10 left-20"></div>
        <div className="absolute w-3 h-3 bg-[#7FB3C1] rounded-full opacity-15 animate-float-slow top-40 right-30"></div>
        <div className="absolute w-2 h-2 bg-[#9AE9FD] rounded-full opacity-15 animate-float bottom-20 left-40"></div>
        <div className="absolute w-1.5 h-1.5 bg-[#9AE9FD] rounded-full opacity-25 animate-float top-60 left-60"></div>
        <div className="absolute w-2.5 h-2.5 bg-[#7FB3C1] rounded-full opacity-20 animate-float-slow bottom-40 right-20"></div>
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-[#001318]/20 to-transparent"></div>

      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col items-center justify-center z-10 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl bg-[#1E3A47] rounded-[30px] p-6 sm:p-8 lg:p-10 flex flex-col border-2 border-[#2A4A57] shadow-lg">
          <h1 
            className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-[#9AE9FD] text-center mb-8 sm:mb-10 flex items-center justify-center gap-2"
            style={{ textShadow: '0 0 10px rgba(154, 233, 253, 0.7)' }}
          >
            Hero Profile
          </h1>

          {/* Avatar Section */}
          <div className="flex justify-center mb-8 sm:mb-10">
            <div className="relative">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#9AE9FD]/70 shadow-lg cursor-pointer hover:scale-110 transition-all duration-300 overflow-hidden"
                onClick={() => setShowAvatarList(!showAvatarList)}
              >
                <img 
                  src={selectedAvatar} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {showAvatarList && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-[#1E3A47] rounded-2xl shadow-xl border-2 border-[#2A4A57] p-4 sm:p-6 z-20 min-w-max">
                  <h4 className="text-sm sm:text-md font-semibold text-[#9AE9FD] mb-4 text-center">Choose Your Hero Avatar</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {avatarOptions.map((avatar, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full cursor-pointer border-2 overflow-hidden hover:border-[#9AE9FD] transition-all duration-200 hover:scale-110 ${
                          selectedAvatar === avatar ? 'border-[#9AE9FD] ring-4 ring-[#9AE9FD]/30' : 'border-[#7FB3C1]/50'
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

          {/* Points Display */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#B8C5C9] to-[#7FB3C1] rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-lg">
              <span className="text-xl sm:text-2xl">⭐</span>
              <span className="text-[#002732] font-bold text-lg sm:text-xl">{user.points}</span>
              <span className="text-[#002732] font-medium">Quest Points</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="bg-[#7FB3C1] rounded-xl p-4 border-2 border-[#2A4A57] shadow-md hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-center">
                <span className="text-[#101a1b] font-medium">Name:</span>
                <span className="text-[#002732] font-semibold">{user?.name || 'Not specified'}</span>
              </div>
            </div>
            <div className="bg-[#7FB3C1] rounded-xl p-4 border-2 border-[#2A4A57] shadow-md hover:scale-105 transition-all duration-300">
              <div className="flex flex-col gap-2">
                <span className="text-[#101a1b] font-medium">Username:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full h-10 sm:h-11 bg-[#B8C5C9] px-4 text-[#002732] text-base sm:text-lg border-none outline-none rounded-md focus:ring-2 focus:ring-[#9AE9FD]"
                    placeholder="Enter username"
                  />
                ) : (
                  <span className="text-[#002732] font-semibold">{user?.username || 'Not specified'}</span>
                )}
              </div>
            </div>
            <div className="bg-[#7FB3C1] rounded-xl p-4 border-2 border-[#2A4A57] shadow-md hover:scale-105 transition-all duration-300">
              <div className="flex flex-col gap-2">
                <span className="text-[#101a1b] font-medium">Class:</span>
                {isEditing ? (
                  <select
                    value={formData.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className="w-full h-10 sm:h-11 bg-[#B8C5C9] px-4 text-[#002732] text-base sm:text-lg border-none outline-none rounded-md focus:ring-2 focus:ring-[#9AE9FD]"
                  >
                    <option value="">Select class</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[#002732] font-semibold">{user.class || 'Not specified'}</span>
                )}
              </div>
            </div>
            <div className="bg-[#7FB3C1] rounded-xl p-4 border-2 border-[#2A4A57] shadow-md hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-center">
                <span className="text-[#101a1b] font-medium">Points:</span>
                <span className="text-[#002732] font-bold text-base sm:text-lg">{user.points} ✨</span>
              </div>
            </div>
            <div className="bg-[#7FB3C1] rounded-xl p-4 border-2 border-[#2A4A57] shadow-md hover:scale-105 transition-all duration-300">
              <div className="flex flex-col gap-2">
                <span className="text-[#101a1b] font-medium">Age:</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full h-10 sm:h-11 bg-[#B8C5C9] px-4 text-[#002732] text-base sm:text-lg border-none outline-none rounded-md focus:ring-2 focus:ring-[#9AE9FD]"
                    placeholder="Enter age"
                    min="1"
                    max="100"
                  />
                ) : (
                  <span className="text-[#002732] font-semibold">{user?.age || 'Not specified'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 sm:mt-10">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-48 h-12 bg-[#B8C5C9] hover:bg-[#7FB3C1] text-[#002732] font-black text-base sm:text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span role="img" aria-label="edit">✨</span> Edit Hero
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: user.username || '',
                      class: user.class || '',
                      age: user.age || ''
                    });
                  }}
                  className="w-full sm:w-48 h-12 bg-[#144F5F] hover:bg-[#002732] text-white font-black text-base sm:text-lg rounded-full transition-all duration-300 border-2 border-[#2A4A57] shadow-lg hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="w-full sm:w-48 h-12 bg-[#B8C5C9] hover:bg-[#7FB3C1] text-[#002732] font-black text-base sm:text-lg rounded-full transition-all duration-300 disabled:bg-[#2A4A57] disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {updating ? 'Updating...' : 'Save Hero'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for Particle Animations and Radial Gradient */}
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
        .bg-gradient-radial {
          background-image: radial-gradient(circle at center, rgba(0, 19, 24, 0.2), transparent);
        }
      `}</style>
    </div>
  );
}

export default Profile;