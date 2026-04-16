"""API endpoints для чатов и сообщений"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session, joinedload
from typing import Literal

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import Chat, ChatParticipant, Message, ChatType
from app.schemas.chat import ChatRead, ChatWithMessages, MessageCreate, MessageRead

router = APIRouter(prefix="/chats", tags=["chats"])


def get_or_create_private_chat(db: Session, user1_id: int, user2_id: int) -> Chat:
    """Найти или создать приватный чат между двумя пользователями"""
    # Ищем существующий чат
    stmt = (
        select(Chat)
        .join(ChatParticipant, Chat.id == ChatParticipant.chat_id)
        .where(
            Chat.type == ChatType.PRIVATE,
            ChatParticipant.user_id.in_([user1_id, user2_id])
        )
        .group_by(Chat.id)
        .having(Chat.id.in_(
            select(ChatParticipant.chat_id)
            .where(ChatParticipant.user_id == user1_id)
            .intersect(
                select(ChatParticipant.chat_id)
                .where(ChatParticipant.user_id == user2_id)
            )
        ))
    )
    result = db.execute(stmt)
    existing_chat = result.scalar_one_or_none()
    
    if existing_chat:
        return existing_chat
    
    # Создаём новый чат
    chat = Chat(type=ChatType.PRIVATE)
    db.add(chat)
    db.flush()  # Получаем chat.id
    
    # Добавляем участников
    participant1 = ChatParticipant(chat_id=chat.id, user_id=user1_id)
    participant2 = ChatParticipant(chat_id=chat.id, user_id=user2_id)
    db.add_all([participant1, participant2])
    
    db.commit()
    db.refresh(chat)
    return chat


@router.get("", response_model=list[ChatRead])
def get_my_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[Chat]:
    """Получить список чатов текущего пользователя"""
    # Находим все чаты, где пользователь является участником
    stmt = (
        select(Chat)
        .join(ChatParticipant, Chat.id == ChatParticipant.chat_id)
        .where(ChatParticipant.user_id == current_user.id)
        .options(
            joinedload(Chat.participants).joinedload(ChatParticipant.user),
            joinedload(Chat.messages).joinedload(Message.sender)
        )
        .order_by(Chat.created_at.desc())
    )
    
    result = db.execute(stmt)
    chats = result.scalars().unique().all()
    
    # Для каждого чата находим последнее сообщение
    for chat in chats:
        if chat.messages:
            chat.last_message = chat.messages[-1]
            chat.unread_count = sum(
                1 for m in chat.messages 
                if m.sender_id != current_user.id
            )
    
    return list(chats)


@router.post("/with/{user_id}", response_model=ChatRead)
def start_chat_with_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Chat:
    """Начать или открыть чат с конкретным пользователем"""
    # Проверяем, что пользователь существует
    other_user = db.get(User, user_id)
    if not other_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Нельзя создать чат с самим собой")
    
    chat = get_or_create_private_chat(db, current_user.id, user_id)
    
    # Загружаем связанные данные для ответа
    db.refresh(chat)
    chat.participants  # триггер lazy loading
    
    return chat


@router.get("/{chat_id}", response_model=ChatWithMessages)
def get_chat_messages(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Chat:
    """Получить чат с историей сообщений"""
    # Проверяем, что пользователь является участником чата
    participant = db.execute(
        select(ChatParticipant)
        .where(
            ChatParticipant.chat_id == chat_id,
            ChatParticipant.user_id == current_user.id
        )
    ).scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=403, detail="У вас нет доступа к этому чату")
    
    # Загружаем чат с сообщениями
    stmt = (
        select(Chat)
        .where(Chat.id == chat_id)
        .options(
            joinedload(Chat.participants).joinedload(ChatParticipant.user),
            joinedload(Chat.messages).joinedload(Message.sender)
        )
    )
    result = db.execute(stmt)
    chat = result.scalars().unique().one_or_none()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    
    # Добавляем last_message для схемы
    if chat.messages:
        chat.last_message = chat.messages[-1]
    
    return chat


@router.post("/{chat_id}/messages", response_model=MessageRead)
def send_message(
    chat_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Message:
    """Отправить сообщение в чат"""
    # Проверяем, что пользователь является участником чата
    participant = db.execute(
        select(ChatParticipant)
        .where(
            ChatParticipant.chat_id == chat_id,
            ChatParticipant.user_id == current_user.id
        )
    ).scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=403, detail="У вас нет доступа к этому чату")
    
    # Создаём сообщение
    new_message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=message.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return new_message
