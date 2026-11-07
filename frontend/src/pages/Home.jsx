import { Link } from 'react-router-dom';
import { useStore } from '../store.jsx';

export default function Home() {
  const { meetings, tasks, loading, error } = useStore();

  const open = tasks.filter(
    (task) => task.status !== 'Done'
  ).length;

  const completed = tasks.filter(
    (task) => task.status === 'Done'
  ).length;

  const stats = [
    ['Meetings', meetings.length],
    ['Open tasks', open],
    ['Completed', completed],
  ];

  if (loading) {
    return <div className="card">Loading your dashboard...</div>;
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Welcome back</h1>
          <p className="muted">
            Here is what is happening across your meetings.
          </p>
        </div>

        <Link className="btn" to="/new">
          New meeting
        </Link>
      </div>

      {error && (
        <div className="card">
          <p>{error}</p>
        </div>
      )}

      <div className="grid3">
        {stats.map(([label, value]) => (
          <div className="card stat" key={label}>
            <b>{value}</b>
            <span className="muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Recent meetings</h2>

        {meetings.length === 0 ? (
          <p className="muted">
            No meetings yet. Create your first meeting to get started.
          </p>
        ) : (
          meetings.slice(0, 4).map((meeting) => (
            <div className="row" key={meeting.id}>
              <span>{meeting.title}</span>
              <span className="muted">{meeting.date}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}