# Meeting to Action

**Turn meeting conversations into clear summaries, decisions, and actionable tasks.**

Meeting to Action is a web-based meeting management application designed to help teams organize meeting information and convert conversations into structured outcomes. The project aims to reduce manual note-taking and make it easier to track responsibilities and follow-ups.

## Project Overview

Meetings often involve multiple discussions, decisions, questions, and assigned responsibilities. Important details can get lost when meeting notes are unstructured or follow-ups are not tracked properly.

Meeting to Action aims to address this problem through a centralized platform where users can manage meeting information, review important outcomes, and track tasks.

## Features

### Implemented

- **User Registration:** Create an account using name, email, and password.
- **User Login:** Authenticate users through a Flask backend.
- **Password Security:** Passwords are stored as hashes rather than plain text.
- **JWT Authentication:** Token-based authentication for protected profile access.
- **Protected Dashboard:** Restricts dashboard access to authenticated users.
- **Session Persistence:** Restores the login session after a page refresh.
- **Logout:** Allows users to end their current session.
- **Dashboard UI:** Existing dashboard interface for meetings, people, and tasks.

### Under Development

- Meeting creation and management through backend APIs.
- Persistent storage and retrieval of meetings.
- AI-powered meeting summaries.
- Automatic decision and open-question extraction.
- Action-item generation and assignment.
- Audio and transcript processing.
- Task tracking and progress management.
- Multi-user meeting collaboration and access control.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Routing | React Router |
| Backend | Python, Flask |
| Database | SQLite |
| ORM | Flask-SQLAlchemy |
| Database Migrations | Flask-Migrate |
| Authentication | Flask-JWT-Extended |
| Password Security | Werkzeug Password Hashing |
| Frontend-Backend Communication | Fetch API, Flask-CORS |

## Project Architecture

The application follows a frontend-backend architecture.

- **Frontend:** Handles the user interface, navigation, forms, and dashboard.
- **Backend:** Provides REST API endpoints, authentication, and application logic.
- **Database:** Stores user information and structured meeting-related data.

## Project Structure

```text
meeting-to-action/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   └── auth.py
│   │   ├── models.py
│   │   ├── extensions.py
│   │   ├── config.py
│   │   └── __init__.py
│   │
│   ├── migrations/
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   └── mockApi.js
│   │   ├── auth/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── store.jsx
│   │   └── styles.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following:

- Python
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Hardikkkkk/meeting-to-action.git
cd meeting-to-action
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

Run database migrations:

```bash
flask --app run.py db upgrade
```

Start the Flask server:

```bash
python run.py
```

The backend will run at:

`http://127.0.0.1:5000`

Backend health-check endpoint:

`http://127.0.0.1:5000/api/health`

### 3. Set Up the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will usually be available at:

`http://localhost:5173`

## Authentication API Endpoints

The backend currently provides the following authentication endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate an existing user |
| GET | `/api/auth/profile` | Retrieve the authenticated user's profile |
| GET | `/api/health` | Check backend availability |

The profile endpoint requires a valid JWT access token in the Authorization header:

```text
Authorization: Bearer <access_token>
```

## Database Models

The backend database schema includes models for:

- Users
- Meetings
- Meeting Participants
- Decisions
- Open Questions
- Tasks
- Transcript Assets
- Extraction Jobs

These models provide the foundation for the planned meeting management and AI-processing functionality.

## Future Enhancements

- Integration with an external AI API for meeting analysis.
- Audio-to-text transcription.
- Automatic identification of speakers and responsibilities.
- Intelligent action-item extraction.
- Meeting history and search.
- Task assignment, deadlines, and status tracking.
- Multi-user collaboration with role-based access control.
- Improved dashboard analytics and reporting.

## Project Status

**Currently under active development.**

The authentication foundation and initial frontend/backend integration are implemented. Meeting management, persistent task workflows, and AI-powered extraction are planned development milestones.

## Author

**Hardik**

MCA Student | Full Stack Development

GitHub: [@Hardikkkkk](https://github.com/Hardikkkkk)

---

*Meeting to Action — Making every meeting more actionable.*
