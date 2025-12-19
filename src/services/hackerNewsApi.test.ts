import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchStoryIds, fetchStory, fetchStories } from "./hackerNewsApi";
import type { HackerNewsStory } from "../types";

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

type MockFetchResponse = { ok: boolean; data?: unknown; status?: number };

const createMockResponse = (response: MockFetchResponse) => ({
  ok: response.ok,
  ...(response.ok && { json: () => Promise.resolve(response.data) }),
  ...(!response.ok && { status: response.status ?? 500 }),
});

const stubFetch = (responses: MockFetchResponse[]) => {
  const mockFn = vi.fn();
  responses.forEach((r) => mockFn.mockResolvedValueOnce(createMockResponse(r)));
  vi.stubGlobal("fetch", mockFn as unknown as typeof fetch);
};

const mockStory = (
  id: number,
  overrides?: Partial<HackerNewsStory>,
): HackerNewsStory => ({
  id,
  title: `Story ${id}`,
  by: "user",
  score: id,
  time: id,
  type: "story",
  ...overrides,
});

describe("hackerNewsApi", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  describe("fetchStoryIds", () => {
    it("should fetch top story IDs", async () => {
      stubFetch([{ ok: true, data: [1, 2, 3] }]);
      const ids = await fetchStoryIds("top");
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/topstories.json`);
      expect(ids).toEqual([1, 2, 3]);
    });

    it("should fetch new story IDs", async () => {
      stubFetch([{ ok: true, data: [1, 2, 3] }]);
      const ids = await fetchStoryIds("new");
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/newstories.json`);
      expect(ids).toEqual([1, 2, 3]);
    });

    it("should handle empty story ID array", async () => {
      stubFetch([{ ok: true, data: [] }]);
      const ids = await fetchStoryIds("top");
      expect(ids).toEqual([]);
    });

    it("should throw error on failed fetch", async () => {
      stubFetch([{ ok: false, status: 500 }]);
      await expect(fetchStoryIds("top")).rejects.toThrow(
        "Failed to fetch top stories",
      );
    });
  });

  describe("fetchStory", () => {
    it("should fetch a single story by ID", async () => {
      const story = mockStory(8863, {
        by: "dhouston",
        descendants: 71,
        title: "My YC app: Dropbox - Throw away your USB drive",
        url: "http://www.getdropbox.com/u/2/screencast.html",
      });
      stubFetch([{ ok: true, data: story }]);
      const result = await fetchStory(8863);
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/item/8863.json`);
      expect(result).toEqual(story);
    });

    it("should throw error when story fetch fails", async () => {
      stubFetch([{ ok: false, status: 404 }]);
      await expect(fetchStory(999)).rejects.toThrow(
        "Failed to fetch story 999",
      );
    });
  });

  describe("fetchStories", () => {
    it("should fetch multiple stories in parallel", async () => {
      const stories = [mockStory(1), mockStory(2)];
      stubFetch([
        { ok: true, data: stories[0] },
        { ok: true, data: stories[1] },
      ]);
      const result = await fetchStories([1, 2]);
      expect(result).toEqual(stories);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should handle empty story ID array", async () => {
      vi.stubGlobal("fetch", vi.fn() as unknown as typeof fetch);
      const stories = await fetchStories([]);
      expect(stories).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should return only successful stories if some fail", async () => {
      const story = mockStory(1);
      stubFetch([
        { ok: true, data: story },
        { ok: false, status: 500 },
      ]);
      const stories = await fetchStories([1, 2]);
      expect(stories).toEqual([story]);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
