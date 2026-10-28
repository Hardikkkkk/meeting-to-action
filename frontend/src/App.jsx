import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Avatar from './components/Avatar.jsx';
import Home from './pages/Home.jsx';
import NewMeeting from './pages/NewMeeting.jsx';
import Meetings from './pages/Meetings.jsx';
import TaskBoard from './pages/TaskBoard.jsx';
import People from './pages/People.jsx';

const Settings = () => (
  <div className="card">
    <h2>Settings</h2>
    <p className="muted">Profile and preferences will be added in a later phase.</p>
  </div>
);

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <input placeholder="Search meetings, people, or tasks..." aria-label="Search" />
          <span className="bell" aria-label="Notifications">🔔<i /></span>
          <span className="me"><Avatar person={{ id: 0, name: 'Hardik' }} /> Hardik ⌄</span>
        </header>
        <main className="page">
          <Routes>
            <Route path="/" element={<Navigate to="/new" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/new" element={<NewMeeting />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/people" element={<People />} />
            <Route path="*" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
