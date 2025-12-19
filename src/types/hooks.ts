import type { FeedType } from "./feed";
import type { HackerNewsStory } from "./story";

export interface UseHackerNewsOptions {
  feedType: FeedType;
  page: number;
}

export interface UseHackerNewsReturn {
  stories: HackerNewsStory[];
  isLoading: boolean;
  error: Error | null;
  totalStories: number;
  totalPages: number;
}
