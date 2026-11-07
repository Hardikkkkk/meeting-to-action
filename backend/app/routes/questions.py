from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Meeting, OpenQuestion


questions_bp = Blueprint("questions", __name__, url_prefix="/api")


def get_owned_meeting(meeting_id, user_id):
    return Meeting.query.filter_by(
        id=meeting_id,
        owner_id=user_id
    ).first()


def serialize_question(question):
    return {
        "id": question.id,
        "meeting_id": question.meeting_id,
        "content": question.content,
        "status": question.status
    }


# CREATE QUESTION
@questions_bp.route(
    "/meetings/<int:meeting_id>/questions",
    methods=["POST"]
)
@jwt_required()
def create_question(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = get_owned_meeting(meeting_id, user_id)

    if not meeting:
        return jsonify({"message": "Meeting not found"}), 404

    data = request.get_json(silent=True) or {}
    content = data.get("content")

    if not isinstance(content, str) or not content.strip():
        return jsonify({
            "message": "Question content is required"
        }), 400

    question = OpenQuestion(
        meeting_id=meeting.id,
        content=content.strip(),
        status="open"
    )

    db.session.add(question)
    db.session.commit()

    return jsonify({
        "message": "Question created successfully",
        "question": serialize_question(question)
    }), 201


# GET ALL QUESTIONS FOR A MEETING
@questions_bp.route(
    "/meetings/<int:meeting_id>/questions",
    methods=["GET"]
)
@jwt_required()
def get_questions(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = get_owned_meeting(meeting_id, user_id)

    if not meeting:
        return jsonify({"message": "Meeting not found"}), 404

    questions = OpenQuestion.query.filter_by(
        meeting_id=meeting_id
    ).order_by(OpenQuestion.id.desc()).all()

    return jsonify({
        "questions": [
            serialize_question(item)
            for item in questions
        ],
        "total": len(questions)
    }), 200


# UPDATE QUESTION / RESOLVE / REOPEN
@questions_bp.route(
    "/questions/<int:question_id>",
    methods=["PUT", "PATCH"]
)
@jwt_required()
def update_question(question_id):

    user_id = int(get_jwt_identity())

    question = OpenQuestion.query.join(Meeting).filter(
        OpenQuestion.id == question_id,
        Meeting.owner_id == user_id
    ).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({"message": "Request data is required"}), 400

    if "content" in data:
        content = data["content"]

        if not isinstance(content, str) or not content.strip():
            return jsonify({
                "message": "Question content cannot be empty"
            }), 400

        question.content = content.strip()

    if "status" in data:
        status = data["status"]

        if status not in ["open", "resolved"]:
            return jsonify({
                "message": "Status must be open or resolved"
            }), 400

        question.status = status

    db.session.commit()

    return jsonify({
        "message": "Question updated successfully",
        "question": serialize_question(question)
    }), 200


# DELETE QUESTION
@questions_bp.route(
    "/questions/<int:question_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_question(question_id):

    user_id = int(get_jwt_identity())

    question = OpenQuestion.query.join(Meeting).filter(
        OpenQuestion.id == question_id,
        Meeting.owner_id == user_id
    ).first()

    if not question:
        return jsonify({"message": "Question not found"}), 404

    db.session.delete(question)
    db.session.commit()

    return jsonify({
        "message": "Question deleted successfully"
    }), 200