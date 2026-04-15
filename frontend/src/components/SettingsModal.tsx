import { useEffect, useId, useRef, useState } from 'react'
import { getCurrentUser, updateProfile, updateSettings, uploadAvatar, deleteAvatar, getAvatarUrl } from '../api/user'
import type { UserProfile, UserSettings } from '../api/user'
import { clearAccessToken } from '../authStorage'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  onLogout?: () => void
}

type Tab = 'profile' | 'appearance' | 'notifications' | 'privacy' | 'danger'

const AVATAR_OPTIONS = [
  { id: 1, name: 'Персонаж 1', color: '#ff7b00' },
  { id: 2, name: 'Персонаж 2', color: '#4ade80' },
  { id: 3, name: 'Персонаж 3', color: '#60a5fa' },
]

const THEME_OPTIONS = [
  { value: 'dark', label: 'Тёмная', icon: '🌙' },
  { value: 'light', label: 'Светлая', icon: '☀️' },
  { value: 'auto', label: 'Авто', icon: '🔄' },
] as const

export function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const titleId = useId()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Данные пользователя
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editedUsername, setEditedUsername] = useState('')
  const [editedAvatarId, setEditedAvatarId] = useState(1)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Загрузка данных при открытии
  useEffect(() => {
    if (!isOpen) return
    
    setIsLoading(true)
    setError(null)
    getCurrentUser()
      .then(user => {
        setProfile(user)
        setEditedUsername(user.username)
        setEditedAvatarId(user.avatar_id)
        setSettings(user.settings)
        // Устанавливаем превью только если есть URL
        const url = getAvatarUrl(user)
        setAvatarPreview(url)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setIsLoading(false))
  }, [isOpen])

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('profile')
      setError(null)
      setSuccess(null)
    }
  }, [isOpen])

  // Escape для закрытия
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateProfile({
        username: editedUsername,
        avatar_id: editedAvatarId,
      })
      setProfile(updated)
      setSuccess('Профиль сохранён')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async (updates: Partial<UserSettings>) => {
    if (!settings) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateSettings(updates)
      setSettings(updated)
      setSuccess('Настройки сохранены')
      
      // Применяем тему сразу
      if (updates.theme) {
        applyTheme(updated.theme)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    
    if (theme === 'light') {
      root.classList.add('theme-light')
    } else if (theme === 'dark') {
      root.classList.add('theme-dark')
    } else {
      // auto - проверяем системную тему
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light')
    }
  }

  const handleLogout = () => {
    clearAccessToken()
    onLogout?.()
    onClose()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Профиль' },
    { id: 'appearance', label: 'Внешний вид' },
    { id: 'notifications', label: 'Уведомления' },
    { id: 'privacy', label: 'Приватность' },
    { id: 'danger', label: 'Опасная зона' },
  ]

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div
        className="modal-dialog settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>Настройки</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="settings-layout">
          {/* Sidebar с табами */}
          <nav className="settings-sidebar" aria-label="Разделы настроек">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Контент */}
          <div className="settings-content">
            {isLoading ? (
              <p className="settings-loading">Загрузка...</p>
            ) : error ? (
              <p className="modal-message modal-message-error" role="alert">{error}</p>
            ) : (
              <>
                {success && (
                  <p className="modal-message modal-message-success" role="status">{success}</p>
                )}

                {/* Профиль */}
                {activeTab === 'profile' && (
                  <div className="settings-section">
                    <h3 className="settings-section-title">Профиль</h3>
                    
                    <div className="settings-field">
                      <label className="settings-label">Email</label>
                      <input
                        type="email"
                        className="modal-input"
                        value={profile?.email || ''}
                        disabled
                        title="Email нельзя изменить"
                      />
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">Никнейм</label>
                      <input
                        type="text"
                        className="modal-input"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        minLength={3}
                        maxLength={50}
                      />
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">Аватар</label>
                      
                      {/* Кастомная аватарка */}
                      <div className="custom-avatar-section">
                        <div className="current-avatar">
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Аватар" 
                              className="avatar-image-large"
                            />
                          ) : (
                            <div 
                              className="avatar-preview-large"
                              style={{ backgroundColor: AVATAR_OPTIONS[editedAvatarId - 1]?.color + '20' }}
                            >
                              {editedUsername[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        
                        <div className="avatar-actions">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              
                              // Preview
                              const reader = new FileReader()
                              reader.onloadend = () => setAvatarPreview(reader.result as string)
                              reader.readAsDataURL(file)
                              
                              // Upload
                              setIsSaving(true)
                              setError(null)
                              try {
                                const updated = await uploadAvatar(file)
                                setProfile(updated)
                                const serverUrl = getAvatarUrl(updated)
                                // Если сервер вернул URL — используем его, иначе оставляем FileReader превью
                                if (serverUrl) {
                                  setAvatarPreview(serverUrl)
                                }
                                setSuccess('Аватар загружен')
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Ошибка загрузки')
                              } finally {
                                setIsSaving(false)
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            className="modal-button modal-button-secondary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSaving}
                          >
                            📷 Загрузить фото
                          </button>
                          
                          {profile?.avatar_url && (
                            <button
                              type="button"
                              className="modal-button"
                              onClick={async () => {
                                setIsSaving(true)
                                try {
                                  const updated = await deleteAvatar()
                                  setProfile(updated)
                                  setAvatarPreview(null)
                                  setSuccess('Кастомная аватарка удалена')
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Ошибка')
                                } finally {
                                  setIsSaving(false)
                                }
                              }}
                              disabled={isSaving}
                            >
                              🗑️ Удалить фото
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Пресет аватарки (если нет кастомной) */}
                      {!profile?.avatar_url && (
                        <div className="avatar-grid" style={{ marginTop: 16 }}>
                          {AVATAR_OPTIONS.map(avatar => (
                            <button
                              key={avatar.id}
                              type="button"
                              className={`avatar-option ${editedAvatarId === avatar.id ? 'selected' : ''}`}
                              onClick={() => setEditedAvatarId(avatar.id)}
                              style={{ borderColor: editedAvatarId === avatar.id ? avatar.color : undefined }}
                            >
                              <div
                                className="avatar-preview"
                                style={{ backgroundColor: avatar.color + '20' }}
                              >
                                {avatar.name[0]}
                              </div>
                              <span className="avatar-name">{avatar.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="settings-actions">
                      <button
                        type="button"
                        className="modal-button modal-button-primary"
                        onClick={handleSaveProfile}
                        disabled={isSaving || !editedUsername.trim()}
                      >
                        {isSaving ? 'Сохранение...' : 'Сохранить профиль'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Внешний вид */}
                {activeTab === 'appearance' && settings && (
                  <div className="settings-section">
                    <h3 className="settings-section-title">Внешний вид</h3>
                    
                    <div className="settings-field">
                      <label className="settings-label">Тема</label>
                      <div className="theme-options">
                        {THEME_OPTIONS.map(theme => (
                          <button
                            key={theme.value}
                            type="button"
                            className={`theme-option ${settings.theme === theme.value ? 'selected' : ''}`}
                            onClick={() => handleSaveSettings({ theme: theme.value })}
                          >
                            <span className="theme-icon">{theme.icon}</span>
                            <span className="theme-label">{theme.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Уведомления */}
                {activeTab === 'notifications' && settings && (
                  <div className="settings-section">
                    <h3 className="settings-section-title">Уведомления</h3>
                    
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notifications_enabled}
                        onChange={(e) => handleSaveSettings({ notifications_enabled: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                      <span className="toggle-label">Включить уведомления</span>
                    </label>

                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.sound_enabled}
                        onChange={(e) => handleSaveSettings({ sound_enabled: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                      <span className="toggle-label">Звуковые уведомления</span>
                    </label>
                  </div>
                )}

                {/* Приватность */}
                {activeTab === 'privacy' && settings && (
                  <div className="settings-section">
                    <h3 className="settings-section-title">Приватность</h3>
                    
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.show_online_status}
                        onChange={(e) => handleSaveSettings({ show_online_status: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                      <span className="toggle-label">Показывать статус онлайн</span>
                    </label>

                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.allow_friend_requests}
                        onChange={(e) => handleSaveSettings({ allow_friend_requests: e.target.checked })}
                      />
                      <span className="toggle-slider" />
                      <span className="toggle-label">Разрешить заявки в друзья</span>
                    </label>
                  </div>
                )}

                {/* Опасная зона */}
                {activeTab === 'danger' && (
                  <div className="settings-section settings-danger">
                    <h3 className="settings-section-title">Опасная зона</h3>
                    
                    <div className="danger-zone">
                      <div className="danger-item">
                        <div>
                          <h4>Выйти из аккаунта</h4>
                          <p>Вам нужно будет войти снова</p>
                        </div>
                        <button
                          type="button"
                          className="modal-button modal-button-secondary"
                          onClick={handleLogout}
                        >
                          Выйти
                        </button>
                      </div>

                      <div className="danger-item">
                        <div>
                          <h4>Удалить аккаунт</h4>
                          <p>Это действие нельзя отменить</p>
                        </div>
                        <button
                          type="button"
                          className="modal-button modal-button-danger"
                          onClick={() => {
                            if (confirm('Точно удалить аккаунт? Все данные будут потеряны!')) {
                              // TODO: deleteAccount API
                              handleLogout()
                            }
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
