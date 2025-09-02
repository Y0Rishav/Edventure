import { useEffect, useState } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/leaderboard')
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4">
        <h1 className="text-2xl">Leaderboard</h1>
        <a href="/dashboard" className="text-white underline">Back to Dashboard</a>
      </header>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {users.map((user, index) => (
            <div key={user._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <span className="font-bold">{index + 1}. </span>
                <span>{user.name} ({user.username})</span>
              </div>
              <div className="text-right">
                <div>{user.points} points</div>
                <div className="text-sm text-gray-500">{user.badges ? user.badges.join(', ') : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
