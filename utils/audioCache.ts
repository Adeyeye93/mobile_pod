import { Directory, File, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const CACHE_META_KEY = "audio_cache_meta_v1";
const MAX_ENTRIES = 30;

interface CacheEntry {
  uri: string;
  cachedAt: number;
}
type CacheMeta = Record<string, CacheEntry>;

// Prevent concurrent downloads of the same track
const inProgress = new Set<string>();

function getCacheDir(): Directory {
  return new Directory(Paths.cache, "audio");
}

async function readMeta(): Promise<CacheMeta> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeMeta(meta: CacheMeta): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
  } catch {}
}

/** Returns a local file URI if this track is in the cache, or null. */
export async function getCachedUri(id: string): Promise<string | null> {
  const meta = await readMeta();
  const entry = meta[id];
  if (!entry) return null;
  try {
    if (new File(entry.uri).exists) return entry.uri;
    // File was evicted by the OS — remove stale entry
    const cleaned = { ...meta };
    delete cleaned[id];
    writeMeta(cleaned).catch(() => {});
    return null;
  } catch {
    return null;
  }
}

/** Download `url` to the audio cache dir. Safe to call concurrently — deduped. */
export async function cacheTrackBackground(id: string, url: string): Promise<void> {
  if (inProgress.has(id)) return;
  if (await getCachedUri(id)) return; // already cached

  inProgress.add(id);
  try {
    const dir = getCacheDir();
    if (!dir.exists) dir.create({ intermediates: true });

    const ext = url.split("?")[0].split(".").pop() || "mp3";
    const dest = new File(dir, `${id}.${ext}`);
    if (dest.exists) dest.delete();

    const result = await File.downloadFileAsync(url, dest);

    const meta = await readMeta();
    meta[id] = { uri: result.uri, cachedAt: Date.now() };

    // Evict oldest entries beyond the cap
    const sorted = Object.entries(meta).sort((a, b) => b[1].cachedAt - a[1].cachedAt);
    if (sorted.length > MAX_ENTRIES) {
      for (const [eid, edata] of sorted.slice(MAX_ENTRIES)) {
        try { new File(edata.uri).delete(); } catch {}
        delete meta[eid];
      }
    }

    await writeMeta(meta);
  } catch {
    // Cache failures are non-fatal — swallow silently
  } finally {
    inProgress.delete(id);
  }
}

/**
 * Preload a track only when connected to WiFi.
 * Safe to call fire-and-forget from feed screens.
 */
export async function preloadOnWifi(id: string, url: string): Promise<void> {
  try {
    const state = await NetInfo.fetch();
    if (state.type !== "wifi") return;
    await cacheTrackBackground(id, url);
  } catch {}
}
