import Author from "@/components/library/tabs/Author";
import Downloaded from "@/components/library/tabs/Downloaded";
import ListModal from "@/components/library/tabs/ListModal";
import Playlists from "@/components/library/tabs/Playlists";
import PageHead from "@/components/PageHead";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { PlayListModal, usePlayListContent } from "@/context/ModalIntances";
import { useImageColors } from "@/hook/useImageColors";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

type TabType = "playlists" | "author" | "downloaded";

const TABS: { id: TabType; label: string }[] = [
  { id: "playlists", label: "Playlists" },
  { id: "author", label: "Author" },
  { id: "downloaded", label: "Downloaded" },
];

const Library = () => {
  const colors = useImageColors(images.profile);
  const [activeTab, setActiveTab] = useState<TabType>("playlists");
  const [modalVisible, setModalVisible] = useState(false);
  const { tittle, loading, data, content } = usePlayListContent();

  const renderTabContent = () => {
    switch (activeTab) {
      case "playlists":
        return <Playlists color={colors} />;
      case "author":
        return <Author />;
      case "downloaded":
        return <Downloaded />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background pb-16">
      <View
        className="w-full h-fit"
        style={{
          backgroundColor: colors.colorOne.value,
        }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full absolute inset-0"
        />
        <PageHead
          profile={images.profile}
          has_profile
          title="Your Library"
          customIcons={[
            {
              icon: icons.search,
              onPress: () => console.log("TEXT LOG"),
              testID: "download-btn",
            },
            {
              icon: icons.plus,
              onPress: () => console.log("TEXT LOG"),
              testID: "share-btn",
            },
          ]}
        />
      </View>
      <View className="w-full border-b border-[#2a2f3a]">
        <View className="flex-row items-center">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className="flex-1 py-4 items-center justify-center"
              >
                <Text
                  className={`font-MonBold text-lg ${
                    isActive ? "text-primary" : "text-textSecondary"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row">
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            // const indicatorWidth = 100 / TABS.length;
            return (
              <View
                key={`indicator-${tab.id}`}
                className="flex-1 h-1 bg-[#2a2f3a00]"
              >
                {isActive && <View className="flex-1" />}
              </View>
            );
          })}
        </View>
      </View>
      <View className="w-full h-10 px-4 flex-row items-center justify-start">
        <Pressable className="flex-row items-center justify-start gap-2">
          <Image className="w-4 h-4" source={icons.sort} />
          <Text className="text-textSecondary font-MonBold text-sm">
            Newests
          </Text>
        </Pressable>
      </View>
      <View className="flex-1">{renderTabContent()}</View>
      <PlayListModal title={tittle} MenuIcons={[icons.search, icons.menu]}>
        <ListModal />
      </PlayListModal>
    </View>
  );
};

export default Library;
