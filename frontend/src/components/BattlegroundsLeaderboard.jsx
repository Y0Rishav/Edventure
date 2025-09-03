import { useEffect, useState } from 'react';
import axios from 'axios';

function BattlegroundsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // For now, we'll simulate battlegrounds leaderboard data
      // In a real app, this would come from the backend
      const mockData = [
        {
          _id: '1',
          username: 'math_master',
          name: 'Alex Chen',
          battlegroundsStats: {
            totalGames: 25,
            wins: 18,
            losses: 7,
            winRate: 72,
            totalPoints: 2450,
            averageScore: 85,
            bestStreak: 8
          }
        },
        {
          _id: '2',
          username: 'science_wiz',
          name: 'Sarah Johnson',
          battlegroundsStats: {
            totalGames: 22,
            wins: 15,
            losses: 7,
            winRate: 68,
            totalPoints: 2100,
            averageScore: 78,
            bestStreak: 6
          }
        },
        {
          _id: '3',
          username: 'physics_pro',
          name: 'Mike Davis',
          battlegroundsStats: {
            totalGames: 20,
            wins: 12,
            losses: 8,
            winRate: 60,
            totalPoints: 1800,
            averageScore: 72,
            bestStreak: 5
          }
        }
      ];
      setLeaderboard(mockData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading leaderboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-purple-600 text-white p-4 mb-4">
        <h1 className="text-2xl">Battlegrounds Leaderboard</h1>
        <a href="/battlegrounds" className="text-white underline mr-4">Back to Battlegrounds</a>
        <a href="/dashboard" className="text-white underline">Dashboard</a>
      </header>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Top Battlegrounds Players</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-center">Games</th>
                  <th className="px-4 py-2 text-center">W/L</th>
                  <th className="px-4 py-2 text-center">Win Rate</th>
                  <th className="px-4 py-2 text-center">Points</th>
                  <th className="px-4 py-2 text-center">Avg Score</th>
                  <th className="px-4 py-2 text-center">Best Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr key={player._id} className={`border-t ${index < 3 ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : ''}`}>
                          #{index + 1}
                        </span>
                        {index < 3 && (
                          <span className="ml-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-gray-500">@{player.username}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{player.battlegroundsStats.totalGames}</td>
                    <td className="px-4 py-3 text-center">
                      {player.battlegroundsStats.wins}/{player.battlegroundsStats.losses}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${player.battlegroundsStats.winRate >= 70 ? 'text-green-600' : player.battlegroundsStats.winRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {player.battlegroundsStats.winRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{player.battlegroundsStats.totalPoints}</td>
                    <td className="px-4 py-3 text-center">{player.battlegroundsStats.averageScore}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-purple-600 font-semibold">{player.battlegroundsStats.bestStreak}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-2">Your Stats</h3>
            <div className="space-y-1 text-sm">
              <div>Games Played: 5</div>
              <div>Wins: 3</div>
              <div>Win Rate: 60%</div>
              <div>Current Rank: #12</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-2">Recent Achievements</h3>
            <div className="space-y-1 text-sm">
              <div>🎯 First Win - Complete your first battle</div>
              <div>🔥 Win Streak - Win 3 games in a row</div>
              <div>⚡ Speed Demon - Answer all questions in under 30s</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <a href="/battlegrounds" className="block bg-purple-500 text-white text-center py-2 px-4 rounded hover:bg-purple-600">
                Start New Game
              </a>
              <a href="/friends" className="block bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600">
                Invite Friends
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattlegroundsLeaderboard;
