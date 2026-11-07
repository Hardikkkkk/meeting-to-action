import os
from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate, jwt


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    # Enable CORS for the React frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    })

    # Create instance folder
    Path(app.instance_path).mkdir(
        parents=True,
        exist_ok=True
    )

    # Configure database
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        database_path = (
            Path(app.instance_path) / "meeting_to_action.db"
        )

        app.config["SQLALCHEMY_DATABASE_URI"] = (
            f"sqlite:///{database_path.as_posix()}"
        )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Load models
    from app import models

    # Authentication routes
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # Meeting routes
    from app.routes.meetings import meetings_bp
    app.register_blueprint(meetings_bp)

    # Decision routes
    from app.routes.decisions import decisions_bp
    app.register_blueprint(decisions_bp)

    # Open question routes
    from app.routes.questions import questions_bp
    app.register_blueprint(questions_bp)

    # Task routes
    from app.routes.tasks import tasks_bp
    app.register_blueprint(tasks_bp)

    # Health check
    @app.get("/api/health")
    def health_check():

        return jsonify({
            "status": "success",
            "message": "Meeting to Action backend is running"
        }), 200

    return app