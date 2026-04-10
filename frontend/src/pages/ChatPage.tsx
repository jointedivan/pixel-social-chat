type ChatPageProps = {
  onBack: () => void
}

export function ChatPage({ onBack }: ChatPageProps) {
  return (
    <main className="chat-screen">
      <section className="chat-layout" aria-label="Chat interface">
        <aside className="chat-sidebar" aria-label="Список чатов и сообществ">
          <header className="sidebar-top">
            <button className="sidebar-avatar" type="button" aria-label="Открыть профиль" />
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
            <button className="chat-close" type="button" onClick={onBack} aria-label="Вернуться назад">
              ✕
            </button>
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
