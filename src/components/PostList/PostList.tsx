import {
  LayoutGrid,
  List,
  Flame,
  Clock,
  MessageCircleQuestion,
  Star,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import * as Select from '@radix-ui/react-select'
import { useHackerNews } from '../../hooks/useHackerNews'
import PostCard from '../PostCard/PostCard'
import styles from './PostList.module.css'
import type { HackerNewsStory } from '../../types/story'

export type FeedType = 'top' | 'new' | 'ask' | 'show' | 'jobs'
export type ViewMode = 'list' | 'grid'

type PostListProps = {
  feedType: FeedType
  onChangeFeedType: (next: FeedType) => void
  viewMode: ViewMode
  onChangeViewMode: (next: ViewMode) => void
  onEditPost?: (post: HackerNewsStory) => void
  searchQuery?: string
}

const feedIconMap: Record<FeedType, LucideIcon> = {
  top: Flame,
  new: Clock,
  ask: MessageCircleQuestion,
  show: Star,
  jobs: Briefcase,
}

const feedLabelMap: Record<FeedType, string> = {
  top: 'Top',
  new: 'New',
  ask: 'Ask',
  show: 'Show',
  jobs: 'Jobs',
}

export default function PostList({
  feedType,
  onChangeFeedType,
  viewMode,
  onChangeViewMode,
  onEditPost,
  searchQuery = '',
}: PostListProps) {
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const [stories, setStories] = useState<HackerNewsStory[]>([])
  const [searchResults, setSearchResults] = useState<HackerNewsStory[]>([])
  const [searchFetchedPages, setSearchFetchedPages] = useState<number>(0)
  const sectionRef = useRef<HTMLElement>(null)
  const FeedIcon = feedIconMap[feedType]

  const { stories: apiStories, isLoading, error, totalPages } = useHackerNews({ 
    feedType, 
    page: searchQuery ? searchFetchedPages + 1 : page 
  })

  useEffect(() => {
    if (!searchQuery) {
      setStories(apiStories)
    }
  }, [apiStories, searchQuery])

  useEffect(() => {
    setSearchPage(1)
    setSearchResults([])
    setSearchFetchedPages(0)
    if (!searchQuery.trim()) {
      setPage(1)
    }
  }, [searchQuery, feedType])

  useEffect(() => {
    if (searchQuery.trim() && apiStories.length > 0 && searchFetchedPages < totalPages && searchResults.length < 300) {
      setSearchResults(prev => {
        const newResults = [...prev, ...apiStories]
        return newResults.filter(story =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setSearchFetchedPages(prev => prev + 1)
    }
  }, [apiStories, searchQuery, totalPages, searchFetchedPages, searchResults])

  const displayStories = searchQuery.trim() === '' ? stories : searchResults
  const currentPage = searchQuery.trim() === '' ? page : searchPage
  const currentTotalPages = searchQuery.trim() === '' ? totalPages : Math.ceil(searchResults.length / 30)

  const paginatedStories = displayStories.slice((currentPage - 1) * 30, currentPage * 30)

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  const handleFeedTypeChange = (newFeedType: FeedType) => {
    setPage(1)
    setSearchPage(1)
    onChangeFeedType(newFeedType)
  }

  const handleDeletePost = useCallback((postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const newPosts = JSON.parse(localStorage.getItem('newPosts') || '[]') as HackerNewsStory[]
        const filtered = newPosts.filter((p: HackerNewsStory) => p && p.id !== postId)
        localStorage.setItem('newPosts', JSON.stringify(filtered))
        setStories(prev => prev.filter(s => s.id !== postId))
      } catch (error) {
        console.error('Error deleting post:', error)
      }
    }
  }, [])

  const userPostIds = new Set(
    (() => {
      try {
        const posts = JSON.parse(localStorage.getItem('newPosts') || '[]') as HackerNewsStory[]
        return posts.filter((p: HackerNewsStory) => p && p.id).map((p: HackerNewsStory) => p.id)
      } catch (error) {
        console.error('Error parsing user posts:', error)
        return []
      }
    })()
  )

  const setCurrentPage = (newPage: number) => {
    if (searchQuery.trim()) {
      setSearchPage(newPage)
    } else {
      setPage(newPage)
    }
  }

  return (
    <section className={styles.wrap} ref={sectionRef}>
      <div className={styles.topbar}>
        <div className={styles.pickerWrapper}>
          <Select.Root
            value={feedType}
            onValueChange={(v) => handleFeedTypeChange(v as FeedType)}
          >
            <Select.Trigger className={styles.pickerDisplay} aria-label="Choose feed" title="Change feed">
              <span className={styles.pickerIcon}>
                <FeedIcon size={16} aria-hidden="true" />
              </span>
              <Select.Value className={styles.pickerText} style={{ fontFamily: 'inherit' }} />
              <span className={styles.chev} aria-hidden="true">
                <ChevronDown size={16} />
              </span>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className={styles.dropdown} position="popper">
                <Select.Viewport>
                  {Object.entries(feedLabelMap).map(([value, label]) => {
                    const Icon = feedIconMap[value as FeedType]
                    return (
                      <Select.Item key={value} value={value} className={styles.dropdownItem}>
                        <span className={styles.dropdownItemIcon} aria-hidden="true">
                          <Icon size={16} />
                        </span>
                        <Select.ItemText>{label}</Select.ItemText>
                      </Select.Item>
                    )
                  })}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className={styles.viewToggle} role="group" aria-label="View mode">
          <button
            type="button"
            className={styles.viewBtn}
            aria-pressed={viewMode === 'list'}
            aria-label="Switch to list view"
            onClick={() => onChangeViewMode('list')}
            data-testid="view-list"
            title="Switch to list view"
          >
            <List size={18} />
          </button>

          <button
            type="button"
            className={styles.viewBtn}
            aria-pressed={viewMode === 'grid'}
            aria-label="Switch to grid view"
            onClick={() => onChangeViewMode('grid')}
            data-testid="view-grid"
            title="Switch to grid view"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{searchQuery.trim() ? 'Searching...' : 'Loading stories...'}</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>Failed to load stories. Please try again.</p>
          <button 
            onClick={() => {
              handleFeedTypeChange(feedType)
              setCurrentPage(1)
            }} 
            className={styles.retryBtn}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && displayStories.length > 0 && (
        <>
          <div className={`${styles.posts} ${styles[viewMode]}`}>
            {paginatedStories.map((story, index) => (
              <PostCard
                key={story.id}
                story={story}
                viewMode={viewMode}
                rank={(currentPage - 1) * 30 + index + 1}
                isUserPost={userPostIds.has(story.id)}
                onEdit={onEditPost}
                onDelete={handleDeletePost}
              />
            ))}
          </div>

          {currentTotalPages > 1 && paginatedStories.length > 0 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span className={styles.pageInfo}>
                Page {currentPage} of {currentTotalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(currentTotalPages, currentPage + 1))}
                disabled={currentPage >= currentTotalPages}
                className={styles.paginationBtn}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !error && displayStories.length === 0 && (
        <div className={styles.empty}>
          <p>No stories found</p>
        </div>
      )}

      {!isLoading && !error && displayStories.length > 0 && paginatedStories.length === 0 && (
        <div className={styles.empty}>
          <p>No results found for "{searchQuery}"</p>
        </div>
      )}
    </section>
  )
}