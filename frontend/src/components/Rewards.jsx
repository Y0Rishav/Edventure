import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Star, Trophy, BookOpen, Award, Zap } from 'lucide-react';
import axios from 'axios';
import SideBar from './SideBar';

// FlameIcon component for gamified streak display
const FlameIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#streak-glow)" />
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

function Rewards() {
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlockedCourses, setUnlockedCourses] = useState(new Set([1])); // Default to course 1 unlocked

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch user data and unlocked courses
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios(`${import.meta.env.VITE_BACKEND_URL}/auth/current_user`, {
          withCredentials: true
        });
        const data = response.data;
        if (data) {
          setUserPoints(data.points);
          setUnlockedCourses(new Set(data.unlockedCourses || [1]));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const courses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      pointsRequired: 0,
      duration: "4 weeks",
      level: "Beginner",
      icon: <BookOpen className="w-8 h-8" />,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-700"
    },
    {
      id: 2,
      title: "React Fundamentals",
      description: "Master React components, hooks, and state management",
      pointsRequired: 200,
      duration: "6 weeks",
      level: "Intermediate",
      icon: <Zap className="w-8 h-8" />,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      id: 3,
      title: "Advanced JavaScript Concepts",
      description: "Closures, async/await, and advanced ES6+ features",
      pointsRequired: 500,
      duration: "5 weeks",
      level: "Intermediate",
      icon: <Star className="w-8 h-8" />,
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-700"
    },
    {
      id: 4,
      title: "Full-Stack Development",
      description: "Build complete web applications with Node.js and databases",
      pointsRequired: 800,
      duration: "8 weeks",
      level: "Advanced",
      icon: <Trophy className="w-8 h-8" />,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-700"
    },
    {
      id: 5,
      title: "Machine Learning Basics",
      description: "Introduction to AI and machine learning concepts",
      pointsRequired: 1200,
      duration: "10 weeks",
      level: "Advanced",
      icon: <Award className="w-8 h-8" />,
      color: "bg-red-500",
      gradient: "from-red-500 to-red-700"
    },
    {
      id: 6,
      title: "Cloud Architecture Mastery",
      description: "AWS, Docker, and scalable system design",
      pointsRequired: 1500,
      duration: "12 weeks",
      level: "Expert",
      icon: <Trophy className="w-8 h-8" />,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-700"
    }
  ];

  const isUnlocked = (courseId) => {
    return unlockedCourses.has(courseId);
  };

  const canUnlock = (required) => {
    return userPoints >= required;
  };

  // Handle course unlocking
  const handleUnlockCourse = async (course) => {
    if (canUnlock(course.pointsRequired) && !isUnlocked(course.id)) {
      try {
        const newPoints = userPoints - course.pointsRequired;
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/unlock-course`, 
          { 
            newPoints: newPoints,
            courseId: course.id 
          }, 
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.status === 200) {
          setUserPoints(newPoints);
          setUnlockedCourses(prev => new Set([...prev, course.id]));
        } else {
          console.error('Failed to unlock course:', response.statusText);
          alert('Failed to unlock course. Please try again.');
        }
      } catch (error) {
        console.error('Error unlocking course:', error);
        alert('Network error. Please check your connection and try again.');
      }
    }
  };

  // Calculate progress to next course
  const nextCourse = courses.find(course => !isUnlocked(course.id) && course.pointsRequired > 0);
  const progressToNext = nextCourse ? Math.min((userPoints / nextCourse.pointsRequired) * 100, 100) : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
        <div className="text-[#9AE9FD] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2B] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <SideBar onLogout={handleLogout} />
      <div className="md:ml-64 p-8">
        {/* Header */}
        <div className="bg-[#7FB3C1] rounded-2xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-[#002732] mb-4 text-center">Rewards & Courses</h1>

          <p className="text-lg text-[#002732] mb-6 text-center">Unlock epic courses by earning points!</p>
          <div className="bg-[#1E3A47] rounded-xl p-4 max-w-md mx-auto border border-[#2A4A57]">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-[#9AE9FD] mr-3" />
              <span className="text-3xl font-bold text-[#9AE9FD]">{userPoints}</span>
              <span className="text-lg text-white ml-2">Points</span>
            </div>
            <div className="text-sm text-gray-400 text-center">Keep learning to conquer more challenges!</div>
            
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const unlocked = isUnlocked(course.id);
            const canAfford = canUnlock(course.pointsRequired);
            const isFree = course.pointsRequired === 0;

            return (
              <div
                key={course.id}
                className={`bg-[#1E3A47] rounded-2xl p-6 border border-[#2A4A57] transition-all duration-300 hover:shadow-xl hover:border-[#9AE9FD]/50 ${
                  unlocked ? 'ring-2 ring-[#9AE9FD]/60' : canAfford ? 'hover:scale-105 hover:shadow-[#9AE9FD]/20' : 'opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {course.icon}
                    <span className="text-sm font-semibold text-white">{course.level}</span>
                  </div>
                  {unlocked ? (
                    <div className="bg-[#9AE9FD]/20 rounded-full p-2">
                      <Unlock className="w-5 h-5 text-[#9AE9FD]" />
                    </div>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#9AE9FD] mb-2">{course.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{course.duration}</p>
                <p className="text-gray-200 mb-6">{course.description}</p>
                {unlocked ? (
                  <div className="flex items-center justify-center py-2 px-4 bg-[#9AE9FD]/15 rounded-xl border border-[#9AE9FD]/30 mb-4">
                    <Unlock className="w-5 h-5 text-[#9AE9FD] mr-2" />
                    <span className="text-[#9AE9FD] font-semibold">Course Unlocked!</span>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {isFree ? 'Free Course' : 'Unlock Cost'}
                      </span>
                      <span className="text-lg font-bold text-[#9AE9FD]">
                        {isFree ? 'FREE' : `${course.pointsRequired} pts`}
                      </span>
                    </div>
                    {!canAfford && !isFree && (
                      <div className="text-xs text-red-400">
                        Need {course.pointsRequired - userPoints} more points
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => unlocked ? null : handleUnlockCourse(course)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    unlocked
                      ? `bg-gradient-to-r ${course.gradient} text-white hover:shadow-lg hover:scale-105`
                      : canAfford
                      ? 'bg-[#9AE9FD] text-[#002732] hover:shadow-lg hover:scale-105 transform active:scale-95'
                      : 'bg-gray-600 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {unlocked ? 'Start Learning' : isFree ? 'Unlock Free Course' : `Unlock for ${course.pointsRequired} Points`}
                </button>
              </div>
            );
          })}
        </div>

        
      </div>
    </div>
  );
}

export default Rewards;