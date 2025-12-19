import type { FeedType, HackerNewsStory } from "../types";

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

const getEndpoint = (type: FeedType): string => {
  const map: Record<FeedType, string> = {
    top: "topstories",
    new: "newstories",
    ask: "askstories",
    show: "showstories",
    job: "jobstories",
  };
  return map[type];
};

const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
};

export const fetchStoryIds = (type: FeedType): Promise<number[]> =>
  fetchJson(
    `${BASE_URL}/${getEndpoint(type)}.json`,
    `Failed to fetch ${type} stories`,
  );

export const fetchStory = (id: number): Promise<HackerNewsStory> =>
  fetchJson(`${BASE_URL}/item/${id}.json`, `Failed to fetch story ${id}`);

export const fetchStories = async (
  ids: number[],
): Promise<HackerNewsStory[]> => {
  const results = await Promise.allSettled(ids.map(fetchStory));
  return results
    .filter(
      (r): r is PromiseFulfilledResult<HackerNewsStory> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);
};
