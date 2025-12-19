import { useState } from "react";
import { X, Link as LinkIcon } from "lucide-react";
import styles from "./SubmitPostModal.module.css";
import type { SubmitPostModalProps } from "../../types";

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

const validateSubmission = (
  title: string,
  url: string,
  text: string,
): string => {
  if (!title.trim()) return "Title is required";
  if (title.trim().length < 3) return "Title must be at least 3 characters";
  if (!url.trim() && !text.trim()) return "Please provide either a URL or text";
  if (url.trim() && !isValidUrl(url)) return "Please enter a valid URL";
  return "";
};

const savePost = (
  editingPost: SubmitPostModalProps["editingPost"],
  title: string,
  url: string,
  text: string,
  username: string,
) => {
  const posts = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("newPosts") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  })();

  if (editingPost) {
    const index = posts.findIndex(
      (p: { id: number }) => p.id === editingPost.id,
    );
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        title,
        url: url || null,
        text: text || null,
      };
    }
  } else {
    posts.push({
      id: Date.now(),
      title,
      url: url || null,
      text: text || null,
      by: username || "anonymous",
      score: 1,
      time: Math.floor(Date.now() / 1000),
      descendants: 0,
      type: "story" as const,
    });
  }

  localStorage.setItem("newPosts", JSON.stringify(posts));
};

export default function SubmitPostModal({
  onClose,
  editingPost,
  onEditComplete,
  username,
}: SubmitPostModalProps) {
  const [title, setTitle] = useState(editingPost?.title || "");
  const [url, setUrl] = useState(editingPost?.url || "");
  const [text, setText] = useState(editingPost?.text || "");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateSubmission(title, url, text);
    if (validationError) {
      setError(validationError);
      return;
    }

    savePost(editingPost, title, url, text, username || "anonymous");
    setSubmitted(true);
    setTimeout(() => {
      onEditComplete?.();
      onClose();
    }, 1500);
  };

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.success}>
            <p className={styles.successText}>
              {editingPost
                ? "Post updated successfully!"
                : "Post submitted successfully!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {editingPost ? "Edit Post" : "Submit Post"}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="close-submit-modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Enter post title"
              data-testid="submit-title"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="url" className={styles.label}>
              URL (optional)
            </label>
            <div className={styles.inputWrapper}>
              <LinkIcon
                size={16}
                className={styles.inputIcon}
                aria-hidden="true"
              />
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={styles.input}
                placeholder="https://example.com"
                data-testid="submit-url"
              />
            </div>
            <p className={styles.helperText}>
              Leave URL blank to submit a question for discussion. If there is
              no URL, text will appear at the top of the thread. If there is a
              URL, text is optional.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="text" className={styles.label}>
              Text (optional)
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.textarea}
              placeholder="Or write your own story"
              data-testid="submit-text"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            data-testid="submit-post"
          >
            {editingPost ? "Update" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
