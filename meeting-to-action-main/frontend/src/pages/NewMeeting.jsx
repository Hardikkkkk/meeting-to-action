import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { extractNotes, sampleTranscript } from '../api/mockApi.js';
import Avatar from '../components/Avatar.jsx';

const STATUSES = ['Todo', 'In Progress', 'Done'];

const EditList = ({ icon, tone, title, items, onChange, onDelete }) => (
  <div className={'card tint ' + tone}>
    <h3><span className={'ico ' + tone}>{icon}</span>{title}</h3>
    {items.map((x, i) => (
      <div className="li" key={i}>
        <input value={x} onChange={(e) => onChange(i, e.target.value)} />
        <button className="x" onClick={() => onDelete(i)} aria-label="Remove">×</button>
      </div>
    ))}
  </div>
);

function MiniBoard() {
  const { people, tasks, setStatus, personById } = useStore();
  const [who, setWho] = useState('all');
  const shown = tasks.filter((t) => who === 'all' || t.ownerId === Number(who));
  return (
    <section className="card">
      <div className="pagehead sm">
        <h2>Task Board</h2>
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Filter by person">
          <option value="all">All People</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="mini">
        {STATUSES.map((c) => {
          const list = shown.filter((t) => t.status === c);
          return (
            <div key={c} className={'mcol ' + c.replace(' ', '')} onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => setStatus(Number(e.dataTransfer.getData('id')), c)}>
              <h4>{c} ({list.length})</h4>
              {list.length === 0 && <p className="empty muted small">No tasks yet</p>}
              {list.map((t) => (
                <div className="task" key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData('id', t.id)}>
                  <b>{t.task}</b>
                  <div className="meta"><Avatar person={personById(t.ownerId)} size={20} /><span className="muted">{personById(t.ownerId)?.name.split(' ')[0] || 'Unassigned'}</span></div>
                  <div className="meta"><span className="muted">{t.due.slice(5)}</span><span className={'pill ' + t.priority}>{t.priority}</span></div>
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
  const { people, saveMeeting, personById } = useStore();
  const nav = useNavigate();
  const fileRef = useRef();
  const [title, setTitle] = useState('Product Planning Meeting');
  const [date, setDate] = useState('2026-10-22');
  const [duration, setDuration] = useState('45 minutes');
  const [text, setText] = useState(sampleTranscript);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);

  const readFile = (f) => {
    if (!f) return;
    setFile({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' });
    const r = new FileReader();
    r.onload = () => setText(String(r.result));
    r.readAsText(f);
  };
  const extract = async () => { setLoading(true); setRes(await extractNotes(text)); setLoading(false); };
  const set = (k, v) => setRes((r) => ({ ...r, [k]: v }));
  const setList = (k, i, v) => set(k, res[k].map((x, j) => (j === i ? v : x)));
  const delList = (k, i) => set(k, res[k].filter((_, j) => j !== i));
  const setAct = (i, k, v) => set('actions', res.actions.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const addAct = () => set('actions', [...res.actions, { task: '', ownerId: null, due: date, priority: 'Medium', status: 'Todo' }]);
  const save = () => {
    saveMeeting({ title, date, summary: res.summary, decisions: res.decisions, questions: res.questions }, res.actions.filter((a) => a.task.trim()));
    setRes(null);
  };

  return (
    <div className="dash">
      <div>
        <section className="card">
          <h2>1. Upload transcript</h2>
          <p className="muted">Upload a transcript file or paste the text. We support .txt, .vtt, .srt files or plain text.</p>
          <div className="upload3">
            <div className="drop" onClick={() => fileRef.current.click()} onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => { e.preventDefault(); readFile(e.dataTransfer.files[0]); }}>
              <div><b>Drag and drop a file here, or click to upload</b><br /><span className="small">Supports .txt, .vtt, .srt</span></div>
              <input ref={fileRef} type="file" accept=".txt,.vtt,.srt" hidden onChange={(e) => readFile(e.target.files[0])} />
            </div>
            <span className="or">OR</span>
            <div>
              <textarea value={text} maxLength={50000} onChange={(e) => setText(e.target.value)} aria-label="Transcript text" />
              <span className="muted small">{text.length}/50,000</span>
            </div>
          </div>
          <div className="bar">
            <span className="chips"><span className="fmt">.txt</span><span className="fmt">.vtt</span><span className="fmt">.srt</span></span>
            <button className="btn" disabled={loading || !text.trim()} onClick={extract}>{loading ? 'Extracting...' : 'Extract notes →'}</button>
          </div>
          <p className="muted small" style={{ marginTop: 12 }}>Demo mode: a sample AI result is shown. The real LLM connects in the next phase.</p>
        </section>

        <section className="card">
          <div className="pagehead sm">
            <div><h2>2. Review and edit extracted notes</h2><p className="muted" style={{ margin: 0 }}>Check the AI result and fix anything before saving.</p></div>
            <button className="btn" disabled={!res} onClick={save}>Save meeting</button>
          </div>
          {!res ? (
            <div className="placeholder">Extract notes to see the summary, decisions, open questions and action items here.</div>
          ) : (
            <>
              <div className="grid3">
                <div className="card tint blue"><h3><span className="ico blue">≡</span>Summary</h3><textarea value={res.summary} onChange={(e) => set('summary', e.target.value)} /></div>
                <EditList icon="✓" tone="green" title="Decisions" items={res.decisions} onChange={(i, v) => setList('decisions', i, v)} onDelete={(i) => delList('decisions', i)} />
                <EditList icon="?" tone="purple" title="Open questions" items={res.questions} onChange={(i, v) => setList('questions', i, v)} onDelete={(i) => delList('questions', i)} />
              </div>

              <div className="sub"><h3>Action items</h3><button className="btn ghost" onClick={addAct}>+ Add task</button></div>
              <div className="tablewrap">
                <table>
                  <thead><tr><th></th><th>Task</th><th>Owner</th><th>Due date</th><th>Priority</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {res.actions.map((a, i) => (
                      <tr key={i}>
                        <td><input type="checkbox" checked={a.status === 'Done'} onChange={(e) => setAct(i, 'status', e.target.checked ? 'Done' : 'Todo')} aria-label="Mark done" /></td>
                        <td><input value={a.task} placeholder="Describe the task" onChange={(e) => setAct(i, 'task', e.target.value)} /></td>
                        <td>
                          <div className="ownercell">
                            <Avatar person={personById(a.ownerId)} size={26} />
                            <select value={a.ownerId ?? ''} onChange={(e) => setAct(i, 'ownerId', e.target.value ? Number(e.target.value) : null)}>
                              <option value="">Unassigned</option>
                              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        </td>
                        <td><input type="date" value={a.due} onChange={(e) => setAct(i, 'due', e.target.value)} /></td>
                        <td>
                          <select className={'pillsel ' + a.priority} value={a.priority} onChange={(e) => setAct(i, 'priority', e.target.value)}>
                            {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={a.status} onChange={(e) => setAct(i, 'status', e.target.value)}>
                            {STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td><button className="x" onClick={() => delList('actions', i)} aria-label="Remove task">×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sub"><h3>People mapping</h3></div>
              <p className="muted small">Names from the transcript have been matched to real users in your database.</p>
              {res.mapped.map((m) => {
                const p = personById(m.ownerId);
                return <span className="chip" key={m.spoken}><Avatar person={p} size={30} /><span><b>{p?.name}</b><br /><span className="muted small">{p?.role}</span></span></span>;
              })}
            </>
          )}
        </section>
      </div>

      <aside>
        <section className="card">
          <h2>Meeting Details</h2>
          <dl className="details">
            <dt>Title</dt><dd><input value={title} onChange={(e) => setTitle(e.target.value)} /></dd>
            <dt>Date</dt><dd><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></dd>
            <dt>Duration</dt><dd><input value={duration} onChange={(e) => setDuration(e.target.value)} /></dd>
            <dt>Transcript file</dt>
            <dd>{file ? <div className="file"><b>{file.name}</b><span className="muted small">{file.size}</span></div> : <span className="muted">Pasted text</span>}</dd>
          </dl>
        </section>
        <MiniBoard />
        <section className="card">
          <h2>People</h2>
          {people.map((p) => (
            <div className="plist" key={p.id}>
              <Avatar person={p} size={40} />
              <span className="grow"><b>{p.name}</b><span className="muted small">{p.role}</span></span>
              <span className="online">Online</span>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}
