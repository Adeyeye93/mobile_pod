import React, { useEffect, useRef } from "react";
import {
  View,
  Animated as RNAnimated,
  Easing as RNEasing,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = 3;
const BAR_GAP = 3;
const BAR_STEP = BAR_WIDTH + BAR_GAP;
const NUM_BARS = Math.ceil(SCREEN_WIDTH / BAR_STEP) + 4; // enough to fill screen + buffer
const TOTAL_WIDTH = NUM_BARS * BAR_STEP;
const SCROLL_DURATION = 6000; // ms for one full loop

const SoundBar = ({ index, total }: { index: number; total: number }) => {
  const progress = useSharedValue(Math.random());

  useEffect(() => {
    const duration = 1200 + index * 30 + Math.random() * 500;
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const center = total / 2;
  const distFromCenter = Math.abs(index - center) / center;
  const maxH = 48 * (1 - distFromCenter * 0.4);
  const minH = 4 + distFromCenter * 5;

  const animStyle = useAnimatedStyle(() => {
    const h = minH + (maxH - minH) * progress.value;
    return { height: h, borderRadius: h };
  });

  return (
    <Animated.View
      style={[
        {
          width: BAR_WIDTH,
          backgroundColor: "rgba(255,255,255,0.75)",
          borderRadius: 4,
          marginHorizontal: BAR_GAP / 2,
        },
        animStyle,
      ]}
    />
  );
};

const SoftSoundwave = () => {
  const scrollX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.timing(scrollX, {
        toValue: -TOTAL_WIDTH,
        duration: SCROLL_DURATION,
        easing: RNEasing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Render 3 copies side by side so the loop is seamless
  const copies = [0, 1, 2];

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: 60,
        overflow: "hidden",
        opacity: 0.5,
      }}
    >
      <RNAnimated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 60,
          transform: [{ translateX: scrollX }],
        }}
      >
        {copies.map((copy) =>
          Array.from({ length: NUM_BARS }, (_, i) => (
            <SoundBar key={`${copy}-${i}`} index={i} total={NUM_BARS} />
          )),
        )}
      </RNAnimated.View>
    </View>
  );
};

export default SoftSoundwave;
