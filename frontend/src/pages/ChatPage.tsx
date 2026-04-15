import { useEffect, useState } from 'react'
import { SettingsModal } from '../components/SettingsModal'
import { clearAccessToken } from '../authStorage'
import { getCurrentUser, getAvatarUrl, type UserProfile } from '../api/user'

type ChatPageProps = {
  onLogout?: () => void
}

export function ChatPage({ onLogout }: ChatPageProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Загружаем профиль при входе
  useEffect(() => {
    getCurrentUser()
      .then(user => setProfile(user))
      .catch(console.error)
  }, [])

  const handleLogout = () => {
    clearAccessToken()
    onLogout?.()
  }

  const handleSettingsClose = () => {
    setIsSettingsOpen(false)
    // Обновляем профиль после закрытия настроек (могли поменять аватар)
    getCurrentUser()
      .then(user => setProfile(user))
      .catch(console.error)
  }

  return (
    <main className="chat-screen">
      <section className="chat-layout" aria-label="Chat interface">
        <aside className="chat-sidebar" aria-label="Список чатов и сообществ">
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={handleSettingsClose}
            onLogout={handleLogout}
          />
          
          <header className="sidebar-top">
            <button 
              className="sidebar-avatar" 
              type="button" 
              aria-label="Открыть настройки"
              onClick={() => setIsSettingsOpen(true)}
              style={{ 
                backgroundImage: profile?.avatar_url ? `url(${getAvatarUrl(profile)})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: profile?.avatar_url ? 'transparent' : '#344353'
              }}
            >
              {!profile?.avatar_url && profile?.username && (
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  {profile.username[0].toUpperCase()}
                </span>
              )}
            </button>
            <input className="sidebar-search" type="text" placeholder="Поиск" aria-label="Поиск чатов" />
          </header>

          <div className="sidebar-divider" />

          <nav className="sidebar-list" aria-label="Чаты">
            <button className="sidebar-item sidebar-item-active" type="button">
              Лента
            </button>
            <button className="sidebar-item" type="button">
              Популярное
            </button>
            <button className="sidebar-item" type="button">
              Новости
            </button>
          </nav>

          <div className="sidebar-sections" aria-label="Сообщества, чаты и каналы">
            <section className="sidebar-section" aria-labelledby="sidebar-heading-communities">
              <div className="sidebar-section-rule" aria-hidden="true" />
              <h2 className="sidebar-caption" id="sidebar-heading-communities">
                Сообщества
              </h2>
              <div className="sidebar-section-body">
                <p className="sidebar-section-empty">Список сообществ появится здесь</p>
              </div>
            </section>

            <section className="sidebar-section" aria-labelledby="sidebar-heading-chats">
              <div className="sidebar-section-rule" aria-hidden="true" />
              <h2 className="sidebar-caption" id="sidebar-heading-chats">
                Чаты
              </h2>
              <div className="sidebar-section-body">
                <p className="sidebar-section-empty">Групповые и личные чаты</p>
              </div>
            </section>

            <section className="sidebar-section" aria-labelledby="sidebar-heading-channels">
              <div className="sidebar-section-rule" aria-hidden="true" />
              <h2 className="sidebar-caption" id="sidebar-heading-channels">
                Каналы
              </h2>
              <div className="sidebar-section-body">
                <p className="sidebar-section-empty">Каналы появятся здесь</p>
              </div>
            </section>
          </div>
        </aside>

        <section className="game-area" aria-label="Игровая область">
          <div className="room-stage" data-stage="interactive-room">
            <div className="room-layer room-layer-background" data-layer="background" />
            <div className="room-layer room-layer-entities" data-layer="entities" />
            <div className="room-layer room-layer-ui" data-layer="ui" />

            <div className="game-placeholder">
              <p className="game-title">Интерактивная комната (заглушка)</p>
              <p className="game-subtitle">Позже сюда подключим персонажей, мебель и магазин.</p>
            </div>
          </div>
        </section>

        <section className="chat-shell">
          <header className="chat-header">
            <div className="chat-avatar" aria-hidden="true" />
            <div className="chat-meta">
              <p className="chat-name">Mia Pixel</p>
              <p className="chat-status">online</p>
            </div>
          </header>

          <div className="chat-body">
            <p className="chat-placeholder">Переписка появится здесь после подключения сервера.</p>
          </div>

          <footer className="chat-input-wrap">
            <div className="chat-input-row">
              <input
                className="chat-input"
                type="text"
                placeholder="Напиши сообщение..."
                aria-label="Введите сообщение"
              />
              <button className="send-button" type="button" aria-label="Отправить сообщение">
                ➤
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  )
}
