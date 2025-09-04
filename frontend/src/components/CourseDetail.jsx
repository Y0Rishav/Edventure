import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        setUser(userRes.data);
        const courseRes = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(courseRes.data);
      } catch (err) {
        console.log(err);
        setError('Failed to load data. Please check your connection.');
      }
    };
    fetchData();
  }, [id]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
      <div className="text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <div className="text-red-300">{error}</div>
      </div>
    </div>
  );

  if (!course || !user) return (
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
            <h1 className="text-slate-800 text-xl font-semibold">{course.title}</h1>
            <p className="text-slate-600 text-sm">{course.description}</p>
          </div>
          <Link 
            to={`/courses?subject=${course.subject}`} 
            className="bg-slate-600/20 hover:bg-slate-600/30 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors duration-200"
          >
            ← Back to Courses
          </Link>
        </div>

        {/* Course Overview */}
        <div className="bg-slate-600/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">📚</span>
            </div>
            <div>
              <h2 className="text-white text-lg font-medium">Course Overview</h2>
              <p className="text-slate-300">{course.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-slate-700 text-sm mb-1">Chapters</div>
              <div className="text-slate-800 text-xl font-bold">{course.chapters?.length || 0}</div>
            </div>
            <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-slate-700 text-sm mb-1">Subject</div>
              <div className="text-slate-800 text-lg font-semibold">{course.subject}</div>
            </div>
            <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-slate-700 text-sm mb-1">Class</div>
              <div className="text-slate-800 text-lg font-semibold">{course.class}</div>
            </div>
            <div className="bg-slate-300/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-slate-700 text-sm mb-1">Duration</div>
              <div className="text-slate-800 text-lg font-semibold">~{course.chapters?.length * 2 || 0}h</div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-medium mb-4">Chapters</h3>
          <div className="space-y-4">
            {course.chapters && course.chapters.map((chapter, index) => (
              <div key={chapter._id} className="bg-slate-300/80 backdrop-blur-sm rounded-2xl p-6 hover:bg-slate-300/90 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-slate-800 text-lg font-semibold mb-2 group-hover:text-slate-900 transition-colors">
                      {chapter.title}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {chapter.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-slate-600 text-sm">
                        <span className="flex items-center gap-1">
                          <span>📖</span>
                          <span>{chapter.questions?.length || 0} Questions</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>~30 min</span>
                        </span>
                      </div>
                      <Link 
                        to={`/chapter/${chapter._id}`} 
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <span>Start Chapter</span>
                        <span>▶️</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CourseDetail;
