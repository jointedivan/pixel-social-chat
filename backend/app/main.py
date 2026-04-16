import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.chats import router as chats_router
from app.core.database import Base, engine
from app.core.logging import log_error, log_request
from app.models import User  # noqa: F401 — регистрация модели в metadata
from app.models.user_settings import UserSettings  # noqa: F401
from app.models.chat import Chat, ChatParticipant, Message  # noqa: F401 — регистрация моделей чатов


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Для разработки: удаляем и создаём таблицы заново
    # В продакшене убрать drop_all!
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[DB] Таблицы пересозданы")
    yield


app = FastAPI(title="Pixel Social Chat API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_middleware(request: Request, call_next):
    """Логирует все запросы и их длительность"""
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000
        log_request(request.method, request.url.path, response.status_code, duration)
        return response
    except Exception as e:
        duration = (time.time() - start_time) * 1000
        log_error(e, f"{request.method} {request.url.path}")
        raise


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chats_router)

# Монтируем static директорию для загруженных аватарок
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Глобальный обработчик непойманных ошибок"""
    log_error(exc, f"UNHANDLED {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Внутренняя ошибка сервера"}
    )
