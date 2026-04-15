import { useEffect, useState } from 'react'
import { LoginModal } from '../components/LoginModal'
import { RegisterModal } from '../components/RegisterModal'
import { clearAccessToken, isAuthenticated } from '../authStorage'

type StartPageProps = {
  onAuthSuccess: () => void
}

export function StartPage({ onAuthSuccess }: StartPageProps) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [isLoginOpen, isRegisterOpen])

  // Слушаем событие разлогина от API клиента (401 ошибка)
  useEffect(() => {
    const handleLogout = () => setIsLoggedIn(false)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  return (
    <main className="start-screen">
      <h1 className="title">Pixel Social Chat</h1>
      <p className="start-subtitle">Черновой экран авторизации и входа в чат</p>

      {isLoggedIn ? (
        <div className="start-session-banner" role="status">
          <span className="start-session-dot" aria-hidden="true" />
          <span className="start-session-text">Вы вошли в аккаунт</span>
          <button
            className="start-session-logout"
            type="button"
            onClick={() => {
              clearAccessToken()
              setIsLoggedIn(false)
            }}
          >
            Выйти
          </button>
        </div>
      ) : null}

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSuccess={() => onAuthSuccess()} 
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => onAuthSuccess()}
      />

      <div className="auth-actions" role="group" aria-label="Действия авторизации">
        <button
          className="auth-button auth-button-register"
          type="button"
          onClick={() => setIsRegisterOpen(true)}
        >
          Зарегистрироваться
        </button>
        <button
          className="auth-button auth-button-login"
          type="button"
          onClick={() => setIsLoginOpen(true)}
        >
          Войти
        </button>
      </div>
    </main>
  )
}
