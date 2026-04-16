"""Схемы для чатов и сообщений"""
from datetime import datetime
from pydantic import BaseModel
from typing import Literal

from app.schemas.user import UserProfileRead


# ========== Message schemas ==========
class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    pass


class MessageRead(MessageBase):
    id: int
    chat_id: int
    sender: UserProfileRead
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Chat schemas ==========
class ChatBase(BaseModel):
    type: Literal["private", "group"] = "private"


class ChatCreate(ChatBase):
    participant_ids: list[int]  # ID пользователей для чата


class ChatParticipantRead(BaseModel):
    id: int
    user: UserProfileRead
    joined_at: datetime

    class Config:
        from_attributes = True


class ChatRead(ChatBase):
    id: int
    created_at: datetime
    participants: list[ChatParticipantRead]
    last_message: MessageRead | None = None
    unread_count: int = 0

    class Config:
        from_attributes = True


class ChatWithMessages(ChatRead):
    messages: list[MessageRead] = []
