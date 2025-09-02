import { useEffect, useState } from 'react';
import axios from 'axios';
import ProfileSetup from './ProfileSetup';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.log(err);
      setError('Failed to load user data. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  if (!user) return <div className="min-h-screen flex items-center justify-center">Please log in</div>;

  if (!user.username || !user.age || !user.class || !user.subjects || user.subjects.length === 0) {
    return <ProfileSetup user={user} onComplete={fetchUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4 flex justify-between items-center">
        <h1 className="text-2xl">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </header>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-xl mb-2">Welcome, {user.name}!</h2>
          <p>Username: {user.username}</p>
          <p>Class: {user.class}</p>
          <p>Age: {user.age}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Points: {user.points}</h3>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Badges</h3>
            <ul>{user.badges && user.badges.map(badge => <li key={badge}>{badge}</li>)}</ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Subjects</h3>
            <ul>{user.subjects && user.subjects.map(subject => <li key={subject}>{subject}</li>)}</ul>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-xl mb-4">Your Subjects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.subjects && user.subjects.map(subject => (
              <div key={subject} className="bg-white p-4 rounded shadow">
                <h4 className="text-lg mb-2">{subject}</h4>
                <Link to={`/courses?subject=${encodeURIComponent(subject)}`} className="bg-blue-500 text-white px-4 py-2 rounded">View Courses</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
