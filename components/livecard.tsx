import { View, Text, Image, Pressable } from "react-native";
import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import { LivePulse } from "./LivePulse";
import CreatorCover from "./CreatorCover";
import LiveChannelName from "./LiveChannelName";

const timeClass = "text-textSecondary font-MonMedium text-sm";

const listenerImageClass = "w-8 h-8 rounded-full -ml-3 border border-[#1E4D5F]";

const Livecard = () => {
  return (
    <View className="flex-col gap-2 mt-2 w-full">
      {/* LIVE LABEL (SHOUT) */}
      <View className="flex-row items-center gap-2 px-1">
        <LivePulse />
        <Text className="text-xs font-semibold tracking-wide text-cyan-400">
          LIVE
        </Text>
      </View>

      {/* CARD */}
      <Pressable className="w-full rounded-xl bg-[#1E4D5F] px-3 py-3">
        {/* TOP SECTION */}
        <View className="flex-row justify-between items-start">
          <View className="flex-row gap-4 flex-1">
            {/* COVER */}
            <CreatorCover
              creators={[
                images.profile1,
                images.profile2,
                images.profile3,
                images.profile4, // ignored if >3
              ]}
            />

            {/* TITLE + META */}
            <View className="flex-1">
              <Text
                numberOfLines={2}
                className="font-MonBold text-textPrimary text-lg"
              >
                Holy Fire (Live) radio
              </Text>

               <LiveChannelName />

              <View className="flex-row items-center gap-2 mt-1">
                <Text className={timeClass}>Pod</Text>
                <Text className={timeClass}>•</Text>
                <Text className={timeClass}>52:27 mins</Text>
              </View>
            </View>
          </View>

          {/* MENU */}
          <Image source={icons.menu} className="w-6 h-6 opacity-80" />
        </View>

        {/* LISTENERS (WHISPER) */}
        <View className="flex-row items-center gap-2 mt-4">
          <View className="flex-row items-center">
            <Image source={images.profile1} className="w-8 h-8 rounded-full" />
            <Image source={images.profile2} className={listenerImageClass} />
            <Image source={images.profile3} className={listenerImageClass} />
            <Image source={images.profile4} className={listenerImageClass} />
            <Image source={images.profile5} className={listenerImageClass} />
          </View>

          <Text className="text-textPrimary font-MonMedium">
            +3.8k{" "}
            <Text className="text-secondary font-MonRegular text-sm">
              listening
            </Text>
          </Text>
        </View>

        {/* ACTION AREA (WHISPER, NOT SHOUT) */}
        <View className="mt-4 h-12 rounded-lg border border-white/10 flex-row items-center justify-center">
          <Text className="text-textPrimary font-MonMedium">
            Tap to join live
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default Livecard;
