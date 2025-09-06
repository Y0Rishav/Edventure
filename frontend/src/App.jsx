import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import ChapterViewer from './components/ChapterViewer';
import Leaderboard from './components/Leaderboard';
// import Battlegrounds from './components/Battlegrounds';
import BattlegroundsLobby from './components/BattlegroundsLobby';
import BattlegroundsGame from './components/BattlegroundsGame';
import Friends from './components/Friends';
import ForgotPassword from './components/ForgotPassword';
import Chatbot from './components/Chatbot';

import Home from './components/Home';
import Contact from './components/Contact';
import Help from './components/Help';
import Details from './components/Details';
import Profile from './components/Profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/chapter/:id" element={<ChapterViewer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        {/* <Route path="/battlegrounds" element={<Battlegrounds />} /> */}
        <Route path="/battlegrounds/lobby" element={<BattlegroundsLobby />} />
        <Route path="/battlegrounds/game" element={<BattlegroundsGame />} />
        {/* <Route path="/battlegrounds/leaderboard" element={<BattlegroundsLeaderboard />} /> */}
        <Route path="/friends" element={<Friends />} />

        <Route path="/contact" element= {<Contact />} />

        <Route path="/help" element={<Help />} />

        <Route path="/details"element={<Details />} />
        <Route path="/profile"element={<Profile />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App
