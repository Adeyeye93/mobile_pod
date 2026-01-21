import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useState, useMemo } from "react";
import { icons } from "@/constants/icons";
import Recent from "@/components/search/Recent";

// Mock data with type (mood or category)
const HISTORY_DATA: Array<{ name: string; type: "mood" | "category" }> = [
  { name: "Party", type: "mood" },
  { name: "Chill", type: "mood" },
  { name: "Focus", type: "mood" },
  { name: "Sleep", type: "mood" },
  { name: "Technology", type: "category" },
  { name: "Business", type: "category" },
  { name: "Comedy", type: "category" },
  { name: "Religion", type: "category" },
];

// Mock suggestions data
const ALL_SUGGESTIONS = [
  { title: "Cool Podcast", category: "Technology" },
  { title: "Comedy Central", category: "Comedy" },
  { title: "Cool Down Vibes", category: "Technology" },
  { title: "Sad Stories", category: "Religion" },
  { title: "Sad Boi Hours", category: "Comedy" },
  { title: "Party All Night", category: "Music" },
  { title: "Party Mix", category: "Music" },
  { title: "Faith & Spirituality", category: "Religion" },
  { title: "Religious History", category: "Religion" },
  { title: "Technology Talk", category: "Technology" },
  { title: "Tech News Daily", category: "Technology" },
  { title: "Business Insider", category: "Business" },
];

// Mock episodes data
const MOCK_EPISODES: Array<{ id: string; title: string; podcast: string }> = [
  { id: "1", title: "Episode 1: The Beginning", podcast: "Cool Podcast" },
  { id: "2", title: "Episode 2: Deep Dive", podcast: "Cool Podcast" },
  { id: "3", title: "Episode 3: Party Planning", podcast: "Party All Night" },
  { id: "4", title: "Episode 4: Tech Trends", podcast: "Technology Talk" },
  { id: "5", title: "Episode 5: Comedy Gold", podcast: "Comedy Central" },
  {
    id: "6",
    title: "Episode 6: Faith Journey",
    podcast: "Faith & Spirituality",
  },
];

const History = ({
  name,
  type,
  onPress,
}: {
  name: string;
  type: "mood" | "category";
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#a7a6a623] p-2 flex-row items-center gap-2 rounded"
    >
      <Text className="font-MonRegular text-textSecondary text-sm">{name}</Text>
      <Pressable className="p-1 bg-[#a7a6a60d] rounded">
        <Image className="w-3 h-3" source={icons.close} />
      </Pressable>
    </Pressable>
  );
};

const Search = () => {
  const [searchInput, setSearchInput] = useState("");

  // Parse search input to separate prefix (mood: or category:) from search term
  const parseSearchInput = (input: string) => {
    const prefixMatch = input.match(/^(mood:|category:)\s*/i);
    if (prefixMatch) {
      const prefix = prefixMatch[0].toLowerCase();
      const searchTerm = input.slice(prefix.length).trim();
      return { prefix, searchTerm };
    }
    return { prefix: "", searchTerm: input };
  };

  const { prefix, searchTerm } = parseSearchInput(searchInput);

  // Filter suggestions based on search term
  const filteredSuggestions = useMemo(() => {
    if (searchTerm.trim().length === 0) {
      return [];
    }
    return ALL_SUGGESTIONS.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const isSearching = searchInput.trim().length > 0;

  // Handle history click
  const handleHistoryPress = (name: string, type: "mood" | "category") => {
    const prefixText = type === "mood" ? "mood:" : "category:";
    setSearchInput(`${prefixText} ${name}`);
  };

  return (
    <View className="h-full">
      {/* Search Input */}
      <View className="border border-[#1f222b] mt-6 flex-row items-center justify-between h-16 rounded-3xl pl-6 bg-[#1f222b]">
        <Image tintColor="#6b7280" className="w-6 h-6" source={icons.search} />
        <TextInput
          className="flex-1 font-MonMedium h-full ml-4 text-textPrimary"
          placeholder="Looking for a particular Podcast?"
          placeholderTextColor="#6b7280"
          inputMode="search"
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>

      {/* Show history and recent when NOT searching */}
      {!isSearching && (
        <>
          {/* History Scrollview */}
          <View className="h-20">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 10,
                alignItems: "center",
                justifyContent: "flex-start",
                paddingHorizontal: 16,
              }}
            >
              {HISTORY_DATA.map((item, index) => (
                <History
                  key={index}
                  name={item.name}
                  type={item.type}
                  onPress={() => handleHistoryPress(item.name, item.type)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Recent Searches Title */}
          <Text className="text-textSecondary font-MonBold text-xl mt-5 mb-2 px-4">
            Recent Search
          </Text>

          {/* Recent Searches Scrollview */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
              alignItems: "flex-start",
              marginTop: 10,
            }}
          >
            <Recent />
            <Recent />
            <Recent />
            <Recent />
            <Recent />
            <Recent />
          </ScrollView>
        </>
      )}

      {/* Show suggestions when searching */}
      {isSearching && (
        <>
          <View className="flex-1 flex-col">
            {/* Suggestions Section */}
            <View className="flex-shrink">
              <Text className="text-textSecondary font-MonBold text-xl mt-5 mb-2 px-4">
                {prefix ? `Results for ${prefix} ${searchTerm}` : "Suggestions"}
              </Text>
              <ScrollView
                scrollEnabled={false}
                contentContainerStyle={{
                  gap: 12,
                  alignItems: "flex-start",
                  marginTop: 10,
                }}
              >
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                    <Pressable
                      key={index}
                      className="w-full flex-row items-center gap-3 p-3 bg-[#1f222b] rounded-lg"
                    >
                      <Image
                        className="w-5 h-5"
                        tintColor="#6b7280"
                        source={icons.search}
                      />
                      <View className="flex-1">
                        <Text className="text-textPrimary font-MonMedium">
                          {suggestion.title}
                        </Text>
                        <Text className="text-textSecondary font-MonRegular text-xs mt-1">
                          {suggestion.category}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text className="text-textSecondary font-MonRegular text-center w-full mt-10">
                    No suggestions found
                    {prefix && ` for "${prefix} ${searchTerm}"`}
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* Episodes Section */}
            <View className="flex-1 mt-6">
              <Text className="text-textSecondary font-MonBold text-xl mb-3 px-4">
                Episodes
              </Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 12,
                  paddingBottom: 20,
                }}
              >
                {MOCK_EPISODES.map((episode) => (
                  <Pressable
                    key={episode.id}
                    className="w-full flex-row items-center justify-between p-3 bg-[#1f222b] rounded-lg"
                  >
                    <View className="flex-1">
                      <Text className="text-textPrimary font-MonMedium">
                        {episode.title}
                      </Text>
                      <Text className="text-textSecondary font-MonRegular text-xs mt-1">
                        {episode.podcast}
                      </Text>
                    </View>
                    <Pressable className="p-2 bg-[#2a2f3a] rounded-full">
                      <Image
                        className="w-5 h-5"
                        source={icons.play}
                      />
                    </Pressable>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default Search;
