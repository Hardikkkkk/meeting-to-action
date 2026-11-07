import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { extractNotes, sampleTranscript } from '../api/mockApi.js';
import Avatar from '../components/Avatar.jsx';

const STATUSES = ['Todo', 'In Progress', 'Done'];

const EditList = ({
  icon,
  tone,
  title,
  items,
  onChange,
  onDelete,
}) => (
  <div className={'card tint ' + tone}>
    <h3>
      <span className={'ico ' + tone}>{icon}</span>
      {title}
    </h3>

    {items.map((item, index) => (
      <div className="li" key={index}>
        <input
          value={item}
          onChange={(e) => onChange(index, e.target.value)}
        />

        <button
          className="x"
          onClick={() => onDelete(index)}
          aria-label="Remove"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

function MiniBoard() {
  const { people, tasks, setStatus, personById } = useStore();

  const [who, setWho] = useState('all');

  const shown = tasks.filter(
    (task) =>
      who === 'all' ||
      Number(task.ownerId) === Number(who)
  );

  return (
    <section className="card">
      <div className="pagehead sm">
        <h2>Task Board</h2>

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

      <div className="mini">
        {STATUSES.map((column) => {
          const list = shown.filter(
            (task) => task.status === column
          );

          return (
            <div
              key={column}
              className={'mcol ' + column.replace(' ', '')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) =>
                setStatus(
                  Number(e.dataTransfer.getData('id')),
                  column
                )
              }
            >
              <h4>
                {column} ({list.length})
              </h4>

              {list.length === 0 && (
                <p className="empty muted small">
                  No tasks yet
                </p>
              )}

              {list.map((task) => (
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
                    <Avatar
                      person={personById(task.ownerId)}
                      size={20}
                    />

                    <span className="muted">
                      {personById(task.ownerId)?.name.split(' ')[0] ||
                        'Unassigned'}
                    </span>
                  </div>

                  <div className="meta">
                    <span className="muted">
                      {task.due}
                    </span>

                    <span className={'pill ' + task.priority}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function NewMeeting() {
  const {
    people,
    saveMeeting,
    personById,
    error,
  } = useStore();

  const nav = useNavigate();
  const fileRef = useRef();

  const [title, setTitle] = useState('Product Planning Meeting');
  const [date, setDate] = useState('2026-10-22');
  const [duration, setDuration] = useState('45 minutes');

  const [text, setText] = useState(sampleTranscript);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [res, setRes] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');

  const readFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile({
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(1) + ' KB',
    });

    const reader = new FileReader();

    reader.onload = () => {
      setText(String(reader.result));
    };

    reader.readAsText(selectedFile);
  };

  const extract = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setSavedMessage('');

    try {
      const result = await extractNotes(text);
      setRes(result);
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const set = (key, value) => {
    setRes((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setList = (key, index, value) => {
    set(
      key,
      res[key].map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  };

  const delList = (key, index) => {
    set(
      key,
      res[key].filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const setAct = (index, key, value) => {
    set(
      'actions',
      res.actions.map((action, actionIndex) =>
        actionIndex === index
          ? { ...action, [key]: value }
          : action
      )
    );
  };

  const addAct = () => {
    set('actions', [
      ...res.actions,
      {
        task: '',
        ownerId: null,
        due: date,
        priority: 'Medium',
        status: 'Todo',
      },
    ]);
  };

  const save = async () => {
    if (!res || saving) return;

    if (!title.trim() || !date) {
      return;
    }

    setSaving(true);
    setSavedMessage('');

    try {
      const success = await saveMeeting(
        {
          title: title.trim(),
          date,
          duration,
          summary: res.summary,
          decisions: res.decisions,
          questions: res.questions,
        },
        res.actions.filter(
          (action) => action.task && action.task.trim()
        )
      );

      if (success) {
        setRes(null);
        setSavedMessage(
          'Meeting saved successfully. You can view it in Meetings.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash">
      <div>
        <section className="card">
          <h2>1. Upload transcript</h2>

          <p className="muted">
            Upload a transcript file or paste the text. We support
            .txt, .vtt, .srt files or plain text.
          </p>

          <div className="upload3">
            <div
              className="drop"
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                readFile(e.dataTransfer.files[0]);
              }}
            >
              <div>
                <b>
                  Drag and drop a file here, or click to upload
                </b>
                <br />
                <span className="small">
                  Supports .txt, .vtt, .srt
                </span>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".txt,.vtt,.srt"
                hidden
                onChange={(e) => readFile(e.target.files[0])}
              />
            </div>

            <span className="or">OR</span>

            <div>
              <textarea
                value={text}
                maxLength={50000}
                onChange={(e) => setText(e.target.value)}
                aria-label="Transcript text"
              />

              <span className="muted small">
                {text.length}/50,000
              </span>
            </div>
          </div>

          <div className="bar">
            <span className="chips">
              <span className="fmt">.txt</span>
              <span className="fmt">.vtt</span>
              <span className="fmt">.srt</span>
            </span>

            <button
              className="btn"
              disabled={loading || !text.trim()}
              onClick={extract}
            >
              {loading ? 'Extracting...' : 'Extract notes →'}
            </button>
          </div>

          <p
            className="muted small"
            style={{ marginTop: 12 }}
          >
            Demo mode: a sample AI result is shown. The real AI
            extraction will be connected in the next phase.
          </p>
        </section>

        <section className="card">
          <div className="pagehead sm">
            <div>
              <h2>2. Review and edit extracted notes</h2>

              <p
                className="muted"
                style={{ margin: 0 }}
              >
                Check the AI result and fix anything before saving.
              </p>
            </div>

            <button
              className="btn"
              disabled={!res || saving}
              onClick={save}
            >
              {saving ? 'Saving...' : 'Save meeting'}
            </button>
          </div>

          {error && (
            <div className="card">
              <p>{error}</p>
            </div>
          )}

          {savedMessage && (
            <div className="card">
              <p>{savedMessage}</p>
              <button
                className="btn"
                onClick={() => nav('/meetings')}
              >
                View meetings
              </button>
            </div>
          )}

          {!res ? (
            <div className="placeholder">
              Extract notes to see the summary, decisions,
              open questions and action items here.
            </div>
          ) : (
            <>
              <div className="grid3">
                <div className="card tint blue">
                  <h3>
                    <span className="ico blue">≡</span>
                    Summary
                  </h3>

                  <textarea
                    value={res.summary}
                    onChange={(e) =>
                      set('summary', e.target.value)
                    }
                  />
                </div>

                <EditList
                  icon="✓"
                  tone="green"
                  title="Decisions"
                  items={res.decisions}
                  onChange={(i, v) =>
                    setList('decisions', i, v)
                  }
                  onDelete={(i) =>
                    delList('decisions', i)
                  }
                />

                <EditList
                  icon="?"
                  tone="purple"
                  title="Open questions"
                  items={res.questions}
                  onChange={(i, v) =>
                    setList('questions', i, v)
                  }
                  onDelete={(i) =>
                    delList('questions', i)
                  }
                />
              </div>

              <div className="sub">
                <h3>Action items</h3>

                <button
                  className="btn ghost"
                  onClick={addAct}
                >
                  + Add task
                </button>
              </div>

              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Task</th>
                      <th>Owner</th>
                      <th>Due date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {res.actions.map((action, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="checkbox"
                            checked={action.status === 'Done'}
                            onChange={(e) =>
                              setAct(
                                index,
                                'status',
                                e.target.checked ? 'Done' : 'Todo'
                              )
                            }
                            aria-label="Mark done"
                          />
                        </td>

                        <td>
                          <input
                            value={action.task}
                            placeholder="Describe the task"
                            onChange={(e) =>
                              setAct(index, 'task', e.target.value)
                            }
                          />
                        </td>

                        <td>
                          <div className="ownercell">
                            <Avatar
                              person={personById(action.ownerId)}
                              size={26}
                            />

                            <select
                              value={action.ownerId ?? ''}
                              onChange={(e) =>
                                setAct(
                                  index,
                                  'ownerId',
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null
                                )
                              }
                            >
                              <option value="">Unassigned</option>

                              {people.map((person) => (
                                <option
                                  key={person.id}
                                  value={person.id}
                                >
                                  {person.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td>
                          <input
                            type="date"
                            value={action.due}
                            onChange={(e) =>
                              setAct(index, 'due', e.target.value)
                            }
                          />
                        </td>

                        <td>
                          <select
                            className={'pillsel ' + action.priority}
                            value={action.priority}
                            onChange={(e) =>
                              setAct(
                                index,
                                'priority',
                                e.target.value
                              )
                            }
                          >
                            {['High', 'Medium', 'Low'].map((priority) => (
                              <option key={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <select
                            value={action.status}
                            onChange={(e) =>
                              setAct(
                                index,
                                'status',
                                e.target.value
                              )
                            }
                          >
                            {STATUSES.map((status) => (
                              <option key={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <button
                            className="x"
                            onClick={() =>
                              delList('actions', index)
                            }
                            aria-label="Remove task"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sub">
                <h3>People mapping</h3>
              </div>

              <p className="muted small">
                People matched to available users in your database.
              </p>

              {(res.mapped || []).map((personMapping) => {
                const person = personById(personMapping.ownerId);

                return (
                  <span className="chip" key={personMapping.spoken}>
                    <Avatar person={person} size={30} />

                    <span>
                      <b>
                        {person?.name || personMapping.spoken}
                      </b>
                      <br />

                      <span className="muted small">
                        {person?.role || 'Not linked to an account'}
                      </span>
                    </span>
                  </span>
                );
              })}
            </>
          )}
        </section>
      </div>

      <aside>
        <section className="card">
          <h2>Meeting Details</h2>

          <dl className="details">
            <dt>Title</dt>
            <dd>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </dd>

            <dt>Date</dt>
            <dd>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </dd>

            <dt>Duration</dt>
            <dd>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </dd>

            <dt>Transcript file</dt>
            <dd>
              {file ? (
                <div className="file">
                  <b>{file.name}</b>
                  <span className="muted small">
                    {file.size}
                  </span>
                </div>
              ) : (
                <span className="muted">Pasted text</span>
              )}
            </dd>
          </dl>
        </section>

        <MiniBoard />

        <section className="card">
          <h2>People</h2>

          {people.map((person) => (
            <div className="plist" key={person.id}>
              <Avatar person={person} size={40} />

              <span className="grow">
                <b>{person.name}</b>
                <span className="muted small">
                  {person.role}
                </span>
              </span>

              <span className="online">Online</span>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}