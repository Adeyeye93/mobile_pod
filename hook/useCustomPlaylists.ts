import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type { Recording } from "./useRecordings";

const KEY = "custom_playlists_v1";

export interface CustomPlaylist {
  id: string;
  name: string;
  recordings: Recording[];
  createdAt: string;
}

export function useCustomPlaylists() {
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setPlaylists(JSON.parse(raw));
    });
  }, []);

  const persist = (next: CustomPlaylist[]) => {
    setPlaylists(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const createPlaylist = useCallback((name: string): CustomPlaylist => {
    const playlist: CustomPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      recordings: [],
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => {
      const next = [playlist, ...prev];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
    return playlist;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, recording: Recording) => {
    setPlaylists((prev) => {
      const next = prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.recordings.some((r) => r.id === recording.id)) return p;
        return { ...p, recordings: [recording, ...p.recordings] };
      });
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, recordingId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) => {
        if (p.id !== playlistId) return p;
        return { ...p, recordings: p.recordings.filter((r) => r.id !== recordingId) };
      });
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { playlists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist };
}
