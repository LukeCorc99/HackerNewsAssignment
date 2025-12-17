import { useState } from 'react'
import { X, Link as LinkIcon } from 'lucide-react'
import styles from './SubmitPostModal.module.css'

type SubmitPostModalProps = {
    onClose: () => void
    editingPost?: { id: number; title: string; url: string | null; text: string | null } | null
    onEditComplete?: () => void
}

export default function SubmitPostModal({ onClose, editingPost, onEditComplete }: SubmitPostModalProps) {
    const [title, setTitle] = useState(editingPost?.title || '')
    const [url, setUrl] = useState(editingPost?.url || '')
    const [text, setText] = useState(editingPost?.text || '')
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!title.trim()) {
            setError('Title is required')
            return
        }

        if (title.trim().length < 3) {
            setError('Title must be at least 3 characters')
            return
        }

        if (!url.trim() && !text.trim()) {
            setError('Please provide either a URL or text')
            return
        }

        if (url.trim() && !isValidUrl(url)) {
            setError('Please enter a valid URL')
            return
        }

        const newPosts = (() => {
            try {
                const posts = JSON.parse(localStorage.getItem('newPosts') || '[]')
                return Array.isArray(posts) ? posts : []
            } catch (error) {
                console.error('Error parsing localStorage posts:', error)
                return []
            }
        })()

        if (editingPost) {
            const index = newPosts.findIndex((p: { id: number }) => p.id === editingPost.id)
            if (index !== -1) {
                newPosts[index] = {
                    ...newPosts[index],
                    title,
                    url: url || null,
                    text: text || null,
                }
            }
        } else {
            // eslint-disable-next-line react-hooks/purity
            const postId = Date.now()
            // eslint-disable-next-line react-hooks/purity
            const postTime = Math.floor(Date.now() / 1000)
            const newPost = {
                id: postId,
                title,
                url: url || null,
                text: text || null,
                by: 'anonymous',
                score: 1,
                time: postTime,
                descendants: 0,
                type: 'story' as const,
            }
            newPosts.push(newPost)
        }

        localStorage.setItem('newPosts', JSON.stringify(newPosts))

        setSubmitted(true)
        setTimeout(() => {
            if (editingPost && onEditComplete) {
                onEditComplete()
            }
            onClose()
        }, 1500)
    }

    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString)
            return true
        } catch {
            return false
        }
    }

    if (submitted) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.success}>
                        <p className={styles.successText}>
                            {editingPost ? 'Post updated successfully!' : 'Post submitted successfully!'}
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
                    <h2 className={styles.title}>{editingPost ? 'Edit Post' : 'Submit'}</h2>
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

                <form onSubmit={handleSubmit} className={styles.form}>
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
                            <LinkIcon size={16} className={styles.inputIcon} aria-hidden="true" />
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
                            Leave URL blank to submit a question for discussion. If there is no URL, text will appear at the top of the thread. If there is a URL, text is optional.
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

                    <button type="submit" className={styles.submitBtn} data-testid="submit-post">
                        {editingPost ? 'Update' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    )
}