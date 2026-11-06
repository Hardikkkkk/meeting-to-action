import { createContext, useContext, useState } from 'react';
import { people, seedMeetings, seedTasks } from './api/mockApi.js';

const Ctx = createContext();
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [meetings, setMeetings] = useState(seedMeetings);
  const [tasks, setTasks] = useState(seedTasks);

  const saveMeeting = (meeting, newTasks) => {
    const id = Date.now();
    setMeetings((m) => [{ ...meeting, id }, ...m]);
    setTasks((t) => [...newTasks.map((x, i) => ({ ...x, id: id + i, meetingId: id })), ...t]);
  };
  const setStatus = (id, status) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, status } : x)));
  const personById = (id) => people.find((p) => p.id === Number(id));

  return <Ctx.Provider value={{ people, meetings, tasks, saveMeeting, setStatus, personById }}>{children}</Ctx.Provider>;
}
