import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import DropdownWrapper from "./dropdown";
import { useRssLink } from "./modals/RSSLink";
import { useSortFilter } from "./modals/Sort";
import PP from "./author/profile/PP";

type CustomIcon = {
  icon: any; // Image source
  onPress: () => void;
  testID?: string;
};

type PageHeadProps = {
  title?: string;
  has_link?: boolean;
  iconsList?: string[];
  dropdownList?: string[];
  has_menu?: boolean;
  has_profile?: boolean;
  customIcons?: CustomIcon[]; // Better name and proper typing
  premium?: boolean;
};

const PageHead = ({
  title,
  has_link,
  iconsList,
  dropdownList,
  has_menu,
  has_profile,
  customIcons,
  premium,
}: PageHeadProps) => {
  const { ref } = useRssLink();
  const router = useRouter();
  const { ref: sortRef } = useSortFilter();

  const handleBack = async () => {
    if (ref.current?.close && sortRef.current?.close) {
      await ref.current.close();
      await sortRef.current.close();
      router.back();
    } else {
      router.back();
    }
  };

  return (
    <View className="w-full p-2 flex flex-row items-center justify-between mt-12 pb-10 gap-6">
      {/* Left Section - Back/Profile + Title */}
      <View className="flex flex-row items-center gap-6 flex-1">
        {!has_profile && (
          <Pressable onPress={handleBack}>
            <Image source={icons.backPage} className="w-7 h-7" />
          </Pressable>
        )}
        {has_profile && <PP />}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-textPrimary font-MonBold text-2xl"
          >
            {title}
          </Text>
        </View>
      </View>

      {/* Right Section - Action Icons */}
      <View className="flex w-fit h-full flex-row items-center gap-4 justify-end">
        {premium && (
          <Pressable onPress={() => console.log("user wants to use premium")}>
            <Image source={icons.premium} className="w-7 h-7" />
          </Pressable>
        )}
        {/* RSS Link Icon */}
        {has_link && (
          <Pressable onPress={() => ref.current?.expand()}>
            <Image source={icons.link} className="w-7 h-7" />
          </Pressable>
        )}

        {/* Menu Dropdown */}
        {has_menu && (
          <DropdownWrapper
            options={dropdownList || ["Share"]}
            iconPaths={iconsList || [icons.share]}
            onSelect={(value) => console.log(value)}
          >
            <Image source={icons.topMenu} className="w-7 h-7" />
          </DropdownWrapper>
        )}

        {/* Custom Icons */}
        {customIcons && customIcons.length > 0 && (
          <View className="flex-row items-center gap-4">
            {customIcons.map((customIcon, index) => (
              <Pressable
                key={index}
                onPress={customIcon.onPress}
                testID={customIcon.testID}
              >
                <Image
                  source={customIcon.icon}
                  tintColor="#E4E7EC"
                  className="w-7 h-7"
                />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default PageHead;
