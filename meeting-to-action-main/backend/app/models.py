
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, UniqueConstraint

from app.extensions import db


# Returns the current UTC date and time
def current_time():
    return datetime.now(timezone.utc)


# --------------------------------
# 1. USER TABLE
# --------------------------------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="member", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=current_time)

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'member')"),
    )

    meetings = db.relationship(
        "Meeting",
        back_populates="owner",
        foreign_keys="Meeting.owner_id"
    )

    meeting_participations = db.relationship(
        "MeetingParticipant",
        back_populates="user"
    )


# --------------------------------
# 2. MEETING TABLE
# --------------------------------

class Meeting(db.Model):
    __tablename__ = "meetings"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )

    title = db.Column(db.String(200), nullable=False)
    scheduled_at = db.Column(db.DateTime(timezone=True))
    duration_minutes = db.Column(db.Integer)
    summary = db.Column(db.Text)
    transcript_text = db.Column(db.Text)

    status = db.Column(db.String(20), default="draft", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=current_time)

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'processing', 'ready', 'failed')"
        ),
    )

    owner = db.relationship(
        "User",
        back_populates="meetings",
        foreign_keys=[owner_id]
    )

    participants = db.relationship(
        "MeetingParticipant",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    decisions = db.relationship(
        "Decision",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    questions = db.relationship(
        "OpenQuestion",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    tasks = db.relationship(
        "Task",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    transcript_assets = db.relationship(
        "TranscriptAsset",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )

    extraction_jobs = db.relationship(
        "ExtractionJob",
        back_populates="meeting",
        cascade="all, delete-orphan"
    )


# --------------------------------
# 3. MEETING PARTICIPANTS TABLE
# --------------------------------

class MeetingParticipant(db.Model):
    __tablename__ = "meeting_participants"

    id = db.Column(db.Integer, primary_key=True)

    meeting_id = db.Column(
        db.Integer,
        db.ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE")
    )

    speaker_name = db.Column(db.String(100))
    joined_at = db.Column(db.DateTime(timezone=True), default=current_time)

    __table_args__ = (
        UniqueConstraint("meeting_id", "user_id"),
    )

    meeting = db.relationship(
        "Meeting",
        back_populates="participants"
    )

    user = db.relationship(
        "User",
        back_populates="meeting_participations"
    )


# --------------------------------
# 4. DECISIONS TABLE
# --------------------------------

class Decision(db.Model):
    __tablename__ = "decisions"

    id = db.Column(db.Integer, primary_key=True)

    meeting_id = db.Column(
        db.Integer,
        db.ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=current_time)

    meeting = db.relationship(
        "Meeting",
        back_populates="decisions"
    )


# --------------------------------
# 5. OPEN QUESTIONS TABLE
# --------------------------------

class OpenQuestion(db.Model):
    __tablename__ = "open_questions"

    id = db.Column(db.Integer, primary_key=True)

    meeting_id = db.Column(
        db.Integer,
        db.ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="open", nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('open', 'resolved')"),
    )

    meeting = db.relationship(
        "Meeting",
        back_populates="questions"
    )


# --------------------------------
# 6. TASKS TABLE
# --------------------------------

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)

    meeting_id = db.Column(
        db.Integer,
        db.ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)

    assigned_to_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL")
    )

    created_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )

    due_date = db.Column(db.DateTime(timezone=True))
    priority = db.Column(db.String(20), default="medium")
    status = db.Column(db.String(20), default="todo", nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=current_time)
    completed_at = db.Column(db.DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint("priority IN ('low', 'medium', 'high')"),
        CheckConstraint("status IN ('todo', 'in_progress', 'done')"),
    )

    meeting = db.relationship(
        "Meeting",
        back_populates="tasks"
    )

    assignee = db.relationship(
        "User",
        foreign_keys=[assigned_to_id]
    )

    creator = db.relationship(
        "User",
        foreign_keys=[created_by_id]
    )


# --------------------------------
# 7. TRANSCRIPT ASSETS TABLE
# --------------------------------

class TranscriptAsset(db.Model):
    __tablename__ = "transcript_assets"

    id = db.Column(db.Integer, primary_key=True)

    meeting_id = db.Column(
        db.Integer,
        db.ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    uploaded_by_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )

    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.String(20), nullable=False)
    mime_type = db.Column(db.String(100))
    size_bytes = db.Column(db.Integer, nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), default=current_time)

    __table_args__ = (
        CheckConstraint("asset_type IN ('transcript', 'audio')"),
        CheckConstraint("size_bytes >= 0"),
    )

    meeting = db.relationship(
        "Meeting",
        back_populates="transcript_assets"
    )


# --------------------------------
# 8. EXTRACTION JOBS TABLE
# --------------------------------

class ExtractionJob(db.Model):
    __tablename__ = "extraction_jobs"

    id = db.Column(db.Integer, primary_key=True)

    meeting_id = db.Column(
        db.Integer,
        db.ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False
    )

    status = db.Column(db.String(20), default="pending", nullable=False)
    provider = db.Column(db.String(100))
    model_name = db.Column(db.String(100))
    error_message = db.Column(db.Text)

    created_at = db.Column(db.DateTime(timezone=True), default=current_time)
    started_at = db.Column(db.DateTime(timezone=True))
    completed_at = db.Column(db.DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed')"
        ),
    )

    meeting = db.relationship(
        "Meeting",
        back_populates="extraction_jobs"
    )
