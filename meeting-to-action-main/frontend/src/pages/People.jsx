import { useStore } from '../store.jsx';
import Avatar from '../components/Avatar.jsx';

export default function People() {
  const { people, tasks } = useStore();
  return (
    <>
      <div className="pagehead"><h1>People</h1></div>
      <div className="grid3">
        {people.map((p) => {
          const mine = tasks.filter((t) => t.ownerId === p.id);
          const done = mine.filter((t) => t.status === 'Done').length;
          return (
            <div className="card person" key={p.id}>
              <Avatar person={p} size={56} />
              <b>{p.name}</b>
              <span className="muted">{p.role}</span>
              <span>{mine.length - done} open · {done} done</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
