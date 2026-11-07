
import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar.jsx';
import Avatar from './components/Avatar.jsx';

import Home from './pages/Home.jsx';
import NewMeeting from './pages/NewMeeting.jsx';
import Meetings from './pages/Meetings.jsx';
import TaskBoard from './pages/TaskBoard.jsx';
import People from './pages/People.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import { useAuth } from './auth/AuthContext.jsx';

const Settings = () => (
  <div className="card">
    <h2>Settings</h2>
    <p className="muted">
      Profile and preferences will be added in a later phase.
    </p>
  </div>
);

function ProtectedLayout() {
  const { isAuthenticated, loading, user, logout } = useAuth();

  if (loading) {
    return <p style={{ padding: '30px' }}>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <header className="topbar">
          <input
            placeholder="Search meetings, people, or tasks..."
            aria-label="Search"
          />

          <span className="bell" aria-label="Notifications">
            🔔<i />
          </span>

          <div className="me">
          <Avatar person={{ id: user.id, name: user.name }} />
          <span>{user.name}</span>
          <button onClick={logout} className="btn">
            Logout
          </button>
        </div>
        </header>

        <main className="page">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
