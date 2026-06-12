import { Share, Platform } from "react-native";

const SCHEME = "podmobile";

// ── Link builders ─────────────────────────────────────────────────────────────

export function episodeDeepLink(episodeId: string): string {
  return `${SCHEME}://home/author/podcast/${episodeId}`;
}

export function channelDeepLink(creatorId: string): string {
  return `${SCHEME}://home/author/${creatorId}`;
}

// ── Share helpers ─────────────────────────────────────────────────────────────
// iOS supports a separate `url` field; Android only reads `message`, so we
// embed the link inline for Android.

export async function shareEpisode(
  episodeId: string,
  title: string,
): Promise<void> {
  const url = episodeDeepLink(episodeId);
  await Share.share(
    Platform.OS === "ios"
      ? { title: `Listen on Echo: ${title}`, url }
      : { message: `Check out "${title}" on Echo\n${url}` },
  );
}

export async function shareChannel(
  creatorId: string,
  channelName: string,
): Promise<void> {
  const url = channelDeepLink(creatorId);
  await Share.share(
    Platform.OS === "ios"
      ? { title: `Follow ${channelName} on Echo`, url }
      : { message: `Follow ${channelName} on Echo\n${url}` },
  );
}

export async function shareLive(
  creatorId: string,
  streamTitle: string,
): Promise<void> {
  // Deep-link to the creator's channel page; listeners can tap into the live
  // stream directly from there.
  const url = channelDeepLink(creatorId);
  await Share.share(
    Platform.OS === "ios"
      ? { title: `Tune in to "${streamTitle}" — live on Echo`, url }
      : { message: `Tune in to "${streamTitle}" — live now on Echo\n${url}` },
  );
}
