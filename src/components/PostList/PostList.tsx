import { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { useHackerNews } from "../../hooks";
import PostCard from "../PostCard/PostCard";
import styles from "./PostList.module.css";
import type { HackerNewsStory, FeedType, PostListProps } from "../../types";

const STORIES_PER_PAGE = 30;
const MAX_SEARCH_RESULTS = 300;

const FEED_INFO: Record<FeedType, { icon: LucideIcon; label: string }> = {
  top: { icon: Flame, label: "Top" },
  new: { icon: Clock, label: "New" },
  ask: { icon: MessageCircleQuestion, label: "Ask" },
  show: { icon: Star, label: "Show" },
  job: { icon: Briefcase, label: "Jobs" },
};

export default function PostList({
  feedType,
  onChangeFeedType,
  viewMode,
  onChangeViewMode,
  onEditPost,
  searchQuery = "",
  isLoggedIn,
  username,
}: PostListProps) {
  const [page, setPage] = useState(1);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<HackerNewsStory[]>([]);
  const [searchLoadedPages, setSearchLoadedPages] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const FeedIcon = FEED_INFO[feedType].icon;

  const isSearchActive = searchQuery.trim() !== "";
  const pageToFetch = isSearchActive ? searchLoadedPages + 1 : page;

  const {
    stories: apiStories,
    isLoading,
    error,
    totalPages,
  } = useHackerNews({ feedType, page: pageToFetch });

  const displayStories = isSearchActive ? searchResults : apiStories;
  const currentPage = isSearchActive ? searchCurrentPage : page;
  const currentTotalPages = isSearchActive
    ? Math.ceil(searchResults.length / STORIES_PER_PAGE)
    : totalPages;
  const paginatedStories = isSearchActive
    ? displayStories.slice(
      (currentPage - 1) * STORIES_PER_PAGE,
      currentPage * STORIES_PER_PAGE,
    )
    : displayStories;

  const userPostIds = new Set(
    (() => {
      void refresh;
      try {
        const posts = JSON.parse(
          localStorage.getItem("newPosts") || "[]",
        ) as HackerNewsStory[];
        return posts
          .filter((p: HackerNewsStory) => p && p.id)
          .map((p: HackerNewsStory) => p.id);
      } catch (error) {
        console.error("Error parsing user posts:", error);
        return [];
      }
    })(),
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchCurrentPage(1);
      setSearchResults([]);
      setSearchLoadedPages(0);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (
      searchQuery.trim() &&
      apiStories.length > 0 &&
      searchLoadedPages < totalPages &&
      searchResults.length < MAX_SEARCH_RESULTS
    ) {
      setSearchResults((prev) => {
        const newResults = [...prev, ...apiStories];
        return newResults.filter((story) =>
          story.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      });
      setSearchLoadedPages((prev) => prev + 1);
    }
  }, [apiStories, searchQuery, totalPages, searchLoadedPages, searchResults]);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  useEffect(() => {
    if (isSearchActive) {
      setSearchResults([]);
      setSearchLoadedPages(0);
    }
  }, [refresh, isSearchActive]);

  const feedChange = (newFeedType: FeedType) => {
    setPage(1);
    setSearchCurrentPage(1);
    onChangeFeedType(newFeedType);
  };

  const deletePost = useCallback((postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const newPosts = JSON.parse(
          localStorage.getItem("newPosts") || "[]",
        ) as HackerNewsStory[];
        const filtered = newPosts.filter(
          (p: HackerNewsStory) => p && p.id !== postId,
        );
        localStorage.setItem("newPosts", JSON.stringify(filtered));
        setRefresh((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  }, []);

  const setCurrentPage = (newPage: number) => {
    if (isSearchActive) {
      setSearchCurrentPage(newPage);
    } else {
      setPage(newPage);
    }
  };

  return (
    <section className={styles.wrap} ref={sectionRef}>
      <div className={styles.topbar}>
        <div className={styles.pickerWrapper}>
          <Select.Root
            value={feedType}
            onValueChange={(v) => feedChange(v as FeedType)}
          >
            <Select.Trigger
              className={styles.pickerDisplay}
              aria-label="Choose feed"
              title="Change feed"
            >
              <span className={styles.pickerIcon}>
                <FeedIcon size={16} aria-hidden="true" />
              </span>
              <Select.Value className={styles.pickerText} />
              <span className={styles.chev} aria-hidden="true">
                <ChevronDown size={16} />
              </span>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className={styles.dropdown} position="popper">
                <Select.Viewport>
                  {Object.entries(FEED_INFO).map(
                    ([value, { icon: Icon, label }]) => {
                      return (
                        <Select.Item
                          key={value}
                          value={value}
                          className={styles.dropdownItem}
                        >
                          <span
                            className={styles.dropdownItemIcon}
                            aria-hidden="true"
                          >
                            <Icon size={16} />
                          </span>
                          <Select.ItemText>{label}</Select.ItemText>
                        </Select.Item>
                      );
                    },
                  )}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className={styles.viewToggle} role="group" aria-label="View mode">
          <button
            type="button"
            className={styles.viewBtn}
            aria-pressed={viewMode === "list"}
            aria-label="Switch to list view"
            onClick={() => onChangeViewMode("list")}
            data-testid="view-list"
            title="Switch to list view"
          >
            <List size={18} />
          </button>

          <button
            type="button"
            className={styles.viewBtn}
            aria-pressed={viewMode === "grid"}
            aria-label="Switch to grid view"
            onClick={() => onChangeViewMode("grid")}
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
          <p>{searchQuery.trim() ? "Searching..." : "Loading stories..."}</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>Failed to load stories. Please try again.</p>
          <button
            onClick={() => {
              feedChange(feedType);
              setCurrentPage(1);
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
                rank={(currentPage - 1) * STORIES_PER_PAGE + index + 1}
                isUserPost={userPostIds.has(story.id)}
                isLoggedIn={isLoggedIn}
                username={username}
                onEdit={onEditPost}
                onDelete={deletePost}
              />
            ))}
          </div>

          {currentTotalPages > 1 && (
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
                onClick={() =>
                  setCurrentPage(Math.min(currentTotalPages, currentPage + 1))
                }
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

      {!isLoading &&
        !error &&
        displayStories.length > 0 &&
        paginatedStories.length === 0 && (
          <div className={styles.empty}>
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}
    </section>
  );
}
