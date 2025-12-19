import { useQuery } from "@tanstack/react-query";
import { fetchStoryIds, fetchStories } from "../services";
import type { FeedType, HackerNewsStory, UseHackerNewsOptions } from "../types";

const STORIES_PER_PAGE = 30;

const getUserNewPosts = (): HackerNewsStory[] => {
  try {
    const posts = JSON.parse(
      localStorage.getItem("newPosts") || "[]",
    ) as HackerNewsStory[];
    return posts
      .filter((post: HackerNewsStory) => post?.id && post?.title)
      .sort((a, b) => b.time - a.time);
  } catch (error) {
    console.error("Error parsing localStorage posts:", error);
    return [];
  }
};

const filterAndSortStories = (stories: HackerNewsStory[]): HackerNewsStory[] =>
  stories.filter((s) => s?.id).sort((a, b) => b.time - a.time);

const mergeStories = (
  feedType: FeedType,
  userPosts: HackerNewsStory[],
  apiStories: HackerNewsStory[],
): HackerNewsStory[] =>
  feedType === "new"
    ? filterAndSortStories([...userPosts, ...apiStories])
    : apiStories.filter((s) => s?.id);

export function useHackerNews({ feedType, page }: UseHackerNewsOptions) {
  const {
    data: storyIds = [],
    isLoading: isLoadingIds,
    error: idsError,
  } = useQuery({
    queryKey: ["storyIds", feedType],
    queryFn: () => fetchStoryIds(feedType),
  });

  const {
    data: allStories = [],
    isLoading: isLoadingStories,
    error: storiesError,
  } = useQuery<HackerNewsStory[]>({
    queryKey: ["allStories", feedType],
    queryFn: () => fetchStories(storyIds),
    enabled: storyIds.length > 0,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });

  const userNewPosts = getUserNewPosts();
  const allStoriesSorted = mergeStories(feedType, userNewPosts, allStories);
  const paginatedStories = allStoriesSorted.slice(
    (page - 1) * STORIES_PER_PAGE,
    page * STORIES_PER_PAGE,
  );

  return {
    stories: paginatedStories,
    isLoading: isLoadingIds || isLoadingStories,
    error: idsError || storiesError,
    totalStories: allStoriesSorted.length,
    totalPages: Math.ceil(allStoriesSorted.length / STORIES_PER_PAGE),
  };
}
