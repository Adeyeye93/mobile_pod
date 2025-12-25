import { Animated } from "react-native";
import { useEffect, useRef } from "react";

export function LivePulse() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, );

  return (
    <Animated.View
      style={{ opacity }}
      className="h-2 w-2 rounded-full bg-cyan-400"
    />
  );
}
