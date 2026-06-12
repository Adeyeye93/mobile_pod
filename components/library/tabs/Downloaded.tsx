import { View, Text, Image, ScrollView } from "react-native";
import { icons } from "@/constants/icons";
import { useDownload } from "@/context/DownloadContext";
import List from "./OrderStyle/List";

interface Props {
  searchQuery?: string;
}

export default function Downloaded({ searchQuery = "" }: Props) {
  const { downloads, removeDownload } = useDownload();

  const filtered = searchQuery
    ? downloads.filter(
        ({ recording: r }) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : downloads;

  if (filtered.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Image className="w-16 h-16 opacity-30" tintColor="#6b7280" source={icons.download} />
        <Text className="text-textSecondary font-MonBold text-base text-center">
          No downloads yet
        </Text>
        <Text className="text-gray-500 font-MonRegular text-sm text-center">
          Save episodes for offline listening and they'll appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 4, paddingHorizontal: 8, paddingBottom: 30 }}
    >
      {filtered.map(({ recording }) => (
        <List
          key={recording.id}
          item={recording}
          hideDownload
          onRemove={(id) => removeDownload(id)}
        />
      ))}
    </ScrollView>
  );
}
