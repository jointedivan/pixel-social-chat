import { useEffect, useState, useRef } from 'react'
import { SettingsModal } from '../components/SettingsModal'
import { UserProfileModal } from '../components/UserProfileModal'
import { clearAccessToken } from '../authStorage'
import { getCurrentUser, getAvatarUrl, searchUsers, type UserProfile } from '../api/user'
import { getMyChats, startChatWithUser, getChatMessages, sendMessage, getChatName, getChatAvatar, type Chat, type Message } from '../api/chat'

type ChatPageProps = {
  onLogout?: () => void
}

export function ChatPage({ onLogout }: ChatPageProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  // Поиск пользователей
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Выбранный пользователь для просмотра профиля
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  
  // Чаты и сообщения
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Загружаем профиль и список чатов при входе
  useEffect(() => {
    getCurrentUser()
      .then(user => setProfile(user))
      .catch(console.error)
    loadChats()
  }, [])
  
  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Загрузить список чатов
  const loadChats = async () => {
    try {
      const myChats = await getMyChats()
      setChats(myChats)
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err)
    }
  }
  
  // Открыть чат
  const handleOpenChat = async (chat: Chat) => {
    setActiveChat(chat)
    setIsLoadingChat(true)
    try {
      const chatWithMessages = await getChatMessages(chat.id)
      setMessages(chatWithMessages.messages)
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err)
    } finally {
      setIsLoadingChat(false)
    }
  }
  
  // Отправить сообщение
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!activeChat || !messageInput.trim() || !profile) return
    
    try {
      const newMessage = await sendMessage(activeChat.id, messageInput.trim())
      setMessages(prev => [...prev, newMessage])
      setMessageInput('')
      // Обновляем последнее сообщение в списке чатов
      setChats(prev => prev.map(c => 
        c.id === activeChat.id 
          ? { ...c, last_message: newMessage }
          : c
      ))
    } catch (err) {
      console.error('Ошибка отправки:', err)
    }
  }

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
  
  // Поиск пользователей с debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Очищаем предыдущий таймаут
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (query.trim().length === 0) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }
    
    // Debounce 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchUsers(query)
        setSearchResults(results)
        setShowSearchResults(true)
      } catch (err) {
        console.error('Ошибка поиска:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }
  
  // Открыть профиль пользователя
  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user)
    setIsProfileModalOpen(true)
    setShowSearchResults(false)
    setSearchQuery('')
  }
  
  // Начать чат с пользователем (из профиля)
  const handleStartChat = async (user: UserProfile) => {
    try {
      const chat = await startChatWithUser(user.id)
      setIsProfileModalOpen(false)
      setSelectedUser(null)
      // Обновляем список чатов и открываем новый
      await loadChats()
      handleOpenChat(chat)
    } catch (err) {
      console.error('Ошибка создания чата:', err)
    }
  }
  
  // Получить собеседника для активного чата
  const getActiveChatOther = () => {
    if (!activeChat || !profile) return null
    return activeChat.participants.find(p => p.user.id !== profile.id)?.user || null
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
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                className="sidebar-search" 
                type="text" 
                placeholder="Поиск пользователей..." 
                aria-label="Поиск пользователей"
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              
              {/* Результаты поиска */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      className="search-result-item"
                      onClick={() => handleUserClick(user)}
                    >
                      <div 
                        className="search-result-avatar"
                        style={{
                          backgroundImage: user.avatar_url ? `url(${getAvatarUrl(user)})` : 'none',
                          backgroundColor: user.avatar_url ? 'transparent' : '#344353'
                        }}
                      >
                        {!user.avatar_url && (
                          <span>{user.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="search-result-username">{user.username}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="search-loading">Поиск...</div>
              )}
            </div>
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
                {chats.length === 0 ? (
                  <p className="sidebar-section-empty">Нет активных чатов</p>
                ) : (
                  <div className="chat-list">
                    {chats.map(chat => {
                      const other = profile ? chat.participants.find(p => p.user.id !== profile.id)?.user : null
                      const isActive = activeChat?.id === chat.id
                      return (
                        <button
                          key={chat.id}
                          className={`chat-list-item ${isActive ? 'chat-list-item-active' : ''}`}
                          onClick={() => handleOpenChat(chat)}
                        >
                          <div
                            className="chat-list-avatar"
                            style={{
                              backgroundImage: other?.avatar_url ? `url(${getAvatarUrl(other)})` : 'none',
                              backgroundColor: other?.avatar_url ? 'transparent' : '#344353'
                            }}
                          >
                            {!other?.avatar_url && other && (
                              <span>{other.username[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="chat-list-info">
                            <span className="chat-list-name">
                              {profile ? getChatName(chat, profile.id) : '...'}
                            </span>
                            {chat.last_message && (
                              <span className="chat-list-preview">
                                {chat.last_message.sender.id === profile?.id ? 'Вы: ' : ''}
                                {chat.last_message.content.slice(0, 30)}
                                {chat.last_message.content.length > 30 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
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
            {activeChat ? (
              <>
                <div
                  className="chat-avatar"
                  style={{
                    backgroundImage: (() => {
                      const other = getActiveChatOther()
                      return other?.avatar_url ? `url(${getAvatarUrl(other)})` : 'none'
                    })(),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: getActiveChatOther()?.avatar_url ? 'transparent' : '#344353'
                  }}
                >
                  {!getActiveChatOther()?.avatar_url && getActiveChatOther() && (
                    <span>{getActiveChatOther()?.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="chat-meta">
                  <p className="chat-name">{getActiveChatOther()?.username || '...'}</p>
                  <p className="chat-status">online</p>
                </div>
              </>
            ) : (
              <>
                <div className="chat-avatar" aria-hidden="true" />
                <div className="chat-meta">
                  <p className="chat-name">Выберите чат</p>
                  <p className="chat-status">Нажмите на пользователя в поиске или в списке чатов</p>
                </div>
              </>
            )}
          </header>

          <div className="chat-body">
            {isLoadingChat ? (
              <p className="chat-placeholder">Загрузка сообщений...</p>
            ) : activeChat ? (
              <div className="messages-list">
                {messages.length === 0 ? (
                  <p className="chat-placeholder">Напишите первое сообщение!</p>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender.id === profile?.id
                    return (
                      <div
                        key={msg.id}
                        className={`message ${isMine ? 'message-mine' : 'message-other'}`}
                      >
                        <div className="message-content">{msg.content}</div>
                        <div className="message-time">
                          {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <p className="chat-placeholder">Выберите чат, чтобы начать переписку</p>
            )}
          </div>

          <footer className="chat-input-wrap">
            <form className="chat-input-row" onSubmit={handleSendMessage}>
              <input
                className="chat-input"
                type="text"
                placeholder={activeChat ? "Напиши сообщение..." : "Выберите чат для общения..."}
                aria-label="Введите сообщение"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                disabled={!activeChat}
              />
              <button
                className="send-button"
                type="submit"
                aria-label="Отправить сообщение"
                disabled={!activeChat || !messageInput.trim()}
              >
                ➤
              </button>
            </form>
          </footer>
        </section>
      </section>
      
      {/* Модалка профиля пользователя */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
        currentUserId={profile?.id}
        onStartChat={selectedUser ? () => handleStartChat(selectedUser) : undefined}
      />
    </main>
  )
}
