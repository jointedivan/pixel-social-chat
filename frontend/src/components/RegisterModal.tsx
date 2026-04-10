import { useEffect, useId, useState } from 'react'
import { registerUser } from '../api/register'

type RegisterModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const titleId = useId()
  const [email, setEmail] = useState('')
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
      const user = await registerUser(email.trim(), password)
      setSuccess(`Аккаунт создан: ${user.email}`)
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
