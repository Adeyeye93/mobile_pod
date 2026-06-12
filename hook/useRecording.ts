import { useEffect, useState } from "react";
import { api } from "@/libs/api";
import type { Recording } from "./useRecordings";
import { fixMediaUrl } from "@/utils/mediaUrl";

export function useRecording(id: string) {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .get(`/streams/${id}`)
      .then((res) => {
        const r = res.data?.stream ?? res.data;
        setRecording({
          ...r,
          master_url: fixMediaUrl(r.master_url) ?? r.master_url,
          download_url: fixMediaUrl(r.download_url),
          thumbnail: fixMediaUrl(r.thumbnail),
          creator_avatar: fixMediaUrl(r.creator_avatar),
        });
      })
      .catch((e) => setError(e.message ?? "Failed to load episode"))
      .finally(() => setLoading(false));
  }, [id]);

  return { recording, loading, error };
}
