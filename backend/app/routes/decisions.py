from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Meeting, Decision


decisions_bp = Blueprint("decisions", __name__, url_prefix="/api")


def get_owned_meeting(meeting_id, user_id):
    return Meeting.query.filter_by(
        id=meeting_id,
        owner_id=user_id
    ).first()


def serialize_decision(decision):
    return {
        "id": decision.id,
        "meeting_id": decision.meeting_id,
        "content": decision.content,
        "created_at": (
            decision.created_at.isoformat()
            if decision.created_at else None
        )
    }


# CREATE DECISION
@decisions_bp.route(
    "/meetings/<int:meeting_id>/decisions",
    methods=["POST"]
)
@jwt_required()
def create_decision(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = get_owned_meeting(meeting_id, user_id)

    if not meeting:
        return jsonify({"message": "Meeting not found"}), 404

    data = request.get_json(silent=True) or {}
    content = data.get("content")

    if not isinstance(content, str) or not content.strip():
        return jsonify({
            "message": "Decision content is required"
        }), 400

    decision = Decision(
        meeting_id=meeting.id,
        content=content.strip()
    )

    db.session.add(decision)
    db.session.commit()

    return jsonify({
        "message": "Decision created successfully",
        "decision": serialize_decision(decision)
    }), 201


# GET ALL DECISIONS FOR A MEETING
@decisions_bp.route(
    "/meetings/<int:meeting_id>/decisions",
    methods=["GET"]
)
@jwt_required()
def get_decisions(meeting_id):

    user_id = int(get_jwt_identity())

    meeting = get_owned_meeting(meeting_id, user_id)

    if not meeting:
        return jsonify({"message": "Meeting not found"}), 404

    decisions = Decision.query.filter_by(
        meeting_id=meeting_id
    ).order_by(Decision.created_at.desc()).all()

    return jsonify({
        "decisions": [
            serialize_decision(item)
            for item in decisions
        ],
        "total": len(decisions)
    }), 200


# UPDATE DECISION
@decisions_bp.route(
    "/decisions/<int:decision_id>",
    methods=["PUT"]
)
@jwt_required()
def update_decision(decision_id):

    user_id = int(get_jwt_identity())

    decision = Decision.query.join(Meeting).filter(
        Decision.id == decision_id,
        Meeting.owner_id == user_id
    ).first()

    if not decision:
        return jsonify({"message": "Decision not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({"message": "Request data is required"}), 400

    content = data.get("content")

    if not isinstance(content, str) or not content.strip():
        return jsonify({
            "message": "Decision content is required"
        }), 400

    decision.content = content.strip()

    db.session.commit()

    return jsonify({
        "message": "Decision updated successfully",
        "decision": serialize_decision(decision)
    }), 200


# DELETE DECISION
@decisions_bp.route(
    "/decisions/<int:decision_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_decision(decision_id):

    user_id = int(get_jwt_identity())

    decision = Decision.query.join(Meeting).filter(
        Decision.id == decision_id,
        Meeting.owner_id == user_id
    ).first()

    if not decision:
        return jsonify({"message": "Decision not found"}), 404

    db.session.delete(decision)
    db.session.commit()

    return jsonify({
        "message": "Decision deleted successfully"
    }), 200