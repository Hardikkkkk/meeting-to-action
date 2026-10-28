import { Link } from 'react-router-dom';
import { useStore } from '../store.jsx';

export default function Home() {
  const { meetings, tasks } = useStore();
  const open = tasks.filter((t) => t.status !== 'Done').length;
  const stats = [['Meetings', meetings.length], ['Open tasks', open], ['Completed', tasks.length - open]];
  return (
    <>
      <div className="pagehead">
        <div><h1>Welcome back, Hardik</h1><p className="muted">Here is what is happening across your meetings.</p></div>
        <Link className="btn" to="/new">New meeting</Link>
      </div>
      <div className="grid3">
        {stats.map(([label, value]) => (
          <div className="card stat" key={label}><b>{value}</b><span className="muted">{label}</span></div>
        ))}
      </div>
      <div className="card">
        <h2>Recent meetings</h2>
        {meetings.slice(0, 4).map((m) => (
          <div className="row" key={m.id}><span>{m.title}</span><span className="muted">{m.date}</span></div>
        ))}
      </div>
    </>
  );
}
