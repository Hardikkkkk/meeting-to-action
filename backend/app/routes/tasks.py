from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Meeting, Task, User


tasks_bp = Blueprint("tasks", __name__, url_prefix="/api")


VALID_PRIORITIES = ["low", "medium", "high"]
VALID_STATUSES = ["todo", "in_progress", "done"]


def get_owned_meeting(meeting_id, user_id):
    return Meeting.query.filter_by(
        id=meeting_id,
        owner_id=user_id
    ).first()


def parse_datetime(value):

    if value is None or value == "":
        return None

    if not isinstance(value, str):
        raise ValueError("Invalid date format")

    try:
        return datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
    except ValueError:
        raise ValueError("Invalid date format")


def serialize_task(task):
    return {
        "id": task.id,
        "meeting_id": task.meeting_id,
        "title": task.title,
        "description": task.description,
        "assigned_to_id": task.assigned_to_id,
        "assigned_to_name": (
            task.assignee.name if task.assignee else None
        ),
        "created_by_id": task.created_by_id,
        "due_date": (
            task.due_date.isoformat()
            if task.due_date else None
        ),
        "priority": task.priority,
        "status": task.status,
        "created_at": (
            task.created_at.isoformat()
            if task.created_at else None
        ),
        "completed_at": (
            task.completed_at.isoformat()
            if task.completed_at else None
        )
    }


def validate_assignee(assigned_to_id):

    if assigned_to_id is None:
        return None

    if isinstance(assigned_to_id, bool):
        raise ValueError("Invalid assigned user")

    try:
        assigned_to_id = int(assigned_to_id)
    except (ValueError, TypeError):
        raise ValueError("Invalid assigned user")

    user = db.session.get(User, assigned_to_id)

    if not user:
        raise ValueError("Assigned user does not exist")

    return assigned_to_id


# CREATE TASK
@tasks_bp.route(
    "/meetings/<int:meeting_id>/tasks",
    methods=["POST"]
)
@jwt_required()
def create_task(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = get_owned_meeting(meeting_id, user_id)

    if not meeting:
        return jsonify({"message": "Meeting not found"}), 404

    data = request.get_json(silent=True) or {}

    title = data.get("title")

    if not isinstance(title, str) or not title.strip():
        return jsonify({"message": "Task title is required"}), 400

    description = data.get("description", "")

    if not isinstance(description, str):
        return jsonify({
            "message": "Task description must be text"
        }), 400

    priority = data.get("priority", "medium")

    if priority not in VALID_PRIORITIES:
        return jsonify({
            "message": "Priority must be low, medium or high"
        }), 400

    status = data.get("status", "todo")

    if status not in VALID_STATUSES:
        return jsonify({
            "message": "Invalid task status"
        }), 400

    try:
        due_date = parse_datetime(data.get("due_date"))
        assigned_to_id = validate_assignee(
            data.get("assigned_to_id")
        )
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    completed_at = (
        datetime.now(timezone.utc)
        if status == "done" else None
    )

    task = Task(
        meeting_id=meeting.id,
        title=title.strip(),
        description=description.strip(),
        assigned_to_id=assigned_to_id,
        created_by_id=user_id,
        due_date=due_date,
        priority=priority,
        status=status,
        completed_at=completed_at
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        "message": "Task created successfully",
        "task": serialize_task(task)
    }), 201


# GET ALL TASKS BELONGING TO THE LOGGED-IN USER
@tasks_bp.route("/tasks", methods=["GET"])
@jwt_required()
def get_all_tasks():

    user_id = int(get_jwt_identity())

    tasks = Task.query.join(Meeting).filter(
        Meeting.owner_id == user_id
    ).order_by(Task.created_at.desc()).all()

    return jsonify({
        "tasks": [
            serialize_task(task)
            for task in tasks
        ],
        "total": len(tasks)
    }), 200


# GET TASKS FOR A PARTICULAR MEETING
@tasks_bp.route(
    "/meetings/<int:meeting_id>/tasks",
    methods=["GET"]
)
@jwt_required()
def get_meeting_tasks(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = get_owned_meeting(meeting_id, user_id)

    if not meeting:
        return jsonify({"message": "Meeting not found"}), 404

    tasks = Task.query.filter_by(
        meeting_id=meeting_id
    ).order_by(Task.created_at.desc()).all()

    return jsonify({
        "tasks": [
            serialize_task(task)
            for task in tasks
        ],
        "total": len(tasks)
    }), 200


# GET A SINGLE TASK
@tasks_bp.route(
    "/tasks/<int:task_id>",
    methods=["GET"]
)
@jwt_required()
def get_task(task_id):

    user_id = int(get_jwt_identity())

    task = Task.query.join(Meeting).filter(
        Task.id == task_id,
        Meeting.owner_id == user_id
    ).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    return jsonify({
        "task": serialize_task(task)
    }), 200


# UPDATE TASK
@tasks_bp.route(
    "/tasks/<int:task_id>",
    methods=["PUT", "PATCH"]
)
@jwt_required()
def update_task(task_id):

    user_id = int(get_jwt_identity())

    task = Task.query.join(Meeting).filter(
        Task.id == task_id,
        Meeting.owner_id == user_id
    ).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({"message": "Request data is required"}), 400

    if "title" in data:
        title = data["title"]

        if not isinstance(title, str) or not title.strip():
            return jsonify({
                "message": "Task title cannot be empty"
            }), 400

        task.title = title.strip()

    if "description" in data:
        description = data["description"]

        if not isinstance(description, str):
            return jsonify({
                "message": "Task description must be text"
            }), 400

        task.description = description.strip()

    if "priority" in data:
        priority = data["priority"]

        if priority not in VALID_PRIORITIES:
            return jsonify({
                "message": "Priority must be low, medium or high"
            }), 400

        task.priority = priority

    if "status" in data:
        status = data["status"]

        if status not in VALID_STATUSES:
            return jsonify({
                "message": "Invalid task status"
            }), 400

        task.status = status

        if status == "done":
            if not task.completed_at:
                task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

    if "due_date" in data:
        try:
            task.due_date = parse_datetime(data["due_date"])
        except ValueError:
            return jsonify({
                "message": "Invalid due date format"
            }), 400

    if "assigned_to_id" in data:
        try:
            task.assigned_to_id = validate_assignee(
                data["assigned_to_id"]
            )
        except ValueError as error:
            return jsonify({"message": str(error)}), 400

    db.session.commit()

    return jsonify({
        "message": "Task updated successfully",
        "task": serialize_task(task)
    }), 200


# DELETE TASK
@tasks_bp.route(
    "/tasks/<int:task_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_task(task_id):

    user_id = int(get_jwt_identity())

    task = Task.query.join(Meeting).filter(
        Task.id == task_id,
        Meeting.owner_id == user_id
    ).first()

    if not task:
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({
        "message": "Task deleted successfully"
    }), 200