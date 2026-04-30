import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import {
  LivePrivacySheetContext,
  Sheet,
  useLivePrivacySheet,
} from "@/context/CreateSheetContext";
import { useRouter } from "expo-router";
import { use, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import VisibilitySelector from "../VisibilitySelector";
import Divider from "../divider";
import { useStream } from "@/context/stream/StreamSetUp";

const LivePrivacy = () => {
  const { ref: sheetRef } = useLivePrivacySheet();
  const router = useRouter();
  const [visibility, setVisibility] = useState<string>("");
  const { setPrivate, private: isPrivate } = useStream();

  console.log("visibility:", visibility);
  console.log("isPrivate:", isPrivate);

  const handlePrivateToggle = (value: any) => {
    if (value.key === "private") {
      setPrivate(true);
    } else {
      setPrivate(false);
    }
    setVisibility(value.key);
  }

  const handlePress = () => {
    router.push("/creator/Schedule");
    sheetRef.current?.collapse();
  };
  return (
    <Sheet context={LivePrivacySheetContext} snapPoints={[0.000001, 400]}>
      <View className="w-full h-full bg-[#111827] p-6 py-4 flex flex-col items-center justify-start gap-6">
        <View className="flex flex-row items-center justify-center  ">
          <Image className="w-12 h-12 rounded-full" source={images.profile} />
          <View
            style={{
              flex: 0,
              width: 30,
              height: 24,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: -4,
            }}
          >
            <View
              style={{
                width: "100%",
                height: 1,
                borderRadius: 1,
                borderStyle: "dashed",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            />
          </View>
          <Image className="w-12 h-12" source={icons.globe} />
        </View>
        <View className="flex flex-col items-center justify-between gap-1">
          <Text className="text-textPrimary font-MonBold text-2xl">
            Connect with the world
          </Text>
          <Text className="text-textSecondary text-xs font-MonRegular text-center">
            Go live, choose your privacy settings and start streaming.
          </Text>
        </View>
        <VisibilitySelector value={visibility} onChange={handlePrivateToggle} />
        <Divider gap={1} value={300} />
        <Pressable
          onPress={
            visibility === "public" || visibility === "private"
              ? handlePress
              : undefined
          }
          className={`w-full h-14 flex items-center justify-center rounded-2xl mx-10 ${
            visibility !== "public" && visibility !== "private"
              ? "opacity-50 bg-gray-400"
              : "bg-primary"
          }`}
        >
          <Text className="text-textPrimary font-MonBold text-lg">
            Start Streaming
          </Text>
        </Pressable>
      </View>
      {/* <Text>TEXT</Text>
        <Pressable onPress={() => {handlePress()}}></Pressable> */}
    </Sheet>
  );
};

export default LivePrivacy;
