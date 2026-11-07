
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Meeting


meetings_bp = Blueprint(
    "meetings",
    __name__,
    url_prefix="/api/meetings"
)


# Convert ISO date strings into datetime objects
def parse_datetime(value):

    if not value:
        return None

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
    except (ValueError, AttributeError):
        raise ValueError("Invalid date format")


# Serialize a meeting
def serialize_meeting(meeting):

    return {
        "id": meeting.id,
        "owner_id": meeting.owner_id,
        "title": meeting.title,
        "scheduled_at": (
            meeting.scheduled_at.isoformat()
            if meeting.scheduled_at else None
        ),
        "duration_minutes": meeting.duration_minutes,
        "summary": meeting.summary,
        "transcript_text": meeting.transcript_text,
        "status": meeting.status,
        "created_at": (
            meeting.created_at.isoformat()
            if meeting.created_at else None
        )
    }


# GET ALL MEETINGS
@meetings_bp.route("", methods=["GET"])
@jwt_required()
def get_meetings():

    user_id = int(get_jwt_identity())

    meetings = Meeting.query.filter_by(
        owner_id=user_id
    ).order_by(Meeting.created_at.desc()).all()

    return jsonify({
        "meetings": [
            serialize_meeting(meeting)
            for meeting in meetings
        ],
        "total": len(meetings)
    }), 200


# CREATE MEETING
@meetings_bp.route("", methods=["POST"])
@jwt_required()
def create_meeting():

    data = request.get_json(silent=True) or {}

    title = data.get("title")

    if not isinstance(title, str) or not title.strip():
        return jsonify({
            "message": "Meeting title is required"
        }), 400

    summary = data.get("summary", "")
    transcript = data.get("transcript_text", "")

    if not isinstance(summary, str) or not isinstance(transcript, str):
        return jsonify({
            "message": "Summary and transcript must be text"
        }), 400

    try:
        scheduled_at = parse_datetime(
            data.get("scheduled_at")
        )

        duration = data.get("duration_minutes")

        if duration is not None:
            if isinstance(duration, bool):
                raise ValueError()

            duration = int(duration)

            if duration <= 0:
                raise ValueError()

    except (ValueError, TypeError):
        return jsonify({
            "message": "Invalid meeting date or duration"
        }), 400

    user_id = int(get_jwt_identity())

    meeting = Meeting(
        owner_id=user_id,
        title=title.strip(),
        scheduled_at=scheduled_at,
        duration_minutes=duration,
        summary=summary,
        transcript_text=transcript,
        status="draft"
    )

    db.session.add(meeting)
    db.session.commit()

    return jsonify({
        "message": "Meeting created successfully",
        "meeting": serialize_meeting(meeting)
    }), 201


# GET A SINGLE MEETING
@meetings_bp.route("/<int:meeting_id>", methods=["GET"])
@jwt_required()
def get_meeting(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = Meeting.query.filter_by(
        id=meeting_id,
        owner_id=user_id
    ).first()

    if not meeting:
        return jsonify({
            "message": "Meeting not found"
        }), 404

    return jsonify({
        "meeting": serialize_meeting(meeting),
        "decisions": [
            {
                "id": decision.id,
                "content": decision.content
            }
            for decision in meeting.decisions
        ],
        "questions": [
            {
                "id": question.id,
                "content": question.content,
                "status": question.status
            }
            for question in meeting.questions
        ],
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "assigned_to_id": task.assigned_to_id,
                "due_date": (
                    task.due_date.isoformat()
                    if task.due_date else None
                ),
                "priority": task.priority,
                "status": task.status
            }
            for task in meeting.tasks
        ]
    }), 200


# UPDATE A MEETING
@meetings_bp.route("/<int:meeting_id>", methods=["PUT"])
@jwt_required()
def update_meeting(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = Meeting.query.filter_by(
        id=meeting_id,
        owner_id=user_id
    ).first()

    if not meeting:
        return jsonify({
            "message": "Meeting not found"
        }), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({
            "message": "Request data is required"
        }), 400

    if "title" in data:
        if not isinstance(data["title"], str) or not data["title"].strip():
            return jsonify({
                "message": "Meeting title cannot be empty"
            }), 400

        meeting.title = data["title"].strip()

    if "summary" in data:
        if not isinstance(data["summary"], str):
            return jsonify({
                "message": "Summary must be text"
            }), 400

        meeting.summary = data["summary"]

    if "transcript_text" in data:
        if not isinstance(data["transcript_text"], str):
            return jsonify({
                "message": "Transcript must be text"
            }), 400

        meeting.transcript_text = data["transcript_text"]

    if "scheduled_at" in data:
        try:
            meeting.scheduled_at = parse_datetime(
                data["scheduled_at"]
            )
        except ValueError:
            return jsonify({
                "message": "Invalid meeting date format"
            }), 400

    if "duration_minutes" in data:
        try:
            duration = data["duration_minutes"]

            if duration is not None:
                if isinstance(duration, bool):
                    raise ValueError()

                duration = int(duration)

                if duration <= 0:
                    raise ValueError()

            meeting.duration_minutes = duration

        except (ValueError, TypeError):
            return jsonify({
                "message": "Duration must be a positive number"
            }), 400

    db.session.commit()

    return jsonify({
        "message": "Meeting updated successfully",
        "meeting": serialize_meeting(meeting)
    }), 200


# DELETE A MEETING
@meetings_bp.route("/<int:meeting_id>", methods=["DELETE"])
@jwt_required()
def delete_meeting(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = Meeting.query.filter_by(
        id=meeting_id,
        owner_id=user_id
    ).first()

    if not meeting:
        return jsonify({
            "message": "Meeting not found"
        }), 404

    db.session.delete(meeting)
    db.session.commit()

    return jsonify({
        "message": "Meeting deleted successfully"
    }), 200
