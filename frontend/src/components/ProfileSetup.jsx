import { useState } from 'react';
import axios from 'axios';

function ProfileSetup({ user, onComplete }) {
  const availableSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const [form, setForm] = useState({
    username: user.username || '',
    age: user.age || '',
    class: user.class || '',
    subjects: user.subjects || []
  });

  const handleSubjectChange = (subject, checked) => {
    setForm(prev => ({
      ...prev,
      subjects: checked
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      subjects: form.subjects
    };
    try {
      await axios.post('http://localhost:5000/auth/update_profile', data, { withCredentials: true });
      onComplete();
    } catch (err) {
      console.log('Error updating profile:', err.response ? err.response.data : err.message);
      alert('Error updating profile: ' + (err.response ? err.response.data : err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-teal-500/30 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 border border-teal-500/20 rounded-full"></div>
        <div className="absolute top-40 right-40 w-24 h-24 border border-blue-500/20 rounded-full"></div>

        {/* Main form container */}
        <div className="relative">
          <div className="absolute -left-8 top-0 w-16 h-full bg-white rounded-r-3xl"></div>
          
          <form onSubmit={handleSubmit} className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 relative z-10 ml-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
              <p className="text-slate-300 text-sm">Set up your learning preferences</p>
            </div>

            <div className="space-y-6">
              {/* Username field */}
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl border border-gray-500 focus:border-teal-500 focus:outline-none placeholder-gray-400"
                  required
                />
              </div>

              {/* Age field */}
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Age</label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={form.age}
                  onChange={e => setForm({...form, age: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl border border-gray-500 focus:border-teal-500 focus:outline-none placeholder-gray-400"
                  required
                />
              </div>

              {/* Class field */}
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Class (1-12)</label>
                <input
                  type="number"
                  placeholder="Enter your class"
                  value={form.class}
                  onChange={e => setForm({...form, class: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl border border-gray-500 focus:border-teal-500 focus:outline-none placeholder-gray-400"
                  min="1"
                  max="12"
                  required
                />
              </div>

              {/* Subjects selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-3 font-medium">Favorite Subjects</label>
                <div className="space-y-3">
                  {availableSubjects.map(subject => (
                    <label key={subject} className="flex items-center p-3 bg-gray-600/50 rounded-lg hover:bg-gray-600/70 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.subjects.includes(subject)}
                        onChange={e => handleSubjectChange(subject, e.target.checked)}
                        className="mr-3 w-4 h-4 text-teal-500 bg-gray-600 border-gray-500 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-white">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
              >
                🚀 Complete Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;