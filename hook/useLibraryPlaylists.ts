import React, { useCallback, useEffect, useState } from "react";
import { api } from "@/libs/api";
import type { Recording } from "./useRecordings";

export type PlaylistType = "liked" | "archive" | "listenLater" | "downloaded";

// Frontend camelCase → backend kebab-case
const API_TYPE: Record<PlaylistType, string> = {
  liked: "liked",
  archive: "archive",
  listenLater: "listen-later",
  downloaded: "downloaded",
};

export function useLibraryPlaylists() {
  const [liked, setLiked] = useState<Recording[]>([]);
  const [archive, setArchive] = useState<Recording[]>([]);
  const [listenLater, setListenLater] = useState<Recording[]>([]);
  const [downloaded, setDownloaded] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const setters: Record<PlaylistType, React.Dispatch<React.SetStateAction<Recording[]>>> = {
    liked: setLiked,
    archive: setArchive,
    listenLater: setListenLater,
    downloaded: setDownloaded,
  };

  const load = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      api.get(`/users/me/${API_TYPE.liked}`).then((r) => setLiked(r.data.recordings ?? [])).catch(() => {}),
      api.get(`/users/me/${API_TYPE.archive}`).then((r) => setArchive(r.data.recordings ?? [])).catch(() => {}),
      api.get(`/users/me/${API_TYPE.listenLater}`).then((r) => setListenLater(r.data.recordings ?? [])).catch(() => {}),
      api.get(`/users/me/${API_TYPE.downloaded}`).then((r) => setDownloaded(r.data.recordings ?? [])).catch(() => {}),
    ]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getList = useCallback(
    (type: PlaylistType): Recording[] => {
      switch (type) {
        case "liked": return liked;
        case "archive": return archive;
        case "listenLater": return listenLater;
        case "downloaded": return downloaded;
      }
    },
    [liked, archive, listenLater, downloaded]
  );

  const add = useCallback(async (type: PlaylistType, recording: Recording) => {
    // Optimistic update
    setters[type]((prev) => {
      if (prev.some((r) => r.id === recording.id)) return prev;
      return [recording, ...prev];
    });
    try {
      await api.post(`/recordings/${recording.id}/${API_TYPE[type]}`);
    } catch {
      // Roll back on failure
      setters[type]((prev) => prev.filter((r) => r.id !== recording.id));
    }
  }, []);

  const remove = useCallback(async (type: PlaylistType, id: string) => {
    // Optimistic update
    let removed: Recording | undefined;
    setters[type]((prev) => {
      removed = prev.find((r) => r.id === id);
      return prev.filter((r) => r.id !== id);
    });
    try {
      await api.delete(`/recordings/${id}/${API_TYPE[type]}`);
    } catch {
      // Roll back on failure
      if (removed) {
        setters[type]((prev) => [removed!, ...prev]);
      }
    }
  }, []);

  const isIn = useCallback(
    (type: PlaylistType, id: string): boolean => getList(type).some((r) => r.id === id),
    [getList]
  );

  return { liked, archive, listenLater, downloaded, loading, add, remove, isIn, getList, refresh: load };
}
