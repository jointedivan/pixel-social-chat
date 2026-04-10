type StartPageProps = {
  onStart: () => void
}

export function StartPage({ onStart }: StartPageProps) {
  return (
    <main className="start-screen">
      <h1 className="title">Pixel Social Chat</h1>
      <p className="start-subtitle">Черновой экран авторизации и входа в чат</p>

      <div className="auth-actions" role="group" aria-label="Действия авторизации">
        <button className="auth-button auth-button-register" type="button">
          Зарегистрироваться
        </button>
        <button className="auth-button auth-button-login" type="button">
          Войти
        </button>
      </div>

      <button className="start-button" type="button" onClick={onStart}>
        Открыть чат
      </button>
    </main>
  )
}
