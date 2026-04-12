import { useEffect, useId, useState } from 'react'
import { registerUser } from '../api/register'

import { saveAccessToken } from '../authStorage'

type RegisterModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void // Добавим колбэк для успеха
}

export function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const titleId = useId()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [avatarId, setAvatarId] = useState(1)
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
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
      setUsername('')
      setAvatarId(1)
      setPassword('')
      setPasswordAgain('')
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

    if (password.length < 8) {
      setError('Пароль не короче 8 символов')
      return
    }
    if (password !== passwordAgain) {
      setError('Пароли не совпадают')
      return
    }

    setIsSubmitting(true)
    try {
      const { access_token } = await registerUser(email.trim(), username.trim(), avatarId, password)
      saveAccessToken(access_token)
      setSuccess('Аккаунт создан! Входим...')
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
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
            Регистрация
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
            Никнейм
            <input
              className="modal-input"
              type="text"
              name="username"
              required
              minLength={3}
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
            />
          </label>

          <div className="modal-label">
            Выберите персонажа
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {[1, 2, 3].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  style={{
                    padding: '10px',
                    border: avatarId === id ? '2px solid #ff7b00' : '1px solid #ccc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: avatarId === id ? '#fff5eb' : '#fff'
                  }}
                >
                  Персонаж {id}
                </button>
              ))}
            </div>
          </div>

          <label className="modal-label">
            Пароль
            <input
              className="modal-input"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </label>

          <label className="modal-label">
            Повтор пароля
            <input
              className="modal-input"
              type="password"
              name="passwordAgain"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordAgain}
              onChange={(ev) => setPasswordAgain(ev.target.value)}
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
              {isSubmitting ? 'Отправка…' : 'Создать аккаунт'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

  return (await res.json()) as RegisterResponse
}
