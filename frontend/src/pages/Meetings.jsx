import { useStore } from '../store.jsx';

export default function Meetings() {
  const { meetings, tasks, loading, error } = useStore();

  if (loading) {
    return <div className="card">Loading meetings...</div>;
  }

  return (
    <>
      <div className="pagehead">
        <h1>Meetings</h1>
      </div>

      {error && (
        <div className="card">
          <p>{error}</p>
        </div>
      )}

      {meetings.length === 0 && (
        <div className="card">
          <p className="muted">
            No meetings found. Create a meeting to see it here.
          </p>
        </div>
      )}

      {meetings.map((meeting) => {
        const meetingTasks = tasks.filter(
          (task) => Number(task.meetingId) === Number(meeting.id)
        );

        return (
          <details className="card" key={meeting.id}>
            <summary>
              <b>{meeting.title}</b>
              <span className="muted">
                {meeting.date} · {meeting.decisions.length} decisions ·{' '}
                {meetingTasks.length} tasks
              </span>
            </summary>

            <p>{meeting.summary || 'No summary available.'}</p>

            <h3>Decisions</h3>

            {meeting.decisions.length > 0 ? (
              <ul>
                {meeting.decisions.map((decision, index) => (
                  <li key={index}>{decision}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No decisions recorded.</p>
            )}

            <h3>Open questions</h3>

            {meeting.questions.length > 0 ? (
              <ul>
                {meeting.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">No open questions recorded.</p>
            )}

            <h3>Tasks</h3>

            {meetingTasks.length > 0 ? (
              <ul>
                {meetingTasks.map((task) => (
                  <li key={task.id}>
                    {task.task} — {task.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No tasks recorded.</p>
            )}
          </details>
        );
      })}
    </>
  );
}