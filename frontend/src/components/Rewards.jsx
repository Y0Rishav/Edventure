import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Star, Trophy, BookOpen, Award, Zap } from 'lucide-react';
import axios from 'axios';
import SideBar from './SideBar';

function Rewards() {
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlockedCourses, setUnlockedCourses] = useState(new Set([1])); // Default to course 1 unlocked

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      // Redirect to login or home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // --- 1. MODIFIED: Fetch user data and unlocked courses ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios("http://localhost:5000/auth/current_user", {
          withCredentials: true
        });
        const data = response.data;
        if (data) {
          setUserPoints(data.points);
          // Initialize the unlocked courses from the database
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
      gradient: "from-green-400 to-green-600"
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
      gradient: "from-blue-400 to-blue-600"
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
      gradient: "from-yellow-400 to-yellow-600"
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
      gradient: "from-purple-400 to-purple-600"
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
      gradient: "from-red-400 to-red-600"
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
      gradient: "from-indigo-400 to-indigo-600"
    }
  ];

  const isUnlocked = (courseId) => {
    return unlockedCourses.has(courseId);
  };

  const canUnlock = (required) => {
    return userPoints >= required;
  };

  // --- 2. MODIFIED: Call the new backend route ---
  const handleUnlockCourse = async (course) => {
    if (canUnlock(course.pointsRequired) && !isUnlocked(course.id)) {
      try {
        const newPoints = userPoints - course.pointsRequired;
        
        // Call the new dedicated route for unlocking a course
        const response = await axios.post('http://localhost:5000/auth/unlock-course', 
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
          // Update frontend state only after successful backend update
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1F2B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9BE9FD]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1F2B] text-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <SideBar onLogout={handleLogout} />

      {/* Main Content Container */}
      <div className="flex-1 ml-64 py-8 px-4">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#9BE9FD] mb-4">
              🎉 Rewards & Courses
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Unlock premium courses by earning points!
            </p>
            
            {/* Points Display */}
            <div className="bg-[#0A1A2E] rounded-2xl shadow-lg p-6 max-w-md mx-auto border border-[#9BE9FD]/30">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-[#9BE9FD] mr-3" />
                <span className="text-3xl font-bold text-[#9BE9FD]">{userPoints}</span>
                <span className="text-lg text-gray-200 ml-2">Points</span>
              </div>
              <div className="text-sm text-gray-400">Keep learning to earn more points!</div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const unlocked = isUnlocked(course.id);
              const canAfford = canUnlock(course.pointsRequired);
              const isFree = course.pointsRequired === 0;
              
              return (
                <div
                  key={course.id}
                  className={`bg-[#0A1A2E] rounded-[30px] shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-[#9BE9FD]/30 hover:border-[#9BE9FD]/50 ${
                    unlocked ? 'ring-2 ring-[#9BE9FD]/60' : canAfford ? 'hover:scale-105 hover:shadow-[#9BE9FD]/20' : 'opacity-75'
                  }`}
                >
                  {/* Course Header */}
                  <div className={`bg-gradient-to-r ${course.gradient} p-6 text-white relative`}>
                    {unlocked && (
                      <div className="absolute top-4 right-4 bg-[#9BE9FD]/20 rounded-full p-2">
                        <Unlock className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {course.icon}
                        <span className="ml-3 text-sm font-semibold">{course.level}</span>
                      </div>
                      <div className="flex items-center">
                        {!unlocked && (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-sm opacity-90">{course.duration}</p>
                  </div>

                  {/* Course Body */}
                  <div className="p-6">
                    <p className="text-gray-200 mb-6 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Status */}
                    <div className="mb-6">
                      {unlocked ? (
                        <div className="flex items-center justify-center py-3 px-4 bg-[#9BE9FD]/15 rounded-xl border border-[#9BE9FD]/30">
                          <Unlock className="w-5 h-5 text-[#9BE9FD] mr-2" />
                          <span className="text-[#9BE9FD] font-semibold">Course Unlocked!</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-300">
                              {isFree ? 'Free Course' : 'Unlock Cost'}
                            </span>
                            <span className="text-lg font-bold text-[#9BE9FD]">
                              {isFree ? 'FREE' : `${course.pointsRequired} pts`}
                            </span>
                          </div>
                          
                          {!canAfford && !isFree && (
                            <div className="text-xs text-red-300 mb-3">
                              Need {course.pointsRequired - userPoints} more points
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {unlocked ? (
                      <button className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r ${course.gradient} text-white hover:shadow-lg hover:scale-105`}>
                        Start Learning
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockCourse(course)}
                        disabled={!canAfford}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                          canAfford
                            ? `bg-[#9BE9FD] text-[#002732] hover:shadow-lg hover:scale-105 transform active:scale-95`
                            : 'bg-[#C4C4C4]/50 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        {isFree ? 'Unlock Free Course' : `Unlock for ${course.pointsRequired} Points`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rewards;
