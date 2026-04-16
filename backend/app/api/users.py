import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, verify_password, hash_password
from app.models.user import User
from app.models.user_settings import UserSettings
from app.schemas.user import UserProfileRead, UserProfileUpdate, PasswordUpdate
from app.schemas.user_settings import UserSettingsRead, UserSettingsUpdate

# Настройка для загрузки файлов
UPLOAD_DIR = Path(__file__).parent.parent / "static" / "uploads" / "avatars"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

router = APIRouter(prefix="/users", tags=["users"])


def get_or_create_user_settings(db: Session, user_id: int) -> UserSettings:
    """Получает или создаёт настройки пользователя"""
    settings = db.execute(
        select(UserSettings).where(UserSettings.user_id == user_id)
    ).scalar_one_or_none()
    if settings is None:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/me", response_model=UserProfileRead)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Получить профиль текущего пользователя с настройками"""
    # Убедимся что настройки существуют
    get_or_create_user_settings(db, current_user.id)
    return current_user


@router.get("/search", response_model=list[UserProfileRead])
def search_users(
    q: str = Query(..., min_length=1, max_length=50, description="Поиск по username"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[User]:
    """Поиск пользователей по username (без учёта регистра)"""
    # Исключаем текущего пользователя из результатов
    stmt = (
        select(User)
        .where(
            func.lower(User.username).like(func.lower(f"%{q}%")),
            User.id != current_user.id
        )
        .limit(20)
    )
    result = db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{user_id}", response_model=UserProfileRead)
def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Получить публичный профиль пользователя по ID"""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@router.put("/me", response_model=UserProfileRead)
def update_profile(
    update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Обновить профиль (username, avatar_id)"""
    
    if update.username is not None and update.username != current_user.username:
        # Проверка уникальности username
        existing = db.scalar(select(User).where(User.username == update.username))
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Этот никнейм уже занят"
            )
        current_user.username = update.username
    
    if update.avatar_id is not None:
        current_user.avatar_id = update.avatar_id
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def update_password(
    update: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Сменить пароль"""
    
    # Проверяем текущий пароль
    if not verify_password(update.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль"
        )
    
    # Обновляем пароль
    current_user.hashed_password = hash_password(update.new_password)
    db.commit()
    
    return {"message": "Пароль успешно изменён"}


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Удалить аккаунт"""
    
    # Удаляем аватар если есть
    if current_user.avatar_url:
        avatar_path = UPLOAD_DIR / Path(current_user.avatar_url).name
        if avatar_path.exists():
            avatar_path.unlink()
    
    db.delete(current_user)
    db.commit()
    
    return {"message": "Аккаунт удалён"}


@router.post("/me/avatar", response_model=UserProfileRead)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Загрузить кастомную аватарку"""
    
    # Проверяем тип файла
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неподдерживаемый формат. Разрешены: JPEG, PNG, WebP, GIF"
        )
    
    # Проверяем размер файла
    file.file.seek(0, 2)  # Переходим в конец
    file_size = file.file.tell()
    file.file.seek(0)  # Возвращаем в начало
    
    if file_size > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимум: {MAX_AVATAR_SIZE // 1024 // 1024}MB"
        )
    
    # Удаляем старую аватарку если была
    if current_user.avatar_url:
        old_path = UPLOAD_DIR / Path(current_user.avatar_url).name
        if old_path.exists():
            old_path.unlink()
    
    # Генерируем уникальное имя
    ext = Path(file.filename or "avatar.jpg").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"
    
    filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:12]}{ext}"
    filepath = UPLOAD_DIR / filename
    
    # Сохраняем файл
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    
    # Обновляем пользователя
    current_user.avatar_url = f"/static/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.delete("/me/avatar", response_model=UserProfileRead)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Удалить кастомную аватарку и вернуться к пресету"""
    
    if current_user.avatar_url:
        filepath = UPLOAD_DIR / Path(current_user.avatar_url).name
        if filepath.exists():
            filepath.unlink()
        
        current_user.avatar_url = None
        db.commit()
        db.refresh(current_user)
    
    return current_user


# === Настройки ===

@router.get("/me/settings", response_model=UserSettingsRead)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserSettings:
    """Получить настройки пользователя"""
    return get_or_create_user_settings(db, current_user.id)


@router.put("/me/settings", response_model=UserSettingsRead)
def update_settings(
    update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserSettings:
    """Обновить настройки"""
    
    settings = get_or_create_user_settings(db, current_user.id)
    
    if update.theme is not None:
        settings.theme = update.theme
    if update.notifications_enabled is not None:
        settings.notifications_enabled = update.notifications_enabled
    if update.sound_enabled is not None:
        settings.sound_enabled = update.sound_enabled
    if update.show_online_status is not None:
        settings.show_online_status = update.show_online_status
    if update.allow_friend_requests is not None:
        settings.allow_friend_requests = update.allow_friend_requests
    
    db.commit()
    db.refresh(settings)
    return settings
