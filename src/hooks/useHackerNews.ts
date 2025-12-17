import { useQuery } from '@tanstack/react-query'
import { fetchStoryIds, fetchStories } from '../services/hackerNewsApi'
import type { FeedType } from '../components/PostList'
import type { HackerNewsStory } from '../types/story'

const STORIES_PER_PAGE = 30

type UseHackerNewsOptions = {
    feedType: FeedType
    page: number
}

export function useHackerNews({ feedType, page }: UseHackerNewsOptions) {
    const feedTypeMap: Record<FeedType, 'top' | 'new' | 'ask' | 'show' | 'job'> = {
        top: 'top',
        new: 'new',
        ask: 'ask',
        show: 'show',
        jobs: 'job',
    }
    const apiType = feedTypeMap[feedType]
    
    const {
        data: storyIds = [],
        isLoading: isLoadingIds,
        error: idsError,
    } = useQuery({
        queryKey: ['storyIds', apiType],
        queryFn: () => fetchStoryIds(apiType),
    })

    const {
        data: allStories = [],
        isLoading: isLoadingStories,
        error: storiesError,
    } = useQuery<HackerNewsStory[]>({
        queryKey: ['allStories', apiType],
        queryFn: () => fetchStories(storyIds),
        enabled: storyIds.length > 0,
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 30,
    })

    const userNewPosts = feedType === 'new' ? (() => {
        try {
            const posts = JSON.parse(localStorage.getItem('newPosts') || '[]') as HackerNewsStory[]
            const validPosts = posts.filter((post: HackerNewsStory) => {
                return post && typeof post === 'object' && post.id && post.title
            })
            return validPosts.sort((a: HackerNewsStory, b: HackerNewsStory) => b.time - a.time)
        } catch (error) {
            console.error('Error parsing localStorage posts:', error)
            return []
        }
    })() : []

    const allStoriesSorted = feedType === 'new'
        ? [...userNewPosts, ...allStories].filter(s => s && s.id).sort((a, b) => b.time - a.time)
        : allStories.filter(s => s && s.id)

    const startPageIndex = (page - 1) * STORIES_PER_PAGE
    const endPageIndex = startPageIndex + STORIES_PER_PAGE
    const paginatedStories = allStoriesSorted.slice(startPageIndex, endPageIndex)

    const combinedStories = paginatedStories

    return {
        stories: combinedStories,
        isLoading: isLoadingIds || isLoadingStories,
        error: idsError || storiesError,
        totalStories: allStoriesSorted.length,
        totalPages: Math.ceil(allStoriesSorted.length / STORIES_PER_PAGE),
    }
}