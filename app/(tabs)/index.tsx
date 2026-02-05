import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { images } from "../../constants/image";
import { FilterPill } from "@/components/fielterpill";
import { useState } from "react";
import AllFeed from "@/components/page/AllFeed";
import Live from "@/components/page/Live";
import PP from "@/components/author/profile/PP";


export default function Index() {
  const router = useRouter();
    const [active, setActive] = useState<FeedFilter>("all");

  const renderContent = () => {
  switch (active) {
    case "all":
      return <AllFeed />;
    case "live":
      return <Live />; 
    case "episodes":
      return <View />;
    case "following":
      return <View />;
    case "trending":
      return <View />;
    default:
      return null;
  }
};

  return (
    <View className="flex-1 bg-background px-4 pb-16">
      <View className="w-full p-2 flex flex-row items-center justify-between mt-12">
        <View className="flex-1 flex-row items-center h-full gap-6">
          <PP />
          <View className="flex-1 h-full flex-row items-center justify-start gap-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 5,
                gap: 10,
              }}
            >
              <FilterPill
                label="All"
                value="all"
                active={active === "all"}
                onPress={() => setActive("all")}
              />

              <FilterPill
                label="Live"
                value="live"
                active={active === "live"}
                isLive
                onPress={() => setActive("live")}
              />

              <FilterPill
                label="Episode"
                value="episodes"
                active={active === "episodes"}
                onPress={() => setActive("episodes")}
              />
            </ScrollView>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/home/notification")}
          className="bg-[#35383f] p-2 rounded-3xl"
        >
          <Image source={icons.notification} className="w-6 h-6" />
        </Pressable>
      </View>
      {renderContent()}
    </View>
  );
}
