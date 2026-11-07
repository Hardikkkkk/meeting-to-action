import { useStore } from '../store.jsx';
import Avatar from '../components/Avatar.jsx';

export default function People() {
  const {
    people,
    tasks,
    loading,
    error,
  } = useStore();

  if (loading) {
    return <div className="card">Loading people...</div>;
  }

  return (
    <>
      <div className="pagehead">
        <h1>People</h1>
      </div>

      {error && (
        <div className="card">
          <p>{error}</p>
        </div>
      )}

      <p className="muted">
        Showing your account and the tasks assigned to it.
      </p>

      <div className="grid3">
        {people.map((person) => {
          const mine = tasks.filter(
            (task) =>
              Number(task.ownerId) === Number(person.id)
          );

          const done = mine.filter(
            (task) => task.status === 'Done'
          ).length;

          return (
            <div className="card person" key={person.id}>
              <Avatar person={person} size={56} />

              <b>{person.name}</b>

              <span className="muted">
                {person.role || person.email}
              </span>

              <span>
                {mine.length - done} open · {done} done
              </span>
            </div>
          );
        })}
      </div>

      {people.length === 0 && (
        <div className="card">
          <p className="muted">
            No account information is available.
          </p>
        </div>
      )}
    </>
  );
}