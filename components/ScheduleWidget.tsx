import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  Image,
  StyleSheet,
  ImageSourcePropType
} from "react-native";
import { images } from "@/constants/image";

interface UpcomingEvent {
  title: string;
  time: string;
}

interface PodcastCreator {
  name: string;
  role: string;
  avatar: ImageSourcePropType;
}

interface ScheduleWidgetProps {
  date?: string;
  dayLabel?: string;
  eventCount?: number;
  upcomingEvents?: UpcomingEvent[];
  creators?: PodcastCreator[];
}

const DEFAULT_EVENTS: UpcomingEvent[] = [
  { title: "Morning Standup", time: "09:00 – 09:30" },
  { title: "Live Podcast Ep. 14", time: "14:00 – 16:00" },
  { title: "Team Retro", time: "17:00 – 17:45" },
];

const DEFAULT_CREATORS: PodcastCreator[] = [
  {
    name: "Amara Nwosu",
    role: "Host",
    avatar: images.profile,
  },
  {
    name: "Kola Adeyemi",
    role: "Co-host",
    avatar: images.profile,
  },
  {
    name: "Zara Singh",
    role: "Producer",
    avatar: images.profile,
  },
];

const WIDGET_HEIGHT = 192;

export default function ScheduleWidget({
  date = "Jun 9",
  dayLabel = "Wednesday",
  eventCount = 4,
  upcomingEvents = DEFAULT_EVENTS,
  creators = DEFAULT_CREATORS,
}: ScheduleWidgetProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const toggle = () => {
    const toValue = flipped ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
    setFlipped(!flipped);
  };

  // Date panel slides up and out
  const dateTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -WIDGET_HEIGHT],
  });

  // Creator panel rises up from below
  const creatorTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [WIDGET_HEIGHT, 0],
  });

  const nextLive =
    upcomingEvents.find((e) => e.title.toLowerCase().includes("podcast")) ??
    upcomingEvents[upcomingEvents.length - 1];

  return (
    <View style={styles.card}>
      {/* LEFT: overflow:hidden clips the sliding panels */}
      <View style={styles.leftClip}>
        {/* Date panel */}
        <Animated.View
          style={[
            styles.panel,
            { transform: [{ translateY: dateTranslateY }] },
          ]}
        >
          <Pressable onPress={toggle} style={styles.panelInner}>
            <Text style={styles.dateText} className="font-MonBold">
              {date}
            </Text>
            <View style={styles.accentLine} />
            <Text style={styles.subText} className="font-MonMedium">
              {dayLabel}
            </Text>
            <Text style={styles.subText} className="font-MonMedium">
              {eventCount} events
            </Text>
            <Text style={styles.hint} className="font-MonMedium">
              tap ↑
            </Text>
          </Pressable>
        </Animated.View>

        {/* Creator panel */}
        <Animated.View
          style={[
            styles.panel,
            styles.creatorPanel,
            { transform: [{ translateY: creatorTranslateY }] },
          ]}
        >
          <Pressable onPress={toggle} style={styles.panelInner}>
            <Text style={styles.liveLabel} className="font-MonBold">
              NEXT LIVE
            </Text>
            <Text style={styles.liveTime} className="font-MonBold">
              {nextLive.time}
            </Text>
            {creators.map((c, i) => (
              <View key={i} style={styles.creatorRow}>
                <Image source={c.avatar} style={styles.avatar} />
                <View>
                  <Text style={styles.creatorName} className="font-MonBold">
                    {c.name}
                  </Text>
                  <Text style={styles.creatorRole} className="font-MonMedium">
                    {c.role}
                  </Text>
                </View>
              </View>
            ))}
            <Text style={styles.hint}>tap ↓</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* RIGHT: upcoming events */}
      <View style={styles.rightPanel}>
        <Text style={styles.upcomingLabel} className="font-MonBold">
          UPCOMING
        </Text>
        {upcomingEvents.slice(0, 3).map((ev, i) => (
          <View key={i} style={styles.eventRow}>
            <View style={styles.eventBar} />
            <View>
              <Text style={styles.eventTitle} className="font-MonBold">
                {ev.title}
              </Text>
              <Text style={styles.eventTime} className="font-MonMedium">
                {ev.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16213e",
    borderRadius: 28,
    marginTop: 40,
    width: "90%",
    height: WIDGET_HEIGHT,
    flexDirection: "row",
    alignSelf: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.5,
    // shadowRadius: 20,
    elevation: 12,
  },

  leftClip: {
    width: 138,
    height: WIDGET_HEIGHT,
    overflow: "hidden", // ← this is what clips the animation
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },

  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 138,
    height: WIDGET_HEIGHT,
    backgroundColor: "#0f3460",
  },

  creatorPanel: {
    backgroundColor: "#0d1b36",
  },

  panelInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 22,
    justifyContent: "center",
  },

  dateText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },

  accentLine: {
    width: 28,
    height: 2.5,
    backgroundColor: "#e94560",
    borderRadius: 2,
    marginVertical: 8,
  },

  subText: {
    fontSize: 12,
    color: "#a8b2d8",
    fontWeight: "500",
    lineHeight: 18,
  },

  hint: {
    fontSize: 10,
    color: "#e94560",
    marginTop: 6,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  liveLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1,
    marginBottom: 2,
  },

  liveTime: {
    fontSize: 10,
    color: "#6b7fa3",
    marginBottom: 8,
  },

  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },

  avatar: {
    width: 29,
    height: 29,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  creatorName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e8eaf6",
  },

  creatorRole: {
    fontSize: 10,
    color: "#6b7fa3",
  },

  divider: {
    width: 1,
    height: "65%",
    alignSelf: "center",
    backgroundColor: "#2d3561",
  },

  rightPanel: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
    justifyContent: "center",
    gap: 10,
  },

  upcomingLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7fa3",
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  eventBar: {
    width: 2.5,
    height: 30,
    backgroundColor: "grey",
    borderRadius: 2,
  },

  eventTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e8eaf6",
  },

  eventTime: {
    fontSize: 11,
    color: "#6b7fa3",
    marginTop: 1,
  },
});
