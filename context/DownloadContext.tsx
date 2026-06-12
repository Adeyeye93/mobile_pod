import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Directory, File, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recording } from "@/hook/useRecordings";

const STORAGE_KEY = "downloads_meta_v1";

export interface DownloadEntry {
  recording: Recording;
  localUri: string;
  downloadedAt: string;
}

interface DownloadContextType {
  downloads: DownloadEntry[];
  downloading: Set<string>; // ids currently downloading
  download: (recording: Recording) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  isDownloaded: (id: string) => boolean;
  isDownloading: (id: string) => boolean;
  getLocalUri: (id: string) => string | null;
}

const DownloadContext = createContext<DownloadContextType | null>(null);

function getDownloadsDir(): Directory {
  return new Directory(Paths.document, "downloads");
}

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      try {
        const dir = getDownloadsDir();
        if (!dir.exists) dir.create({ intermediates: true });

        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const entries: DownloadEntry[] = JSON.parse(raw);
        // Filter to only entries whose file is still on disk
        const valid = entries.filter((e) => {
          try {
            return new File(e.localUri).exists;
          } catch {
            return false;
          }
        });
        setDownloads(valid);
      } catch {
        // ignore
      }
    };
    init();
  }, []);

  const persist = useCallback(async (entries: DownloadEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, []);

  const download = useCallback(
    async (recording: Recording) => {
      if (downloadingIds.has(recording.id)) return;
      if (downloads.some((d) => d.recording.id === recording.id)) return;

      const sourceUrl = recording.download_url ?? recording.master_url;
      const path = sourceUrl.split("?")[0];
      const ext = path.includes(".") ? path.split(".").pop()! : "mp3";
      const fileName = `episode_${recording.id}.${ext}`;

      setDownloadingIds((prev) => new Set([...prev, recording.id]));

      try {
        const dir = getDownloadsDir();
        if (!dir.exists) dir.create({ intermediates: true });

        const destFile = new File(dir, fileName);
        if (destFile.exists) destFile.delete();

        const downloaded = await File.downloadFileAsync(sourceUrl, destFile);

        const entry: DownloadEntry = {
          recording,
          localUri: downloaded.uri,
          downloadedAt: new Date().toISOString(),
        };

        setDownloads((prev) => {
          const next = [entry, ...prev];
          persist(next);
          return next;
        });
      } catch {
        // swallow — download failed silently
      } finally {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(recording.id);
          return next;
        });
      }
    },
    [downloads, downloadingIds, persist]
  );

  const removeDownload = useCallback(
    async (id: string) => {
      setDownloads((prev) => {
        const entry = prev.find((d) => d.recording.id === id);
        if (entry) {
          try {
            const file = new File(entry.localUri);
            if (file.exists) file.delete();
          } catch {}
        }
        const next = prev.filter((d) => d.recording.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const isDownloaded = useCallback(
    (id: string) => downloads.some((d) => d.recording.id === id),
    [downloads]
  );

  const isDownloading = useCallback(
    (id: string) => downloadingIds.has(id),
    [downloadingIds]
  );

  const getLocalUri = useCallback(
    (id: string) =>
      downloads.find((d) => d.recording.id === id)?.localUri ?? null,
    [downloads]
  );

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        downloading: downloadingIds,
        download,
        removeDownload,
        isDownloaded,
        isDownloading,
        getLocalUri,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownload() {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownload must be inside DownloadProvider");
  return ctx;
}
