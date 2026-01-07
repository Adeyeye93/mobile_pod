import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface FilterPillProps {
  label: string;
  value: FeedFilter;
  active: boolean;
  isLive?: boolean;
  onPress: () => void;
}

export function FilterPill({
  label,
  active,
  isLive,
  onPress,
}: FilterPillProps) {
  const aStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active ? "#ffff" : "#35383f", {
      duration: 180,
    }),
    transform: [
      {
        scale: active ? withSpring(1, { damping: 14 }) : withSpring(0.96),
      },
    ],
  }));

  const livePulse = useAnimatedStyle(() => {
    if (!isLive || active) return {};

    return {
      opacity: withRepeat(withTiming(0.6, { duration: 900 }), -1, true),
    };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          {
            paddingHorizontal: 18,
            height: 30,
            borderRadius: 20,
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
          },
          aStyle,
        ]}
      >
        {isLive && !active && (
          <Animated.View
            style={[
              {
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#22C55E",
                marginRight: 6,
              },
              livePulse,
            ]}
          />
        )}

        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: active ? "#000" : "#C7C7C7",
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
