import { useState, useEffect, useCallback } from "react";
import { QueryProvider } from "./providers";
import { Header, PostList, AuthModal, SubmitPostModal } from "./components";
import { useHackerNews } from "./hooks";
import type { FeedType, ViewMode, HackerNewsStory, AuthAction } from "./types";

const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  return useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultValue;
      const parsed = JSON.parse(saved);
      return parsed as T;
    } catch {
      return defaultValue;
    }
  });
};

const useSessionStorage = <T,>(key: string, defaultValue: T) => {
  return useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      if (!saved) return defaultValue;
      return saved as T;
    } catch {
      return defaultValue;
    }
  });
};

const usePersist = <T,>(
  key: string,
  value: T,
  storage: "local" | "session" = "local",
) => {
  useEffect(() => {
    try {
      const s = storage === "local" ? localStorage : sessionStorage;
      s.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, [value, key, storage]);
};

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("isLoggedIn", false);
  const [username, setUsername] = useLocalStorage("username", "");
  const [feedType, setFeedType] = useSessionStorage(
    "selectedFeedType",
    "top" as FeedType,
  );
  const [viewMode, setViewMode] = useLocalStorage(
    "selectedViewMode",
    "list" as ViewMode,
  );
  const [editingPost, setEditingPost] = useState<HackerNewsStory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modals, setModals] = useState({
    auth: null as AuthAction | null,
    submit: false,
  });
  const [shouldOpenSubmitAfterLogin, setOpenSubmitAfterLogin] = useState(false);

  useHackerNews({ feedType, page: 1 });
  usePersist("selectedViewMode", viewMode, "local");
  usePersist("selectedFeedType", feedType, "session");
  usePersist("isLoggedIn", isLoggedIn.toString(), "local");

  useEffect(() => {
    if (isLoggedIn) {
      try {
        const storedUsername = localStorage.getItem("username") || "";
        setUsername(storedUsername);
      } catch (error) {
        console.error("Error retrieving username:", error);
      }
    }
  }, [isLoggedIn, setUsername]);

  const toggleAuthModal = useCallback((action: AuthAction | null) => {
    setModals((m) => ({ ...m, auth: action }));
    if (action === null) {
      setOpenSubmitAfterLogin(false);
    }
  }, []);

  const toggleSubmitModal = useCallback((isOpen: boolean) => {
    setModals((m) => ({ ...m, submit: isOpen }));
    if (!isOpen) {
      setEditingPost(null);
    }
  }, []);

  const submitSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const changeFeedType = useCallback(
    (newFeedType: FeedType) => {
      setFeedType(newFeedType);
      setSearchQuery("");
    },
    [setFeedType],
  );

  const submitPost = useCallback(() => {
    if (!isLoggedIn) {
      setOpenSubmitAfterLogin(true);
      toggleAuthModal("login");
      return;
    }
    toggleSubmitModal(true);
  }, [isLoggedIn, toggleAuthModal, toggleSubmitModal]);

  const onAuthSuccess = useCallback(() => {
    setIsLoggedIn(true);
    toggleAuthModal(null);
    try {
      const storedUsername = localStorage.getItem("username") || "";
      setUsername(storedUsername);
    } catch (error) {
      console.error("Error retrieving username:", error);
    }
    if (shouldOpenSubmitAfterLogin) {
      toggleSubmitModal(true);
      setOpenSubmitAfterLogin(false);
    }
  }, [
    shouldOpenSubmitAfterLogin,
    toggleAuthModal,
    toggleSubmitModal,
    setIsLoggedIn,
    setUsername,
  ]);

  const editPost = useCallback(
    (post: HackerNewsStory) => {
      setEditingPost(post);
      toggleSubmitModal(true);
    },
    [toggleSubmitModal],
  );

  return (
    <>
      <Header
        onLogin={toggleAuthModal}
        onSubmit={submitPost}
        isLoggedIn={isLoggedIn}
        onLogout={() => setIsLoggedIn(false)}
        onSearchSubmit={submitSearch}
        externalSearchQuery={searchQuery}
      />
      <PostList
        feedType={feedType}
        viewMode={viewMode}
        onChangeFeedType={changeFeedType}
        onChangeViewMode={setViewMode}
        onEditPost={editPost}
        searchQuery={searchQuery}
        isLoggedIn={isLoggedIn}
        username={username}
      />
      {modals.auth && (
        <AuthModal
          action={modals.auth}
          onClose={() => toggleAuthModal(null)}
          onSuccess={onAuthSuccess}
        />
      )}
      {modals.submit && (
        <SubmitPostModal
          onClose={() => toggleSubmitModal(false)}
          editingPost={editingPost}
          onEditComplete={() => setEditingPost(null)}
          username={username}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}
