from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserSettings(Base):
    """Настройки пользователя (тема, уведомления и др.)"""
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    
    # Тема: "light" | "dark" | "auto"
    theme: Mapped[str] = mapped_column(String(10), default="dark")
    
    # Уведомления
    notifications_enabled: Mapped[bool] = mapped_column(default=True)
    sound_enabled: Mapped[bool] = mapped_column(default=True)
    
    # Приватность
    show_online_status: Mapped[bool] = mapped_column(default=True)
    allow_friend_requests: Mapped[bool] = mapped_column(default=True)
    
    # Связь с пользователем
    user: Mapped["User"] = relationship(back_populates="settings")
