# Meeting to Action - Frontend (Phase II)

Run: `npm install` then `npm run dev` (opens at http://localhost:5173).

Structure
- src/api/mockApi.js   all dummy data + extractNotes(); replace with Flask calls later
- src/store.jsx        shared state (meetings, tasks) used by every page
- src/pages/           Home, NewMeeting (upload + review), Meetings, TaskBoard, People
- src/components/      Sidebar, Avatar

Connecting the backend later: change only mockApi.js and store.jsx (swap the dummy data for fetch() calls). The pages stay the same.
