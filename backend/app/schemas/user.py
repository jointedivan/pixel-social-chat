from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.user_settings import UserSettingsRead


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    avatar_id: int = Field(default=1, ge=1, le=10)
    password: str = Field(min_length=8, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# === Расширенные схемы для профиля ===

class UserProfileRead(BaseModel):
    """Полный профиль пользователя с настройками"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    username: str
    avatar_id: int
    avatar_url: str | None  # custom uploaded avatar URL
    settings: UserSettingsRead


class UserProfileUpdate(BaseModel):
    """Обновление профиля"""
    username: str | None = Field(None, min_length=3, max_length=50)
    avatar_id: int | None = Field(None, ge=1, le=10)


class PasswordUpdate(BaseModel):
    """Смена пароля"""
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
