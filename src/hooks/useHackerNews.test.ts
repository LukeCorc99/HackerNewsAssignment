import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useHackerNews } from './useHackerNews'
import * as hackerNewsApi from '../services/hackerNewsApi'
import { QueryProvider } from '../providers/QueryProvider'
import type { HackerNewsStory } from '../types/story'

vi.mock('../services/hackerNewsApi')

const mockStories: HackerNewsStory[] = [
  {
    id: 1,
    title: 'Story 1',
    by: 'user1',
    score: 10,
    time: 1000,
    type: 'story' as const,
    descendants: 0,
  },
  {
    id: 2,
    title: 'Story 2',
    by: 'user2',
    score: 20,
    time: 2000,
    type: 'story' as const,
    descendants: 1,
  },
]

describe('useHackerNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    localStorage.clear()
  })

  it('should fetch and display stories', async () => {
    vi.spyOn(hackerNewsApi, 'fetchStoryIds').mockResolvedValue([1, 2])
    vi.spyOn(hackerNewsApi, 'fetchStories').mockResolvedValue(mockStories)

    const { result } = renderHook(() => useHackerNews({ feedType: 'top', page: 1 }), {
      wrapper: QueryProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stories).toHaveLength(2)
    expect(result.current.totalStories).toBe(2)
  })

  it('should merge user posts with API stories on new feed', async () => {
    const userPost: HackerNewsStory = {
      id: 999,
      title: 'User Post',
      by: 'testuser',
      score: 1,
      time: 3000,
      type: 'story' as const,
      descendants: 0,
    }

    localStorage.setItem('newPosts', JSON.stringify([userPost]))

    vi.spyOn(hackerNewsApi, 'fetchStoryIds').mockResolvedValue([1, 2])
    vi.spyOn(hackerNewsApi, 'fetchStories').mockResolvedValue(mockStories)

    const { result } = renderHook(() => useHackerNews({ feedType: 'new', page: 1 }), {
      wrapper: QueryProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stories).toHaveLength(3)
    expect(result.current.stories[0].id).toBe(999)
    expect(result.current.totalStories).toBe(3)
  })

  it('should handle API errors gracefully', async () => {
    vi.spyOn(hackerNewsApi, 'fetchStoryIds').mockRejectedValue(
      new Error('API Error')
    )
    vi.spyOn(hackerNewsApi, 'fetchStories').mockResolvedValue([])

    const { result } = renderHook(() => useHackerNews({ feedType: 'top', page: 1 }), {
      wrapper: QueryProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should handle localStorage errors gracefully', async () => {
    localStorage.setItem('newPosts', 'invalid json')

    vi.spyOn(hackerNewsApi, 'fetchStoryIds').mockResolvedValue([1, 2])
    vi.spyOn(hackerNewsApi, 'fetchStories').mockResolvedValue(mockStories)

    const { result } = renderHook(() => useHackerNews({ feedType: 'new', page: 1 }), {
      wrapper: QueryProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stories).toHaveLength(2)
  })
})