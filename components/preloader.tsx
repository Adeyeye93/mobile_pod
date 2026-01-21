import React from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import { animationsFile } from "@/constants/animation";

interface LottiePreloaderProps {
  size?: number;
  speed?: number;
  loop?: boolean;
}

export default function Preloader({
  size = 250,
  speed = 1,
  loop = true,
}: LottiePreloaderProps) {
  return (
    <View className="w-full h-full flex-1 bg-background absolute top 0 flex-row items-center justify-center">
      <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LottieView
        source={animationsFile.preloader}
        autoPlay
        loop={loop}
        speed={speed}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
    </View>
    
  );
}
