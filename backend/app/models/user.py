from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user_settings import UserSettings
    from app.models.chat import ChatParticipant, Message


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    avatar_id: Mapped[int] = mapped_column(default=1)  # preset avatar ID (1-3)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # custom uploaded avatar
    hashed_password: Mapped[str] = mapped_column(String(255))
    
    # Связь с настройками (one-to-one)
    settings: Mapped["UserSettings"] = relationship(back_populates="user", uselist=False)
    
    # Связи с чатами
    chat_participants: Mapped[list["ChatParticipant"]] = relationship(
        "ChatParticipant", back_populates="user", cascade="all, delete-orphan"
    )
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="sender", cascade="all, delete-orphan"
    )
