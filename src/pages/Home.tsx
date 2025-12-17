import { useState, useEffect } from 'react'
import { QueryProvider } from '../providers/QueryProvider'
import { Header } from '../components/Header'
import { PostList } from '../components/PostList'
import type { FeedType, ViewMode } from '../components/PostList'
import { AuthModal } from '../components/AuthModal'
import { SubmitPostModal } from '../components/SubmitPostModal'
import { useHackerNews } from '../hooks/useHackerNews'
import type { HackerNewsStory } from '../types/story'

type AuthAction = 'login' | 'register' | null

function HomeContent() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        try {
            const saved = localStorage.getItem('isLoggedIn')
            return saved === 'true'
        } catch {
            return false
        }
    })
    const [username, setUsername] = useState(() => {
        try {
            return localStorage.getItem('username') || ''
        } catch {
            return ''
        }
    })
    const [authAction, setAuthAction] = useState<AuthAction>(null)
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
    const [feedType, setFeedType] = useState<FeedType>(() => {
        try {
            const saved = sessionStorage.getItem('selectedFeedType')
            return (saved as FeedType) || 'top'
        } catch {
            return 'top'
        }
    })
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        try {
            const saved = localStorage.getItem('selectedViewMode')
            return (saved as ViewMode) || 'list'
        } catch {
            return 'list'
        }
    })
    const [shouldOpenSubmitAfterLogin, setShouldOpenSubmitAfterLogin] = useState(false)
    const [editingPost, setEditingPost] = useState<HackerNewsStory | null>(null)

    const { stories } = useHackerNews({ feedType, page: 1 })
    
    useEffect(() => {
        try {
            sessionStorage.setItem('selectedFeedType', feedType)
        } catch (error) {
            console.error('Error saving feedType:', error)
        }
    }, [feedType])
    
    useEffect(() => {
        try {
            localStorage.setItem('isLoggedIn', isLoggedIn.toString())
        } catch (error) {
            console.error('Error saving login state:', error)
        }
    }, [isLoggedIn])
    
    useEffect(() => {
        try {
            localStorage.setItem('selectedViewMode', viewMode)
        } catch (error) {
            console.error('Error saving viewMode:', error)
        }
    }, [viewMode])

    const handleSearch = (query: string) => {
        if (query.trim() === '') {
            return stories
        } else {
            return stories.filter(story =>
                story.title.toLowerCase().includes(query.toLowerCase())
            )
        }
    }

    const handleSearchSubmit = () => {
        setFeedType('top')
    }

    const handleLogin = (action: 'login' | 'register') => {
        setAuthAction(action)
        setShouldOpenSubmitAfterLogin(false)
    }

    const handleSubmit = () => {
        if (!isLoggedIn) {
            setShouldOpenSubmitAfterLogin(true)
            setAuthAction('login')
            return
        }
        setIsSubmitModalOpen(true)
    }

    const handleCloseAuth = () => {
        setAuthAction(null)
    }

    const handleCloseSubmit = () => {
        setIsSubmitModalOpen(false)
        setEditingPost(null)
    }

    const handleAuthSuccess = () => {
        setIsLoggedIn(true)
        setAuthAction(null)
        try {
            const storedUsername = localStorage.getItem('username') || ''
            setUsername(storedUsername)
        } catch (error) {
            console.error('Error retrieving username:', error)
        }
        if (shouldOpenSubmitAfterLogin) {
            setIsSubmitModalOpen(true)
            setShouldOpenSubmitAfterLogin(false)
        }
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
    }

    const handleEditPost = (post: HackerNewsStory) => {
        setEditingPost(post)
        setIsSubmitModalOpen(true)
    }

    const handleEditComplete = () => {
        setEditingPost(null)
    }

    return (
        <>
            <Header
                onLogin={handleLogin}
                onSubmit={handleSubmit}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                onSearch={handleSearch}
                onSearchSubmit={handleSearchSubmit}
            />
            <PostList
                feedType={feedType}
                viewMode={viewMode}
                onChangeFeedType={setFeedType}
                onChangeViewMode={setViewMode}
                onEditPost={handleEditPost}
            />
            {authAction && (
                <AuthModal action={authAction} onClose={handleCloseAuth} onSuccess={handleAuthSuccess} />
            )}
            {isSubmitModalOpen && (
                <SubmitPostModal
                    onClose={handleCloseSubmit}
                    editingPost={editingPost}
                    onEditComplete={handleEditComplete}
                    username={username}
                />
            )}
        </>
    )
}

export default function Home() {
    return (
        <QueryProvider>
            <HomeContent />
        </QueryProvider>
    )
}