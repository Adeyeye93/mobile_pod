import { View } from "react-native";
import React from "react";
import { animationsFile } from "@/constants/animation";
import LottieView from "lottie-react-native";

interface PreloadProps {
    size?: number;
}

const Preload = ({ size }: PreloadProps) => {
  return (
    <View>
      <LottieView
        source={animationsFile.preloader}
        autoPlay
        loop={true}
        speed={2}
        style={{
          height: size || 120,
          width: size || 120,
          padding: 0,
        }}
      />
    </View>
  );
};

export default Preload;
