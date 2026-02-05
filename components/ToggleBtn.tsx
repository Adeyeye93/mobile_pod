import React, { useState } from "react";
import { Pressable, View, Animated, StyleSheet } from "react-native";

interface ToggleButtonProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
}

export function ToggleButton({
  value = false,
  onChange,
  activeColor = "#4169e1",
  inactiveColor = "#ccc",
  size = "medium",
  disabled = false,
}: ToggleButtonProps) {
  const [isActive, setIsActive] = useState(value);
  const animatedValue = React.useRef(
    new Animated.Value(isActive ? 1 : 0),
  ).current;

  // Size configurations
  const sizeConfig = {
    small: { width: 44, height: 24, thumbSize: 20, padding: 2 },
    medium: { width: 56, height: 32, thumbSize: 28, padding: 2 },
    large: { width: 68, height: 40, thumbSize: 36, padding: 2 },
  };

  const config = sizeConfig[size];
  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      config.padding,
      config.width - config.thumbSize - config.padding,
    ],
  });

  const handleToggle = () => {
    if (disabled) return;

    const newValue = !isActive;
    setIsActive(newValue);
    onChange?.(newValue);

    Animated.timing(animatedValue, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={[
          {
            width: config.width,
            height: config.height,
            borderRadius: config.height / 2,
            backgroundColor,
            justifyContent: "center",
            paddingHorizontal: config.padding,
          },
        ]}
      >
        <Animated.View
          style={[
            {
              width: config.thumbSize,
              height: config.thumbSize,
              borderRadius: config.thumbSize / 2,
              backgroundColor: "#fff",
              position: "absolute",
              left: thumbPosition,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
