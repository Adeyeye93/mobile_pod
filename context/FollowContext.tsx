import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/libs/api";

export interface FollowedCreator {
  id: string;
  name: string;
  thumbnail_url: string | null;
  follower_count?: number;
  is_live?: boolean;
}

interface FollowContextType {
  creators: FollowedCreator[];
  loaded: boolean;
  follow: (creator: FollowedCreator) => Promise<void>;
  unfollow: (id: string) => Promise<void>;
  isFollowing: (id: string) => boolean;
  refresh: () => void;
}

const FollowContext = createContext<FollowContextType | null>(null);

export function FollowProvider({ children }: { children: React.ReactNode }) {
  const [creators, setCreators] = useState<FollowedCreator[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    api
      .get("/users/me/following")
      .then((res) => {
        setCreators(res.data.creators ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const follow = useCallback(async (creator: FollowedCreator) => {
    setCreators((prev) => {
      if (prev.some((c) => c.id === creator.id)) return prev;
      return [creator, ...prev];
    });
    try {
      await api.post(`creators/${creator.id}/follow`);
    } catch {
      setCreators((prev) => prev.filter((c) => c.id !== creator.id));
    }
  }, []);

  const unfollow = useCallback(async (id: string) => {
    let removed: FollowedCreator | undefined;
    setCreators((prev) => {
      removed = prev.find((c) => c.id === id);
      return prev.filter((c) => c.id !== id);
    });
    try {
      await api.delete(`creators/${id}/follow`);
    } catch {
      if (removed) setCreators((prev) => [removed!, ...prev]);
    }
  }, []);

  const isFollowing = useCallback(
    (id: string) => creators.some((c) => c.id === id),
    [creators],
  );

  return (
    <FollowContext.Provider
      value={{ creators, loaded, follow, unfollow, isFollowing, refresh: load }}
    >
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}
