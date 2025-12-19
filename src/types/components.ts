import type { HackerNewsStory } from "./story";
import type { FeedType, ViewMode } from "./feed";

export interface HeaderProps {
  onLogin: (action: "login" | "register") => void;
  onSubmit: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onSearchSubmit?: (query: string) => void;
  externalSearchQuery?: string;
}

export interface PostCardProps {
  story: HackerNewsStory;
  viewMode: ViewMode;
  rank: number;
  isUserPost?: boolean;
  isLoggedIn?: boolean;
  username?: string;
  onEdit?: (post: HackerNewsStory) => void;
  onDelete?: (postId: number) => void;
}

export interface PostListProps {
  feedType: FeedType;
  onChangeFeedType: (next: FeedType) => void;
  viewMode: ViewMode;
  onChangeViewMode: (next: ViewMode) => void;
  onEditPost?: (post: HackerNewsStory) => void;
  searchQuery?: string;
  isLoggedIn: boolean;
  username: string;
}
