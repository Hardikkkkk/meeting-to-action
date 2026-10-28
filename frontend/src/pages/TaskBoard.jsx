import { useState } from 'react';
import { useStore } from '../store.jsx';
import Avatar from '../components/Avatar.jsx';

const cols = ['Todo', 'In Progress', 'Done'];

export default function TaskBoard() {
  const { people, tasks, setStatus, personById } = useStore();
  const [who, setWho] = useState('all');
  const shown = tasks.filter((t) => who === 'all' || t.ownerId === Number(who));

  return (
    <>
      <div className="pagehead">
        <h1>Task Board</h1>
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Filter by person">
          <option value="all">All People</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="board">
        {cols.map((c) => {
          const list = shown.filter((t) => t.status === c);
          return (
            <div key={c} className={'col ' + c.replace(' ', '')} onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => setStatus(Number(e.dataTransfer.getData('id')), c)}>
              <h3>{c} ({list.length})</h3>
              {list.length === 0 && <p className="empty muted">Drop a task here</p>}
              {list.map((t) => (
                <div className="task" key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData('id', t.id)}>
                  <b>{t.task}</b>
                  <div className="meta">
                    <Avatar person={personById(t.ownerId)} size={24} />
                    <span>{personById(t.ownerId)?.name || 'Unassigned'}</span>
                    <span className="muted">{t.due}</span>
                  </div>
                  <div className="meta">
                    <span className={'pill ' + t.priority}>{t.priority}</span>
                    <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} aria-label="Change status">
                      {cols.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
