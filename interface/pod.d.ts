// Live Stream Initialization Data

interface LiveStreamStartRequest {
  // ========== REQUIRED FIELDS ==========

  // Stream Metadata
  title: string; // "Morning Tech Talk" (max 100 chars)
  description?: string; // "Discussing latest AI trends" (max 500 chars)
  category: string; // "technology", "music", "news", "sports", etc.

  // Creator Info
  creatorId: string; // UUID of the creator
  channelId: string; // UUID of creator's channel

  // Stream Settings
  isPrivate: boolean; // true/false - public or private stream
  allowComments: boolean; // Enable/disable live chat
  recordStream: boolean; // Save VOD after streaming ends

  // Audio Quality
  audioQuality?: "low" | "medium" | "high"; // 64kbps, 128kbps, 320kbps
  sampleRate?: number; // 44100 or 48000 Hz

  // ========== OPTIONAL FIELDS ==========

  tags?: string[]; // ["podcast", "tech", "discussion"]
  thumbnail?: string; // Image URL or base64
  language?: string; // "en", "es", "fr", etc.
  scheduledStartTime?: Date; // For scheduled streams

  // Streaming Protocol
  rtmpUrl?: string; // RTMP endpoint from server
  streamKey?: string; // Unique key for this stream

  // Restrictions
  ageRestriction?: number; // 0, 13, 18, 21
  contentWarning?: string; // "explicit", "violence", etc.

  // Notifications
  notifyFollowers?: boolean; // Alert followers stream started
  notifySubscribers?: boolean; // Alert subscribers
}

// Example Implementation
const startLiveStream = async (data: LiveStreamStartRequest) => {
  try {
    const response = await api.post("/live/start", {
      // Core stream info
      title: data.title,
      description: data.description,
      category: data.category,

      // Creator info
      creatorId: data.creatorId,
      channelId: data.channelId,

      // Settings
      isPrivate: data.isPrivate,
      allowComments: data.allowComments,
      recordStream: data.recordStream,

      // Audio config
      audioQuality: data.audioQuality || "high",

      // Optional
      tags: data.tags,
      thumbnail: data.thumbnail,
      language: data.language,
      ageRestriction: data.ageRestriction,

      // Notifications
      notifyFollowers: data.notifyFollowers,
      notifySubscribers: data.notifySubscribers,

      timestamp: new Date().toISOString(),
    });

    return {
      streamId: response.data.streamId,
      rtmpUrl: response.data.rtmpUrl,
      streamKey: response.data.streamKey,
      startedAt: response.data.startedAt,
    };
  } catch (error) {
    console.error("Failed to start stream:", error);
    throw error;
  }
};

// Minimum required for MVP
interface MinimalLiveStreamRequest {
  title: string;
  category: string;
  creatorId: string;
  channelId: string;
  recordStream: boolean;
}

// Example: Starting a minimal stream
const minimumDataToStart = {
  title: "Live Podcast Episode #42",
  category: "podcast",
  creatorId: "user-123",
  channelId: "channel-456",
  recordStream: true,
};
