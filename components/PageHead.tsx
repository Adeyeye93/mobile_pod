import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import DropdownWrapper from "./dropdown";
import { useRssLink } from "./modals/RSSLink";
import { useSortFilter } from "./modals/Sort";

type PageHeadProps = {
  title: string;
  has_link?: boolean;
  iconsList?: string[];
  dropdownList?: string[];
};




const PageHead = ({
  title,
  has_link,
  iconsList,
  dropdownList,
}: PageHeadProps) => {
  const { ref } = useRssLink();
  const router = useRouter();
  const { ref: sortRef } = useSortFilter();

  const handleBack = async () => {
    if (ref.current?.close && sortRef.current?.close) {
      await ref.current.close();
      await sortRef.current.close();
      router.back(); // now go back
    } else {
      router.back();
    }
  };
  return (
    <View className="w-full p-2 flex flex-row items-center justify-between mt-16 pb-10 gap-6">
      <View className="flex flex-row items-center gap-6 flex-1">
        <Pressable
          onPress={() => handleBack()}
        >
          <Image source={icons.backPage} className="w-7 h-7" />
        </Pressable>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-textPrimary font-MonBold text-2xl">
            {title}
          </Text>
        </View>
      </View>
      <View className="flex w-fit h-full flex-row items-center gap-7 justify-end">
        {has_link && (
          <Pressable onPress={() => ref.current?.expand()}>
            <Image source={icons.link} className="w-7 h-7" />
          </Pressable>
        )}
        <DropdownWrapper
          options={dropdownList ? dropdownList : ["Share"]}
          iconPaths={iconsList ? iconsList : [icons.share]}
          onSelect={(value) => console.log(value)}
        >
          <Image source={icons.topMenu} className="w-7 h-7" />
        </DropdownWrapper>
      </View>
    </View>
  );
};

export default PageHead;
