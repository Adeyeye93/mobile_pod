import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricCard {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}

interface Episode {
  num: string;
  title: string;
  comments: number;
  date: string;
  likes: number;
}

interface Sentiment {
  positive: number;
  neutral: number;
  negative: number;
}

interface TabData {
  metrics: MetricCard[];
  episodes: Episode[];
  sentiment: Sentiment;
}

// ─── Mock data (replace with real API data) ───────────────────────────────────

const DATA: Record<"live" | "stream", TabData> = {
  live: {
    metrics: [
      { label: "Total comments", value: "12,480", delta: "+8.4%", up: true },
      { label: "Avg per episode", value: "623", delta: "+5.1%", up: true },
      { label: "Reply rate", value: "34%", delta: "-2.3%", up: false },
      { label: "Pinned replies", value: "142", delta: "+12%", up: true },
    ],
    episodes: [
      {
        num: "Ep 14",
        title: "Building in public — lessons from year 1",
        comments: 1240,
        date: "Jun 9",
        likes: 340,
      },
      {
        num: "Ep 13",
        title: "The creator economy is shifting",
        comments: 987,
        date: "May 26",
        likes: 212,
      },
      {
        num: "Ep 12",
        title: "AI tools we actually use every week",
        comments: 854,
        date: "May 12",
        likes: 289,
      },
      {
        num: "Ep 11",
        title: "Monetising a podcast from day one",
        comments: 760,
        date: "Apr 28",
        likes: 198,
      },
      {
        num: "Ep 10",
        title: "Interviewing your first guest",
        comments: 631,
        date: "Apr 14",
        likes: 174,
      },
    ],
    sentiment: { positive: 68, neutral: 22, negative: 10 },
  },
  stream: {
    metrics: [
      { label: "Total comments", value: "8,930", delta: "+14.2%", up: true },
      { label: "Avg per stream", value: "510", delta: "+9.8%", up: true },
      { label: "Reply rate", value: "41%", delta: "+3.1%", up: true },
      { label: "Pinned replies", value: "88", delta: "+6%", up: true },
    ],
    episodes: [
      {
        num: "S 17",
        title: "Live Q&A — product roadmap deep dive",
        comments: 1540,
        date: "Jun 7",
        likes: 420,
      },
      {
        num: "S 16",
        title: "Studio setup tour + gear breakdown",
        comments: 1102,
        date: "May 30",
        likes: 310,
      },
      {
        num: "S 15",
        title: "Reacting to viral creator takes",
        comments: 890,
        date: "May 18",
        likes: 265,
      },
      {
        num: "S 14",
        title: "Behind the scenes — editing workflow",
        comments: 712,
        date: "May 4",
        likes: 190,
      },
      {
        num: "S 13",
        title: "Community spotlight: listener stories",
        comments: 680,
        date: "Apr 20",
        likes: 155,
      },
    ],
    sentiment: { positive: 74, neutral: 18, negative: 8 },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricTile({ item }: { item: MetricCard }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel} className="font-MonMedium">
        {item.label}
      </Text>
      <Text style={styles.metricValue} className="font-MonBold">
        {item.value}
      </Text>
      <Text
        style={[
          styles.metricDelta,
          item.up ? styles.deltaUp : styles.deltaDown,
        ]}
        className="font-MonMedium"
      >
        {item.delta}
      </Text>
    </View>
  );
}

function EpisodeRow({ ep, maxComments }: { ep: Episode; maxComments: number }) {
  const pct = maxComments > 0 ? ep.comments / maxComments : 0;
  return (
    <View style={styles.epRow}>
      <Text style={styles.epNum} className="font-MonMedium">
        {ep.num}
      </Text>
      <View style={styles.epInfo}>
        <Text
          style={styles.epTitle}
          numberOfLines={1}
          className="font-MonBold"
        >
          {ep.title}
        </Text>
        <Text style={styles.epMeta} className="font-MonMedium">
          {ep.date} · {ep.likes.toLocaleString()} likes
        </Text>
      </View>
      <View style={styles.barWrap}>
        <View
          style={[styles.bar, { width: `${Math.round(pct * 100)}%` as any }]}
        />
      </View>
      <Text style={styles.epCount} className="font-MonMedium">
        {ep.comments.toLocaleString()}
      </Text>
    </View>
  );
}

function SentimentRow({ sentiment }: { sentiment: Sentiment }) {
  return (
    <View style={styles.sentimentRow}>
      <Text style={styles.sectionLabel} className="font-MonBold">
        Sentiment
      </Text>
      <View style={styles.pills}>
        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: "#1D9E75" }]} />
          <Text className="font-MonMedium" style={styles.pillText}>
            {sentiment.positive}% positive
          </Text>
        </View>
        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: "#888780" }]} />
          <Text style={styles.pillText} className="font-MonMedium">
            {sentiment.neutral}% neutral
          </Text>
        </View>
        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: "#E24B4A" }]} />
          <Text className="font-MonMedium" style={styles.pillText}>
            {sentiment.negative}% negative
          </Text>
        </View>
      </View>{" "}
      mini: boolean
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PodcastCommentsCard({
  mini = false,
}: {
  mini?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"live" | "stream">("live");
  const d = DATA[activeTab];
  const maxComments = Math.max(...d.episodes.map((e) => e.comments));

  return (
    <View style={styles.card} className="bg-gray-800 rounded-3xl">
      {/* Tabs */}
      <View style={styles.tabs}>
        {(["live", "stream"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
              className="font-MonBold"
            >
              {tab === "live" ? "Live podcasts" : "Stream podcasts"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Metrics grid */}
      <View style={styles.metricsGrid}>
        {d.metrics.map((m, i) => (
          <MetricTile key={i} item={m} />
        ))}
      </View>
      {mini ? null : (
        <View>
          <Text style={styles.sectionLabel} className="font-MonBold">
            Comments by episode
          </Text>
          <View style={styles.episodeList}>
            {d.episodes.map((ep, i) => (
              <EpisodeRow key={i} ep={ep} maxComments={maxComments} />
            ))}
          </View>

          {/* Sentiment */}
          <SentimentRow sentiment={d.sentiment} />
        </View>
      )}
      {/* Episodes */}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    // backgroundColor: "#1a1a2e",
    borderRadius: 24,
    padding: 16,
    marginTop: 12,
    width: "90%",
    alignSelf: "center",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#16213e",
    borderWidth: 0.5,
    borderColor: "#2d3561",
  },
  tabActive: {
    backgroundColor: "#0f3460",
    borderColor: "#0f3460",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7fa3",
  },
  tabTextActive: {
    color: "#ffffff",
  },

  // Metrics
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metricTile: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 10,
    width: "47.5%",
  },
  metricLabel: {
    fontSize: 11,
    color: "#6b7fa3",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e8eaf6",
  },
  metricDelta: {
    fontSize: 11,
    marginTop: 2,
  },
  deltaUp: {
    color: "#1D9E75",
  },
  deltaDown: {
    color: "#E24B4A",
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7fa3",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  // Episode rows
  episodeList: {
    gap: 6,
    marginBottom: 14,
  },
  epRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#16213e",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  epNum: {
    fontSize: 11,
    color: "#4a5a7a",
    width: 32,
  },
  epInfo: {
    flex: 1,
    minWidth: 0,
  },
  epTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e8eaf6",
  },
  epMeta: {
    fontSize: 11,
    color: "#4a5a7a",
    marginTop: 2,
  },
  barWrap: {
    width: 72,
    height: 5,
    backgroundColor: "#0d1b36",
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: {
    height: 5,
    backgroundColor: "#e94560",
    borderRadius: 3,
  },
  epCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e8eaf6",
    width: 36,
    textAlign: "right",
  },

  // Sentiment
  sentimentRow: {
    gap: 8,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#16213e",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 11,
    color: "#a8b2d8",
  },
});
