import { useState } from "react";
import { X, LogIn, UserPlus } from "lucide-react";
import styles from "./AuthModal.module.css";
import type { AuthModalProps } from "../../types";


const MIN_PASSWORD_LENGTH = 6;

const validateForm = (
  username: string,
  password: string,
  confirmPassword: string,
  action: "login" | "register"
): string => {
  if (!username.trim()) return "Username is required";
  if (!password) return "Password is required";
  if (action === "register" && password !== confirmPassword)
    return "Passwords do not match";
  if (action === "register" && password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return "";
};


export default function AuthModal({
  action,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isLogin = action === "login";
  const successMessage = isLogin
    ? "Successfully logged in!"
    : "Account created successfully!";
  const title = isLogin ? "Login" : "Create Account";
  const submitLabel = isLogin ? "Login" : "Create Account";
  const submitIcon = isLogin ? <LogIn size={18} /> : <UserPlus size={18} />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(
      username,
      password,
      confirmPassword,
      action
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitted(true);
    try {
      localStorage.setItem("username", username);
    } catch (error) {
      console.error("Error saving username:", error);
    }
    setTimeout(() => {
      onSuccess(action);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.success}>
            <p className={styles.successText}>{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
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

        <form onSubmit={submit} className={styles.form}>
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

          {!isLogin && (
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

          <button
            type="submit"
            className={styles.submitBtn}
            data-testid="auth-submit"
          >
            {submitIcon}
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}