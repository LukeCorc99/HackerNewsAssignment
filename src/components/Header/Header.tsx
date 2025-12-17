import { SquarePen, UserRound, ChevronDown, LogIn, UserPlus, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import styles from './Header.module.css'

type HeaderProps = {
  onLogin: (action: 'login' | 'register') => void
  onSubmit: () => void
  isLoggedIn: boolean
  onLogout: () => void
  onSearch: (query: string) => void
  onSearchSubmit?: (query: string) => void
}

export default function Header({ onLogin, onSubmit, isLoggedIn, onLogout, onSearch, onSearchSubmit }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [logoutFeedback, setLogoutFeedback] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDropdownAction = (action: 'login' | 'register') => {
    onLogin(action)
    setIsDropdownOpen(false)
  }

  const handleLogout = () => {
    setLogoutFeedback(true)
    setTimeout(() => {
      setLogoutFeedback(false)
      onLogout()
    }, 1000)
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery)
      } else {
        onSearch(searchQuery)
      }
      setSearchQuery('')
    }
  }

  return (
    <header className={styles.header}>
      <div>
        <button
          type="button"
          className={styles.brand}
          onClick={() => {
            sessionStorage.setItem('selectedFeedType', 'top')
            window.location.href = '/'
          }}
          aria-label="Go to homepage"
        >
          <span className={styles.logo} aria-hidden="true">
            Y
          </span>
          <span className={styles.title}>Hacker News</span>
        </button>
      </div>
      
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search posts..."
          className={styles.searchInput}
          aria-label="Search posts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit()
            }
          }}
        />
      </div>

      <div className={styles.actions} aria-label="User actions">
        <button
          type="button"
          className={styles.actionBtn}
          aria-label="Submit post"
          onClick={onSubmit}
          data-testid="submit"
        >
          <SquarePen size={18} aria-hidden="true" />
          <span className={styles.actionText}>Submit Post</span>
        </button>

        <div className={styles.userMenuContainer} ref={dropdownRef}>
          <button
            type="button"
            className={styles.userBtn}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            data-testid="user-menu"
          >
            <UserRound size={18} aria-hidden="true" />
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={isDropdownOpen ? styles.chevronOpen : styles.chevronClosed}
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown} role="menu">
              {isLoggedIn ? (
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                  data-testid="dropdown-logout"
                  role="menuitem"
                  style={{ opacity: logoutFeedback ? 0.5 : 1, transition: 'opacity 300ms ease' }}
                >
                  <LogIn size={16} style={{ transform: 'scaleX(-1)' }} />
                  {logoutFeedback ? 'Logging out...' : 'Log out'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => handleDropdownAction('login')}
                    data-testid="dropdown-login"
                    role="menuitem"
                  >
                    <LogIn size={16} />
                    Log in
                  </button>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => handleDropdownAction('register')}
                    data-testid="dropdown-register"
                    role="menuitem"
                  >
                    <UserPlus size={16} />
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header >
  )
}