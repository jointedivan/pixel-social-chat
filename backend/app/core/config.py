import os
from pathlib import Path

# Путь к SQLite относительно каталога backend/
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DATABASE_URL = f"sqlite:///{_BACKEND_DIR / 'pixel_social.db'}"

JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "dev-only-change-me-in-production")
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
