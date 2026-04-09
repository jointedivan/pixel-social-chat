type ChatPageProps = {
  onBack: () => void
}

export function ChatPage({ onBack }: ChatPageProps) {
  return (
    <main className="chat-screen">
      <section className="chat-shell" aria-label="Chat interface">
        <header className="chat-header">
          <div className="chat-avatar" aria-hidden="true" />
          <div className="chat-meta">
            <p className="chat-name">DarkHeartedAlchemist</p>
            <p className="chat-status">в сети</p>
          </div>
          <button className="chat-close" type="button" onClick={onBack} aria-label="Вернуться назад">
            ✕
          </button>
        </header>

        <div className="chat-body">
          <p className="chat-placeholder">Здесь будут сообщения</p>
        </div>

        <footer className="chat-input-wrap">
          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Сообщение"
              aria-label="Введите сообщение"
            />
            <button className="send-button" type="button" aria-label="Отправить сообщение">
              ➤
            </button>
          </div>
          <div className="chat-tools" aria-hidden="true">
            <span>◻</span>
            <span>☺</span>
            <span>GIF</span>
          </div>
        </footer>
      </section>
    </main>
  )
}
