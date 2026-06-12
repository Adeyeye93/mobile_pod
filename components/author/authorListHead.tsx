import { useSortFilter } from "@/components/modals/Sort";
import { icons } from "@/constants/icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

const AuthorListHead = ({ episodeCount }: { episodeCount?: number }) => {
  const { ref } = useSortFilter();
  return (
    <View className="w-full h-fit flex flex-row items-center justify-between mt-7">
      <Text className="text-textPrimary font-MonBold text-lg mb-2">
        {episodeCount != null ? `${episodeCount} Episodes` : "Episodes"}
      </Text>
      <TouchableOpacity onPress={() => ref.current?.expand()}>
        <Image source={icons.sort} className="h-5 w-5" />
      </TouchableOpacity>
    </View>
  );
};

export default AuthorListHead;
