import { useState } from 'react'
import { getAvatarUrl, type UserProfile } from '../api/user'

type UserProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
  currentUserId?: number
  onStartChat?: () => void
}

export function UserProfileModal({ isOpen, onClose, user, currentUserId, onStartChat }: UserProfileModalProps) {
  const [isStartingChat, setIsStartingChat] = useState(false)

  if (!isOpen || !user) return null

  const handleStartChat = async () => {
    if (!onStartChat) return
    setIsStartingChat(true)
    await onStartChat()
    setIsStartingChat(false)
  }

  // Не показываем кнопку чата для самого себя
  const isSelf = currentUserId === user.id

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Профиль пользователя</h2>
          <button className="modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>

        <div className="user-profile-content">
          {/* Аватар */}
          <div className="user-profile-avatar-section">
            <div
              className="user-profile-avatar"
              style={{
                backgroundImage: user.avatar_url ? `url(${getAvatarUrl(user)})` : 'none',
                backgroundColor: user.avatar_url ? 'transparent' : '#344353'
              }}
            >
              {!user.avatar_url && (
                <span>{user.username[0].toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Информация */}
          <div className="user-profile-info">
            <div className="user-profile-field">
              <label>Никнейм</label>
              <span className="user-profile-value">{user.username}</span>
            </div>
          </div>

          {/* Действия */}
          {!isSelf && onStartChat && (
            <div className="user-profile-actions">
              <button
                className="modal-button modal-button-primary"
                onClick={handleStartChat}
                disabled={isStartingChat}
              >
                {isStartingChat ? 'Открываем чат...' : '💬 Написать сообщение'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal
