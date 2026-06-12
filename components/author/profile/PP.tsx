import { Pressable, Image, View, Text } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useCreatorMode } from "@/context/CreatorModeContext";
import { useAuth } from "@/context/AuthContext";

interface PPInterface {
  size?: number;
}

const PP = ({ size = 10 }: PPInterface) => {
  const { isCreatorMode } = useCreatorMode();
  const { username, avatarUrl } = useAuth();
  const router = useRouter();

  const handle = () => {
    if (isCreatorMode) {
      router.push("/(tabs)/creator-profile");
    } else {
      router.push("/(tabs)/profile");
    }
  };

  const px = size * 4;

  return (
    <Pressable onPress={handle}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: px, height: px, borderRadius: px / 2 }}
        />
      ) : (
        <View
          style={{
            width: px,
            height: px,
            borderRadius: px / 2,
            backgroundColor: "rgba(230,57,70,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#e63946",
              fontFamily: "bold",
              fontSize: px * 0.4,
            }}
          >
            {(username || "U")[0].toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

export default PP;
