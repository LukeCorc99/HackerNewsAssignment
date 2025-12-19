import {
  SquarePen,
  UserRound,
  ChevronDown,
  LogIn,
  UserPlus,
  Search,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { HeaderProps } from "../../types";
import styles from "./Header.module.css";


const SEARCH_PLACEHOLDER = "Search posts...";

export default function Header({
  onLogin,
  onSubmit,
  isLoggedIn,
  onLogout,
  onSearchSubmit,
  externalSearchQuery = "",
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const clickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);


  const dropdownAction = (action: "login" | "register") => {
    onLogin(action);
    setIsDropdownOpen(false);
  };

  const logOut = () => {
    setLogoutFeedback(true);
    setTimeout(() => {
      setLogoutFeedback(false);
      onLogout();
    }, 1000);
  };

  const searchSubmit = () => {
    if (searchQuery.trim()) {
      onSearchSubmit?.(searchQuery);
    } else {
      window.location.href = "/";
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchSubmit();
    }
  };

  const handleMobileSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchSubmit();
      setIsMobileSearchOpen(false);
    }
  };

  const SearchInput = ({
    onKeyDown,
  }: {
    onKeyDown: (e: React.KeyboardEvent) => void;
  }) => (
    <div className={styles.searchWrapper}>
      <Search size={16} className={styles.searchIcon} aria-hidden="true" />
      <input
        ref={searchInputRef}
        type="text"
        placeholder={SEARCH_PLACEHOLDER}
        className={styles.searchInput}
        aria-label="Search posts"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );

  return (
    <header className={styles.header}>
      <div>
        <button
          type="button"
          className={styles.brand}
          onClick={() => {
            sessionStorage.setItem("selectedFeedType", "top");
            window.location.href = "/";
          }}
          aria-label="Go to homepage"
          title="Go to homepage"
        >
          <span className={styles.logo} aria-hidden="true">
            Y
          </span>
          <span className={styles.title}>Hacker News</span>
        </button>
      </div>

      <SearchInput onKeyDown={handleSearchKeyDown} />

      <div className={styles.actions} aria-label="User actions">
        <button
          type="button"
          className={styles.mobileSearchBtn}
          aria-label="Toggle search"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          data-testid="mobile-search-toggle"
        >
          <Search size={18} aria-hidden="true" />
        </button>

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
            title="Open user menu"
          >
            <UserRound size={18} aria-hidden="true" />
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={
                isDropdownOpen ? styles.chevronOpen : styles.chevronClosed
              }
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown} role="menu">
              {isLoggedIn ? (
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${
                    logoutFeedback ? styles.loggingOut : ""
                  }`}
                  onClick={logOut}
                  data-testid="dropdown-logout"
                  role="menuitem"
                >
                  <LogIn size={16} className={styles.logoutIcon} />
                  {logoutFeedback ? "Logging out..." : "Log out"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => dropdownAction("login")}
                    data-testid="dropdown-login"
                    role="menuitem"
                  >
                    <LogIn size={16} />
                    Log in
                  </button>
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => dropdownAction("register")}
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

      {isMobileSearchOpen && (
        <div className={styles.mobileSearchDropdown}>
          <SearchInput onKeyDown={handleMobileSearchKeyDown} />
        </div>
      )}
    </header>
  );
}