import {
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Clock,
  Trash2,
  Edit2,
} from "lucide-react";
import type { PostCardProps } from "../../types";
import styles from "./PostCard.module.css";

const getTimeAgo = (timestamp: number): string => {
  const now = Date.now() / 1000;
  const diffInSeconds = now - timestamp;

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getDomain = (url?: string): string | null => {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return null;
  }
};

export default function PostCard({
  story,
  viewMode,
  rank,
  isUserPost,
  isLoggedIn,
  onEdit,
  onDelete,
  username,
}: PostCardProps) {
  const formattedTime = getTimeAgo(story.time);
  const domain = getDomain(story.url);

  const websitePostUrl = `https://news.ycombinator.com/item?id=${story.id}`;
  const externalPostUrl = story.url || websitePostUrl;
  const userProfileUrl = `https://news.ycombinator.com/user?id=${story.by}`;

  const canEditPost = isUserPost && isLoggedIn && username === story.by;

  return (
    <article
      className={`${styles.card} ${styles[viewMode]}`}
      data-testid="post-card"
    >
      <div className={styles.rank}>{rank}</div>

      {domain && (
        <a
          href={externalPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.domain}
          aria-label={`Visit ${domain}`}
          title="Visit website"
        >
          <ExternalLink size={12} aria-hidden="true" />
          {domain}
        </a>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <a
            href={externalPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.title}
            aria-label={`Open post: ${story.title}`}
            title="Open post"
          >
            {story.title}
          </a>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaItemStatic}>
            <TrendingUp size={14} aria-hidden="true" />
            {story.score} points
          </span>

          <a
            href={userProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.metaItem}
            aria-label={`View profile for ${story.by}`}
            title="View user profile"
          >
            by {story.by}
          </a>

          <span className={styles.metaItemStatic}>
            <Clock size={14} aria-hidden="true" />
            {formattedTime}
          </span>

          {story.descendants !== undefined && (
            <a
              href={websitePostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.comments}
              aria-label={`View ${story.descendants} comments on this post`}
              title="View comments"
            >
              <MessageSquare size={14} aria-hidden="true" />
              {story.descendants} comments
            </a>
          )}

          {canEditPost && (
            <div className={styles.actions}>
              <button
                className={styles.metaItem}
                onClick={() => onEdit?.(story)}
                aria-label="Edit post"
                title="Edit post"
              >
                <Edit2 size={14} aria-hidden="true" />
                Edit
              </button>
              <button
                className={styles.metaItem}
                onClick={() => onDelete?.(story.id)}
                aria-label="Delete post"
                title="Delete post"
              >
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}