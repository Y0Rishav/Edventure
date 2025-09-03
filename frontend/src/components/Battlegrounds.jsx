import { useState } from 'react';
import { Link } from 'react-router-dom';

function Battlegrounds() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 mb-4 flex justify-between items-center">
        <h1 className="text-2xl">Battlegrounds</h1>
        <div>
          <Link to="/battlegrounds/leaderboard" className="text-white underline mr-4">Leaderboard</Link>
          <Link to="/dashboard" className="text-white underline">Back to Dashboard</Link>
        </div>
      </header>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl mb-4">Welcome to Battlegrounds!</h2>
          <p className="mb-4">Challenge yourself and compete with others in educational battles.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Practice Mode</h3>
              <p className="text-sm mb-3">Test your knowledge without pressure</p>
              <Link to="/battlegrounds/lobby?mode=practice" className="bg-blue-500 text-white px-4 py-2 rounded">Start Practice</Link>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Competitive Mode</h3>
              <p className="text-sm mb-3">Battle against other players</p>
              <Link to="/battlegrounds/lobby?mode=competitive" className="bg-green-500 text-white px-4 py-2 rounded">Enter Lobby</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Battlegrounds;
