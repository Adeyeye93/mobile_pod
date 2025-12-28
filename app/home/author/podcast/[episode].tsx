import { View, Text, ScrollView } from "react-native";
import React from "react";
import Head from "@/components/author/head";
import { icons } from "@/constants/icons";
import PageHead from "@/components/PageHead";
import Timer from "@/components/author/timer";
import PlayPauseButton from "@/components/playPauseButton";
import EpisodeDescription from "@/components/author/podcast/Description";

const Episode = () => {
  return (
    <View className="flex-1 bg-background px-4">
      <PageHead
        title="Episode 685"
        iconsList={[icons.share, icons.rss, icons.report]}
        dropdownList={["Share", "View RSS feed", "Report"]}
      />
      <Head />
      <View className="w-full h-fit flex flex-col justify-start items-start gap-4 px-2">
        <Timer />
        <Text
          className="text-textPrimary font-MonBold text-xl"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          Episode 685: Understanding the Future of Tech with Jane Doe
        </Text>
        <PlayPauseButton Playing={false} Completed={false} />
      </View>
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <EpisodeDescription
          title="What We Discuss with Steve Rambam:"
          description="Steve Rambam (@stevenrambam) is the founder and CEO of Pallorium, Inc..."
          bulletPoints={[
            "Prime bank guarantee fraud: what is it and how does it work?",
            "Why is the US a 'Garden of Eden' for bad guys in general?",
            "How Steve's TV show Nowhere to Hide came to be.",
            "Why Steve's business doubled within two years following a bogus arrest.",
            "Are there scam lists, and are you on one?",
            "And much more...",
          ]}
          resourcesUrl="exampledomain.com/685"
          reviewUrl="https://review-link.com"
        />
      </ScrollView>
    </View>
  );
};

export default Episode;
