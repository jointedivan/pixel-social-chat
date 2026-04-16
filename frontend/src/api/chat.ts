import { api } from './client'
import type { UserProfile } from './user'

export type ChatType = 'private' | 'group'

export interface Message {
  id: number
  chat_id: number
  sender: UserProfile
  content: string
  created_at: string
}

export interface ChatParticipant {
  id: number
  user: UserProfile
  joined_at: string
}

export interface Chat {
  id: number
  type: ChatType
  created_at: string
  participants: ChatParticipant[]
  last_message: Message | null
  unread_count: number
}

export interface ChatWithMessages extends Chat {
  messages: Message[]
}

export interface SendMessageData {
  content: string
}

/** Получить список чатов текущего пользователя */
export async function getMyChats(): Promise<Chat[]> {
  return api.get<Chat[]>('/chats')
}

/** Начать чат с пользователем (или открыть существующий) */
export async function startChatWithUser(userId: number): Promise<Chat> {
  return api.post<Chat>(`/chats/with/${userId}`, {})
}

/** Получить чат с сообщениями */
export async function getChatMessages(chatId: number): Promise<ChatWithMessages> {
  return api.get<ChatWithMessages>(`/chats/${chatId}`)
}

/** Отправить сообщение */
export async function sendMessage(chatId: number, content: string): Promise<Message> {
  const data: SendMessageData = { content }
  return api.post<Message>(`/chats/${chatId}/messages`, data)
}

/** Получить имя собеседника для приватного чата */
export function getOtherParticipant(chat: Chat, currentUserId: number): UserProfile | null {
  const other = chat.participants.find(p => p.user.id !== currentUserId)
  return other?.user || null
}

/** Получить аватар чата (для приватного — аватар собеседника) */
export function getChatAvatar(chat: Chat, currentUserId: number): string | null {
  const other = getOtherParticipant(chat, currentUserId)
  return other?.avatar_url || null
}

/** Получить название чата (для приватного — имя собеседника) */
export function getChatName(chat: Chat, currentUserId: number): string {
  const other = getOtherParticipant(chat, currentUserId)
  return other?.username || 'Неизвестный'
}
