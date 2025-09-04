import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import ChapterViewer from './components/ChapterViewer';
import Leaderboard from './components/Leaderboard';
import Battlegrounds from './components/Battlegrounds';
import BattlegroundsLobby from './components/BattlegroundsLobby';
import BattlegroundsGame from './components/BattlegroundsGame';
import BattlegroundsLeaderboard from './components/BattlegroundsLeaderboard';
import Friends from './components/Friends';
// import './App.css' // Commented out to prevent conflicts with Tailwind

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/chapter/:id" element={<ChapterViewer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/battlegrounds" element={<Battlegrounds />} />
        <Route path="/battlegrounds/lobby" element={<BattlegroundsLobby />} />
        <Route path="/battlegrounds/game" element={<BattlegroundsGame />} />
        <Route path="/battlegrounds/leaderboard" element={<BattlegroundsLeaderboard />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </Router>
  );
}

export default App
