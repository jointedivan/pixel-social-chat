from pathlib import Path

# Путь к SQLite относительно каталога backend/
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DATABASE_URL = f"sqlite:///{_BACKEND_DIR / 'pixel_social.db'}"
