import { api } from './client'
import { getAccessToken } from '../authStorage'

export type UserProfile = {
  id: number
  email: string
  username: string
  avatar_id: number
  avatar_url: string | null  // custom uploaded avatar
  settings: UserSettings
}

export type UserSettings = {
  id: number
  user_id: number
  theme: 'light' | 'dark' | 'auto'
  notifications_enabled: boolean
  sound_enabled: boolean
  show_online_status: boolean
  allow_friend_requests: boolean
}

export type UpdateProfileData = {
  username?: string
  avatar_id?: number
}

export type UpdatePasswordData = {
  current_password: string
  new_password: string
}

export type UpdateSettingsData = Partial<Omit<UserSettings, 'id' | 'user_id'>>

/** Получить профиль текущего пользователя */
export async function getCurrentUser(): Promise<UserProfile> {
  return api.get<UserProfile>('/users/me')
}

/** Поиск пользователей по никнейму */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  return api.get<UserProfile[]>(`/users/search?q=${encodeURIComponent(query)}`)
}

/** Получить профиль пользователя по ID */
export async function getUserById(userId: number): Promise<UserProfile> {
  return api.get<UserProfile>(`/users/${userId}`)
}

/** Обновить профиль (никнейм, аватар) */
export async function updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  return api.put<UserProfile>('/users/me', data)
}

/** Сменить пароль */
export async function updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
  return api.put('/users/me/password', data)
}

/** Удалить аккаунт */
export async function deleteAccount(): Promise<{ message: string }> {
  return api.delete('/users/me')
}

const MAX_AVATAR_SIZE_MB = 5
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024

/** Загрузить кастомную аватарку */
export async function uploadAvatar(file: File): Promise<UserProfile> {
  // Проверка размера
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error(`Файл слишком большой. Максимум ${MAX_AVATAR_SIZE_MB}MB`)
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  const token = getAccessToken()
  const res = await fetch('/api/users/me/avatar', {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData,
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Ошибка загрузки аватара')
  }
  
  return res.json()
}

/** Удалить кастомную аватарку */
export async function deleteAvatar(): Promise<UserProfile> {
  return api.delete('/users/me/avatar')
}

/** Получить полный URL аватара */
export function getAvatarUrl(profile: UserProfile | null): string | null {
  if (!profile?.avatar_url) return null
  // Загруженная аватарка — сервер отдаёт по /static/uploads/avatars/...
  return profile.avatar_url
}

/** Получить настройки */
export async function getSettings(): Promise<UserSettings> {
  return api.get<UserSettings>('/users/me/settings')
}

/** Обновить настройки */
export async function updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
  return api.put<UserSettings>('/users/me/settings', data)
}
