import { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";

export interface FollowedCreator {
  id: string;
  name: string;
  thumbnail_url: string | null;
  follower_count?: number;
  is_live?: boolean;
}

export function useFollowedCreators() {
  const [creators, setCreators] = useState<FollowedCreator[]>([]);

  useEffect(() => {
    api.get("/users/me/following")
      .then((res) => setCreators(res.data.creators ?? []))
      .catch(() => {});
  }, []);

  const follow = useCallback(async (creator: FollowedCreator) => {
    // Optimistic update
    setCreators((prev) => {
      if (prev.some((c) => c.id === creator.id)) return prev;
      return [creator, ...prev];
    });
    try {
      await api.post(`/channels/${creator.id}/follow`);
    } catch {
      // Roll back on failure
      setCreators((prev) => prev.filter((c) => c.id !== creator.id));
    }
  }, []);

  const unfollow = useCallback(async (id: string) => {
    // Optimistic update
    let removed: FollowedCreator | undefined;
    setCreators((prev) => {
      removed = prev.find((c) => c.id === id);
      return prev.filter((c) => c.id !== id);
    });
    try {
      await api.delete(`/channels/${id}/follow`);
    } catch {
      // Roll back on failure
      if (removed) {
        setCreators((prev) => [removed!, ...prev]);
      }
    }
  }, []);

  const isFollowing = useCallback(
    (id: string) => creators.some((c) => c.id === id),
    [creators]
  );

  return { creators, follow, unfollow, isFollowing };
}
