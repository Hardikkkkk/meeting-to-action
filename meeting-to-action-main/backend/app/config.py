import os

class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "development-secret-key-change-later"
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "development-jwt-secret-change-later"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False