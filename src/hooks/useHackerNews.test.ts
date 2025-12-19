import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useHackerNews } from "./useHackerNews";
import * as hackerNewsApi from "../services";
import { QueryProvider } from "../providers";
import type { HackerNewsStory } from "../types";

vi.mock("../services/hackerNewsApi");

const createMockStory = (
  id: number,
  overrides?: Partial<HackerNewsStory>,
): HackerNewsStory => ({
  id,
  title: `Story ${id}`,
  by: `user${id}`,
  score: id * 10,
  time: id * 1000,
  type: "story" as const,
  descendants: id - 1,
  ...overrides,
});

const mockStories = [createMockStory(1), createMockStory(2)];

const setupMocks = (storyIds: number[], stories: HackerNewsStory[]) => {
  vi.spyOn(hackerNewsApi, "fetchStoryIds").mockResolvedValue(storyIds);
  vi.spyOn(hackerNewsApi, "fetchStories").mockResolvedValue(stories);
};

describe("useHackerNews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it("should fetch and display stories", async () => {
    setupMocks([1, 2], mockStories);
    const { result } = renderHook(
      () => useHackerNews({ feedType: "top", page: 1 }),
      {
        wrapper: QueryProvider,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stories).toHaveLength(2);
    expect(result.current.totalStories).toBe(2);
  });

  it("should merge user posts with API stories on new feed", async () => {
    const userPost = createMockStory(999, { by: "testuser", time: 3000 });
    localStorage.setItem("newPosts", JSON.stringify([userPost]));

    setupMocks([1, 2], mockStories);
    const { result } = renderHook(
      () => useHackerNews({ feedType: "new", page: 1 }),
      {
        wrapper: QueryProvider,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stories).toHaveLength(3);
    expect(result.current.stories[0].id).toBe(999);
    expect(result.current.totalStories).toBe(3);
  });

  it("should handle API errors", async () => {
    vi.spyOn(hackerNewsApi, "fetchStoryIds").mockRejectedValue(
      new Error("API Error"),
    );
    vi.spyOn(hackerNewsApi, "fetchStories").mockResolvedValue([]);

    const { result } = renderHook(
      () => useHackerNews({ feedType: "top", page: 1 }),
      {
        wrapper: QueryProvider,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
  });

  it("should handle localStorage errors", async () => {
    localStorage.setItem("newPosts", "invalid json");
    setupMocks([1, 2], mockStories);

    const { result } = renderHook(
      () => useHackerNews({ feedType: "new", page: 1 }),
      {
        wrapper: QueryProvider,
      },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stories).toHaveLength(2);
  });
});
