import os
from flask_cors import CORS
from pathlib import Path

from flask import Flask, jsonify

from app.config import Config
from app.extensions import db, migrate, jwt


def create_app():

    # Create Flask application
    app = Flask(__name__)

    CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ]
    }
})

    # Load application settings
    app.config.from_object(Config)

    # Create instance folder if it doesn't exist
    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    # Configure database
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        database_path = Path(app.instance_path) / "meeting_to_action.db"
        app.config["SQLALCHEMY_DATABASE_URI"] = (
            f"sqlite:///{database_path.as_posix()}"
        )

    # Connect database and migration tools
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Load database models
    from app import models

    from app.routes.auth import auth_bp

    app.register_blueprint(auth_bp)

    # Test whether backend is running
    @app.get("/api/health")
    def health_check():
        return jsonify({
            "status": "success",
            "message": "Meeting to Action backend is running"
        }), 200

    return app
