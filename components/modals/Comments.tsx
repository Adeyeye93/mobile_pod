import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { emojis } from "@/constants/emoji";
import {
  CommentsSheetContext,
  Sheet,
  useCommentsSheet,
} from "@/context/CreateSheetContext";
import { Image, Pressable, Text, View, TextInput } from "react-native";

const textClass = "py-2 px-4  bg-gray-700 rounded-3xl flex-row items-center";
const emojiClass = "p-2 bg-gray-700 rounded-2xl flex-row items-center";

const Comments = () => {
  const { ref: sheetRef } = useCommentsSheet();

  return (
    <Sheet context={CommentsSheetContext} snapPoints={[0.1, 500, 10000]}>
      <View className="w-full flex-col items-center justify-start mt-14">
        <View className="w-full h-16 flex-row items-center pl-6">
          <Pressable
            onPress={() => sheetRef.current?.collapse()}
            className="justify-self-end"
          >
            <Image className="w-6 h-6" source={icons.close_modal}></Image>
          </Pressable>
          <View className="flex-1 h-full flex-row mr-2">
            <View className="flex-1 h-full flex-col items-end justify-between p-2">
              <Text
                numberOfLines={1}
                className=" text-textSecondary font-MonBold text-xs text-end"
              >
                654: Deep Dive | How to Quit Your Job the Right Way
              </Text>
              <Text
                numberOfLines={1}
                className=" text-textSecondary font-MonBold text-xs text-end"
              >
                Ted TAlk | Official
              </Text>
            </View>
            <Image
              source={images.pod1}
              style={{
                width: 50,
                height: 50,
              }}
            />
          </View>
        </View>
        <View className="w-full h-3/4"></View>
        <View className="h-36 w-full mb-20 flex-col items-center justify-between">
          <View className="w-full flex-row items-center justify-between px-3 pt-2 ">
            <View className={textClass}>
              <Text className="text-textSecondary font-MonMedium">Hello</Text>
            </View>
            <View className="py-2 px-4 bg-gray-700 rounded-3xl flex-row items-center">
              <Text className="text-textSecondary font-MonMedium">Hi!</Text>
            </View>
            <View className={emojiClass}>
              <Image className="w-6 h-6" source={emojis.emoji} />
            </View>
            <View className={emojiClass}>
              <Image className="w-6 h-6" source={emojis.emoji1} />
            </View>
            <View className={emojiClass}>
              <Image className="w-6 h-6" source={emojis.sad} />
            </View>
            <View className={emojiClass}>
              <Image className="w-6 h-6" source={emojis.surprised} />
            </View>
            <View className={emojiClass}>
              <Image className="w-6 h-6" source={emojis.explosion} />
            </View>
            <View className={emojiClass}>
              <Image className="w-6 h-6" source={emojis.happyFace} />
            </View>
          </View>
          <View className="w-full h-20 flex-row items-center justify-center gap-10">
            <TextInput
              className="h-12 w-3/5 bg-[#63636332] rounded-3xl pl-5 text-textSecondary font-MonMedium"
              placeholder="Comment"
              placeholderTextColor="#ffffff99"
            />
            <View className="p-3 rounded-3xl bg-[#63636332]">
              <Image className="w-5 h-5" source={icons.send} />
            </View>
          </View>
        </View>
      </View>
    </Sheet>
  );
};

export default Comments;
