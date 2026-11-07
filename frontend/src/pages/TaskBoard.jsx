import { useState } from 'react';
import { useStore } from '../store.jsx';
import Avatar from '../components/Avatar.jsx';

const cols = ['Todo', 'In Progress', 'Done'];

export default function TaskBoard() {
  const {
    people,
    tasks,
    setStatus,
    personById,
    loading,
    error,
  } = useStore();

  const [who, setWho] = useState('all');

  const shown = tasks.filter(
    (task) =>
      who === 'all' ||
      Number(task.ownerId) === Number(who)
  );

  if (loading) {
    return <div className="card">Loading tasks...</div>;
  }

  return (
    <>
      <div className="pagehead">
        <h1>Task Board</h1>

        <select
          value={who}
          onChange={(e) => setWho(e.target.value)}
          aria-label="Filter by person"
        >
          <option value="all">All People</option>

          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="card">
          <p>{error}</p>
        </div>
      )}

      <div className="board">
        {cols.map((column) => {
          const list = shown.filter(
            (task) => task.status === column
          );

          return (
            <div
              key={column}
              className={'col ' + column.replace(' ', '')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) =>
                setStatus(
                  Number(e.dataTransfer.getData('id')),
                  column
                )
              }
            >
              <h3>
                {column} ({list.length})
              </h3>

              {list.length === 0 && (
                <p className="empty muted">Drop a task here</p>
              )}

              {list.map((task) => {
                const person = personById(task.ownerId);

                return (
                  <div
                    className="task"
                    key={task.id}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData('id', task.id)
                    }
                  >
                    <b>{task.task}</b>

                    <div className="meta">
                      <Avatar person={person} size={24} />
                      <span>
                        {person?.name || 'Unassigned'}
                      </span>
                      <span className="muted">{task.due}</span>
                    </div>

                    <div className="meta">
                      <span
                        className={
                          'pill ' + task.priority.toLowerCase()
                        }
                      >
                        {task.priority}
                      </span>

                      <select
                        value={task.status}
                        onChange={(e) =>
                          setStatus(task.id, e.target.value)
                        }
                        aria-label="Change status"
                      >
                        {cols.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}