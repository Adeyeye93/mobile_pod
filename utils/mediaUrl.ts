const API_ROOT = (process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:4000/api/")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

/**
 * Normalises image/media URLs returned by the backend so they are reachable
 * from a physical device or emulator:
 *   - Rewrites localhost / 127.0.0.1 to the server root derived from EXPO_PUBLIC_API_URL
 *   - Prepends the server root for absolute paths that lack a host ("/uploads/…")
 *   - Prepends the server root for bare relative paths ("avatars/…", "broadcasters/…")
 */
export function fixMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already a full https:// URL that isn't localhost — pass through
  if (/^https?:\/\/(?!localhost|127\.0\.0\.1)/.test(url)) return url;

  // Rewrite localhost / 127.0.0.1 to API root
  const rewritten = url.replace(
    /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
    API_ROOT,
  );

  // Absolute path without host e.g. "/uploads/avatars/file.jpg"
  if (rewritten.startsWith("/")) return `${API_ROOT}${rewritten}`;

  // Bare relative path e.g. "avatars/file.jpg" — only if it doesn't start with http
  if (!/^https?:\/\//.test(rewritten)) return `${API_ROOT}/${rewritten}`;

  return rewritten;
}
