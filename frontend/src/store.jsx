import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from './auth/AuthContext.jsx';

import {
  getMeetings,
  getMeeting,
  createMeeting,
} from './api/meetingsApi.js';

import { createDecision } from './api/decisionsApi.js';
import { createQuestion } from './api/questionsApi.js';

import {
  createTask,
  updateTask,
} from './api/tasksApi.js';

const Ctx = createContext(null);

export const useStore = () => useContext(Ctx);

const toDisplayStatus = (status) => {
  const statuses = {
    todo: 'Todo',
    in_progress: 'In Progress',
    done: 'Done',
  };

  return statuses[status] || status || 'Todo';
};

const toApiStatus = (status) => {
  const statuses = {
    Todo: 'todo',
    'In Progress': 'in_progress',
    Done: 'done',
  };

  return statuses[status] || status;
};

const toDisplayPriority = (priority) => {
  if (!priority) return 'Medium';

  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const toApiDateTime = (date) => {
  if (!date) return null;

  return date.length === 10
    ? `${date}T23:59:00`
    : date;
};

const formatDate = (date) => {
  if (!date) return '—';

  return String(date).slice(0, 10);
};

const normalizeTask = (task) => ({
  ...task,
  task: task.title,
  ownerId: task.assigned_to_id ?? null,
  due: formatDate(task.due_date),
  status: toDisplayStatus(task.status),
  priority: toDisplayPriority(task.priority),
  meetingId: task.meeting_id,
});

const normalizeMeeting = (meeting, details = {}) => {
  const data = details.meeting || meeting;

  return {
    ...data,
    id: data.id,
    title: data.title,
    date: formatDate(data.scheduled_at),
    summary: data.summary || '',

    decisions: (details.decisions || data.decisions || []).map(
      (item) => typeof item === 'string' ? item : item.content
    ),

    questions: (details.questions || data.questions || []).map(
      (item) => typeof item === 'string' ? item : item.content
    ),

    tasks: (details.tasks || data.tasks || []).map(normalizeTask),
  };
};

export function StoreProvider({ children }) {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Currently, the backend frontend integration exposes
  // the logged-in user as the available person.
  const people = user ? [user] : [];

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getMeetings();
      const meetingList = response.meetings || [];

      const details = await Promise.all(
        meetingList.map((meeting) => getMeeting(meeting.id))
      );

      const normalizedMeetings = details.map((detail, index) =>
        normalizeMeeting(meetingList[index], detail)
      );

      const allTasks = normalizedMeetings.flatMap(
        (meeting) => meeting.tasks
      );

      setMeetings(normalizedMeetings);
      setTasks(allTasks);

      return true;
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.');

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setMeetings([]);
      setTasks([]);
      setLoading(false);
      setError('');
    }
  }, [user, refreshData]);

  const personById = (id) => {
    if (!id || !user) return undefined;

    return Number(id) === Number(user.id)
      ? user
      : undefined;
  };

  const setStatus = async (id, status) => {
    const apiStatus = toApiStatus(status);

    try {
      await updateTask(id, {
        status: apiStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          Number(task.id) === Number(id)
            ? {
                ...task,
                status: toDisplayStatus(apiStatus),
              }
            : task
        )
      );
    } catch (err) {
      setError(err.message || 'Could not update task status.');

      await refreshData();
    }
  };

  const saveMeeting = async (meeting, newTasks = []) => {
    setError('');

    let meetingCreated = false;

    try {
      // 1. Create the meeting.
      const meetingResponse = await createMeeting({
        title: meeting.title,
        scheduled_at: `${meeting.date}T00:00:00`,
        duration_minutes:
          Number.parseInt(meeting.duration, 10) || 30,
        summary: meeting.summary || '',
      });

      const meetingId = meetingResponse.meeting.id;

      meetingCreated = true;

      // 2. Save decisions and questions.
      const validDecisions = (meeting.decisions || [])
        .filter((item) => item.trim());

      const validQuestions = (meeting.questions || [])
        .filter((item) => item.trim());

      await Promise.all([
        ...validDecisions.map((content) =>
          createDecision(meetingId, content)
        ),

        ...validQuestions.map((content) =>
          createQuestion(meetingId, content)
        ),
      ]);

      // 3. Save action items.
      const validTasks = newTasks.filter(
        (item) => item.task && item.task.trim()
      );

      for (const item of validTasks) {
        const assignedToId =
          item.ownerId &&
          Number(item.ownerId) === Number(user?.id)
            ? Number(item.ownerId)
            : null;

        await createTask(meetingId, {
          title: item.task.trim(),
          description: '',
          assigned_to_id: assignedToId,
          due_date: toApiDateTime(item.due),
          priority: String(item.priority || 'Medium').toLowerCase(),
          status: toApiStatus(item.status || 'Todo'),
        });
      }

      // 4. Reload actual backend data.
      const refreshed = await refreshData();

      if (!refreshed) {
        setError(
          'Meeting saved successfully, but the dashboard could not refresh. Please reload the page.'
        );
      }

      return true;
    } catch (err) {
      if (meetingCreated) {
        setError(
          `The meeting was created, but some of its details could not be saved. ${err.message} Refresh the page before retrying to avoid duplicate records.`
        );

        await refreshData();
      } else {
        setError(err.message || 'Could not save the meeting.');
      }

      return false;
    }
  };

  return (
    <Ctx.Provider
      value={{
        people,
        meetings,
        tasks,
        loading,
        error,
        refreshData,
        saveMeeting,
        setStatus,
        personById,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}