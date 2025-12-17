import { useState } from 'react'
import { X, LogIn, UserPlus } from 'lucide-react'
import styles from './AuthModal.module.css'

type AuthModalProps = {
  action: 'login' | 'register'
  onClose: () => void
  onSuccess: (action: 'login' | 'register') => void
}

export default function AuthModal({ action, onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (action === 'register' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (action === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSubmitted(true)
    try {
      localStorage.setItem('username', username)
    } catch (error) {
      console.error('Error saving username:', error)
    }
    setTimeout(() => {
      onSuccess(action)
    }, 1500)
  }

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.success}>
            <p className={styles.successText}>
              {action === 'login'
                ? 'Successfully logged in!'
                : 'Account created successfully!'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {action === 'login' ? 'Login' : 'Create Account'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="close-auth-modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Enter your username"
              data-testid="auth-username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              data-testid="auth-password"
            />
          </div>

          {action === 'register' && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="Confirm your password"
                data-testid="auth-confirm-password"
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn} data-testid="auth-submit">
            {action === 'login' ? (
              <>
                <LogIn size={18} />
                Login
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}