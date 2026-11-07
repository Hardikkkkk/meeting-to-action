from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from sqlalchemy import event
from sqlalchemy.engine import Engine


# Initialize SQLAlchemy
db = SQLAlchemy()

# Initialize Flask-Migrate
migrate = Migrate()
jwt = JWTManager()


# Enable foreign key support in SQLite
@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(connection, record):

    if connection.__class__.__module__ == "sqlite3":
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
