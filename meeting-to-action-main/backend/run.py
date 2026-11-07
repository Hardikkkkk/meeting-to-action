
import os

from dotenv import load_dotenv
from app import create_app

# Load environment variables from .env
load_dotenv()

# Create Flask application
app = create_app()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=os.getenv("FLASK_DEBUG") == "1"
    )
