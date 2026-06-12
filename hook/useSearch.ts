import { useEffect, useState } from "react";
import { api } from "@/libs/api";
import type { Recording } from "./useRecordings";
import type { FeedChannelItem } from "./useFeed";

export function useSearch(query: string) {
  const [results, setResults] = useState<Recording[]>([]);
  const [channels, setChannels] = useState<FeedChannelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setChannels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.recordings ?? []);
        setChannels(res.data.channels ?? []);
      } catch (e: any) {
        setError(e.message ?? "Search failed");
        setResults([]);
        setChannels([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, channels, loading, error };
}
