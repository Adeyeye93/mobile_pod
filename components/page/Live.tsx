import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import Livecard from "@/components/livecard";
import { useLiveStreams } from "@/hook/useLiveStreams";
import Preload from "../preload";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Live = () => {
  const [tab, setTab] = useState<"all" | "following">("all");
  const { streams, loading, error, refresh } = useLiveStreams();

  return (
    <View className="mt-3 h-fit">
      {/* Tab switcher */}
      <View className="w-full h-20 bg-[#35383f] rounded-xl p-2 flex-row items-center justify-between relative">
        <View
          className={`absolute w-1/2 bg-primary h-full rounded-xl ml-2 mr-2 ${tab === "following" ? "left-1/2" : "left-0"}`}
        />
        <Pressable
          onPress={() => setTab("all")}
          className="w-1/2 h-full items-center justify-center"
        >
          <Text className="text-textPrimary font-MonBold text-xl">
            All Live
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("following")}
          className="w-1/2 h-full items-center justify-center"
        >
          <Text className="text-textPrimary font-MonBold text-xl">
            Following
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200, minHeight: "100%" }}
      >
        {loading && (
          <View className="items-center mt-10">
            <Preload />
          </View>
        )}

        {error && (
          <Pressable className="items-center mt-10" onPress={refresh}>
            <Text className="text-textSecondary font-MonRegular">
              Failed to load streams. Tap to retry.
            </Text>
          </Pressable>
        )}

        {!loading && !error && streams.length === 0 && (
          <View className="items-center mt-10">
            <Text className="text-textSecondary font-MonRegular">
              No live streams right now.
            </Text>
          </View>
        )}

        {streams.map((stream) => (
          <Livecard key={stream.id} stream={stream} minimal />
        ))}
      </ScrollView>
    </View>
  );
};

export default Live;
