import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchStoryIds, fetchStory, fetchStories } from './hackerNewsApi'
import type { HackerNewsStory } from '../types/story'

const BASE_URL = 'https://hacker-news.firebaseio.com/v0'

type MockFetchResponse = { ok: boolean; data?: unknown; status?: number }

describe('hackerNewsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    const stubFetch = (responses: MockFetchResponse[]) => {
        const mockFn = vi.fn()

        responses.forEach((r) => {
            mockFn.mockResolvedValueOnce(
                r.ok
                    ? {
                        ok: true,
                        json: () => Promise.resolve(r.data)
                    }
                    : {
                        ok: false,
                        status: r.status ?? 500
                    }
            )
        })

        vi.stubGlobal('fetch', mockFn as unknown as typeof fetch)
    }


    describe('fetchStoryIds', () => {
        it('should fetch top story IDs', async () => {
            stubFetch([{ ok: true, data: [1, 2, 3] }])

            const ids = await fetchStoryIds('top')

            expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/topstories.json`)
            expect(ids).toEqual([1, 2, 3])
        })

        it('should fetch new story IDs', async () => {
            stubFetch([{ ok: true, data: [1, 2, 3] }])

            const ids = await fetchStoryIds('new')

            expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/newstories.json`)
            expect(ids).toEqual([1, 2, 3])
        })

        it('should handle empty story ID array', async () => {
            stubFetch([{ ok: true, data: [] }])

            const ids = await fetchStoryIds('top')

            expect(ids).toEqual([])
        })

        it('should throw error on failed fetch', async () => {
            stubFetch([{ ok: false, status: 500 }])

            await expect(fetchStoryIds('top')).rejects.toThrow('Failed to fetch top stories')
        })
    })

    describe('fetchStory', () => {
        it('should fetch a single story by ID', async () => {
            const mockStory = {
                id: 8863,
                by: 'dhouston',
                descendants: 71,
                score: 111,
                time: 1175714200,
                title: 'My YC app: Dropbox - Throw away your USB drive',
                type: 'story',
                url: 'http://www.getdropbox.com/u/2/screencast.html'
            }

            stubFetch([{ ok: true, data: mockStory }])

            const story = await fetchStory(8863)

            expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/8863.json`)
            expect(story).toEqual(mockStory)
        })

        it('should throw error when story fetch fails', async () => {
            stubFetch([{ ok: false, status: 404 }])

            await expect(fetchStory(999)).rejects.toThrow('Failed to fetch story 999')
        })
    })

    describe('fetchStories', () => {
        it('should fetch multiple stories in parallel', async () => {
            const mockStories = [
                { id: 1, title: 'Story 1', by: 'user1', score: 10, time: 123, type: 'story' },
                { id: 2, title: 'Story 2', by: 'user2', score: 20, time: 456, type: 'story' }
            ]

            stubFetch([
                { ok: true, data: mockStories[0] },
                { ok: true, data: mockStories[1] }
            ])

            const stories = await fetchStories([1, 2])

            expect(stories).toEqual(mockStories)
            expect(fetch).toHaveBeenCalledTimes(2)
        })

        it('should handle empty story ID array', async () => {
            vi.stubGlobal('fetch', vi.fn() as unknown as typeof fetch)

            const stories = await fetchStories([])

            expect(stories).toEqual([])
            expect(fetch).not.toHaveBeenCalled()
        })

        it('should return only successful stories if some fail', async () => {
            const mockStory = { id: 1, title: 'Story 1', by: 'user', score: 1, time: 1, type: 'story' }

            stubFetch([
                { ok: true, data: mockStory },
                { ok: false, status: 500 }
            ])

            const stories = await fetchStories([1, 2])

            expect(stories).toEqual([mockStory])
            expect(fetch).toHaveBeenCalledTimes(2)
        })

        it('preserves story order regardless of resolution timing', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn((url: string) => {
                    const id = Number(url.match(/item\/(\d+)\.json/)?.[1])
                    return Promise.resolve({
                        ok: true,
                        json: () =>
                            new Promise((r) =>
                                setTimeout(
                                    () => r({ id, title: `Story ${id}`, by: 'u', score: id, time: id, type: 'story' }),
                                    id === 2 ? 50 : 0
                                )
                            )
                    })
                }) as unknown as typeof fetch
            )

            const stories: HackerNewsStory[] = await fetchStories([1, 2, 3])
            expect(stories.map((s) => s.id)).toEqual([1, 2, 3])
        })
    })
})
