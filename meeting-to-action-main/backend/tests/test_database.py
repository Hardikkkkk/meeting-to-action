import pytest
from sqlalchemy import inspect

from app import create_app
from app.extensions import db
from app.models import User, Meeting, Task


@pytest.fixture
def app(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite://")

    app = create_app()

    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite://"
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


def test_database_tables(app):
    with app.app_context():
        tables = inspect(db.engine).get_table_names()

        assert "users" in tables
        assert "meetings" in tables
        assert "tasks" in tables
        assert "decisions" in tables


def test_user_meeting_task_relationship(app):
    with app.app_context():

        user = User(
            name="Test User",
            email="test@example.com",
            password_hash="test_hash"
        )

        db.session.add(user)
        db.session.flush()

        meeting = Meeting(
            owner_id=user.id,
            title="Test Meeting"
        )

        db.session.add(meeting)
        db.session.flush()

        task = Task(
            meeting_id=meeting.id,
            title="Prepare project report",
            created_by_id=user.id,
            assigned_to_id=user.id
        )

        db.session.add(task)
        db.session.commit()

        assert user.meetings[0].title == "Test Meeting"
        assert meeting.tasks[0].title == "Prepare project report"
        assert meeting.tasks[0].assignee.email == "test@example.com"