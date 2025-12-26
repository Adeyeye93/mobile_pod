import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import PageHead from "@/components/PageHead";
import PodList from "@/components/PodList";

const SectionDetails = () => {
  const { title } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, minHeight: "100%" }}
      >
        <PageHead title={title as string} />
        <PodList Playing={false} Completed={false} />
        <PodList Playing={true} Completed={false} />
      </ScrollView>
    </View>
  );
};

export default SectionDetails;
