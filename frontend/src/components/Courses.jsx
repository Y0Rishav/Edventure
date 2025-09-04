import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const subject = searchParams.get('subject');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(userRes.data);
        if (userRes.data && subject) {
          const coursesRes = await axios.get(`http://localhost:5000/api/courses?subject=${subject}&class=${userRes.data.class}`);
          setCourses(coursesRes.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [subject]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
      <div className="text-white text-lg">Loading...</div>
    </div>
  );

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
            <div className="flex items-center gap-3 py-2 px-3 text-sm font-medium text-slate-900">
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              Subjects
            </div>
            <div className="flex items-center gap-3 py-2 px-3 text-sm">
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
        <div className="bg-slate-300/90 backdrop-blur-sm rounded-3xl px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-slate-800 text-xl font-semibold">Courses for {subject}</h1>
            <p className="text-slate-600 text-sm">Explore and learn from our curated courses</p>
          </div>
          <Link 
            to="/dashboard" 
            className="bg-slate-600/20 hover:bg-slate-600/30 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="max-w-6xl mx-auto">
          {courses.length === 0 ? (
            <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-white text-lg font-medium mb-2">No courses available yet</h3>
              <p className="text-slate-300">We're working on adding courses for this subject. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course._id} className="bg-slate-300/80 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-300/90 transition-all duration-300 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">📖</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-800 text-lg font-semibold mb-2 group-hover:text-slate-900 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-400/30">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <span>📚</span>
                      <span>{course.chapters?.length || 0} Chapters</span>
                    </div>
                    <Link 
                      to={`/course/${course._id}`} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <span>View Course</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Courses;
