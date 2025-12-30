import { View, ScrollView } from "react-native";
import PageHead from "@/components/PageHead";
import Head from "@/components/author/head";
import Divider from "@/components/divider";
import AuthorListHead from "@/components/author/authorListHead";
import Pods from "@/components/author/pods";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { LinearGradient } from "expo-linear-gradient";
import { useImageColors } from "@/hook/useImageColors";

const discriptionText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const Author = () => {
  const bannerImage = images.pod5;

  const colors = useImageColors(bannerImage);

  return (
    <View className="flex-1 bg-background px-4">
      <View
        className="absolute top-0 h-2/5 left-0 right-0 z-0 flex flex-col items-end justify-end overflow-hidden"
        style={{ backgroundColor: colors?.colorOne.value }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(24,26,32,0.5)", "rgba(24,26,32,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="w-full h-full"
        />
      </View>
      <PageHead
        title="Author"
        iconsList={[icons.share, icons.rss, icons.report]}
        dropdownList={["Share", "View RSS feed", "Report"]}
      />
      <Head
        authorDetails={true}
        Description={discriptionText}
        imageUrl={bannerImage}
        title={"The Breakfast Club"}
        podcastsCount={"120k"}
      />
      <AuthorListHead />

      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, minHeight: "100%" }}
      >
        <Divider value={385} gap={25} />
        <Pods />
        <Divider value={385} gap={25} />
        <Pods />
        <Divider value={385} gap={25} />
        <Pods />
        <Divider value={385} gap={25} />
        <Pods />
        <Divider value={385} gap={25} />
        <Pods />
        <Divider value={385} gap={25} />
        <Pods />
        <Divider value={385} gap={25} />
        <Pods />
      </ScrollView>
    </View>
  );
};

export default Author;
