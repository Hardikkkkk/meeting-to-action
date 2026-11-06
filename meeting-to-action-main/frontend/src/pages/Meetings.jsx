import { useStore } from '../store.jsx';

export default function Meetings() {
  const { meetings, tasks } = useStore();
  return (
    <>
      <div className="pagehead"><h1>Meetings</h1></div>
      {meetings.map((m) => {
        const count = tasks.filter((t) => t.meetingId === m.id).length;
        return (
          <details className="card" key={m.id}>
            <summary><b>{m.title}</b><span className="muted">{m.date} · {m.decisions.length} decisions · {count} tasks</span></summary>
            <p>{m.summary}</p>
            <h3>Decisions</h3>
            <ul>{m.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </details>
        );
      })}
    </>
  );
}
