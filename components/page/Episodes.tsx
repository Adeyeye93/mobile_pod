import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useState, useMemo } from "react";
import PodList from "@/components/PodList";
import { useRecordings } from "@/hook/useRecordings";
import { useInterest } from "@/context/InterestContext";

type SortOrder = "newest" | "oldest";

const Episodes = () => {
  const { recordings, loading, error, refresh } = useRecordings();
  const { interests } = useInterest();
  const [sort, setSort] = useState<SortOrder>("newest");
  const [category, setCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    let list = [...recordings];
    if (category) {
      list = list.filter(
        (r) => r.category?.toLowerCase() === category.toLowerCase()
      );
    }
    list.sort((a, b) => {
      const ta = new Date(a.actual_start_time).getTime();
      const tb = new Date(b.actual_start_time).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [recordings, category, sort]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#6b7280"
        />
      }
      contentContainerStyle={{ paddingBottom: 200 }}
    >
      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4, paddingVertical: 12 }}
      >
        <Pressable
          onPress={() => setCategory(null)}
          className={`px-4 py-2 rounded-xl ${!category ? "bg-primary" : "bg-[#1f222b]"}`}
        >
          <Text className="text-textPrimary font-MonMedium text-sm">All</Text>
        </Pressable>
        {interests.map((interest: any) => (
          <Pressable
            key={interest.id}
            onPress={() =>
              setCategory(category === interest.name ? null : interest.name)
            }
            className={`px-4 py-2 rounded-xl ${
              category === interest.name ? "bg-primary" : "bg-[#1f222b]"
            }`}
          >
            <Text className="text-textPrimary font-MonMedium text-sm">
              {interest.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort toggle */}
      <View className="flex-row items-center gap-2 px-1 pb-3">
        <Text className="text-gray-500 font-MonRegular text-xs mr-1">Sort:</Text>
        {(["newest", "oldest"] as SortOrder[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSort(s)}
            className={`px-3 py-1.5 rounded-lg ${
              sort === s ? "bg-[#2a2f3a]" : ""
            }`}
          >
            <Text
              className={`font-MonMedium text-xs capitalize ${
                sort === s ? "text-textPrimary" : "text-gray-500"
              }`}
            >
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && (
        <Pressable className="items-center mt-10 px-4" onPress={refresh}>
          <Text className="text-textSecondary font-MonRegular text-center">
            Failed to load episodes. Tap to retry.
          </Text>
        </Pressable>
      )}

      {!loading && !error && filtered.length === 0 && (
        <View className="items-center mt-10">
          <Text className="text-textSecondary font-MonRegular text-sm">
            {category
              ? `No episodes in "${category}"`
              : "No episodes yet."}
          </Text>
        </View>
      )}

      <PodList data={filtered} loading={loading} />
    </ScrollView>
  );
};

export default Episodes;
