import { useEffect, useId, useState } from 'react'
import { loginUser } from '../api/login'
import { saveAccessToken } from '../authStorage'

type LoginModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Вызывается после успешного входа и сохранения токена. */
  onLoginSuccess?: () => void
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const titleId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setError(null)
      setSuccess(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const data = await loginUser(email.trim(), password)
      saveAccessToken(data.access_token)
      setSuccess('Вход выполнен. Токен сохранён в браузере.')
      onLoginSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>
            Вход
          </h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            Email
            <input
              className="modal-input"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </label>

          <label className="modal-label">
            Пароль
            <input
              className="modal-input"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </label>

          {error ? (
            <p className="modal-message modal-message-error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="modal-message modal-message-success" role="status">
              {success}
            </p>
          ) : null}

          <div className="modal-actions">
            <button className="modal-button modal-button-secondary" type="button" onClick={onClose}>
              Отмена
            </button>
            <button className="modal-button modal-button-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Вход…' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
