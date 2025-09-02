import { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/current_user')
      .then(res => setUser(res.data))
      .catch(err => console.log(err));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4">
        <h1 className="text-2xl">Dashboard</h1>
        <p>Welcome, {user.name}!</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Points: {user.points}</h3>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Badges</h3>
          <ul>{user.badges.map(badge => <li key={badge}>{badge}</li>)}</ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Subjects</h3>
          <ul>{user.subjects.map(subject => <li key={subject}>{subject}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
