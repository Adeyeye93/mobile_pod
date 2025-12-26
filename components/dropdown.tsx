import { View, Pressable, Text, Image, ImageSourcePropType } from "react-native";
import { useState, ReactNode } from "react";

type DropdownWrapperProps = {
  children: ReactNode;
  options: string[];
  iconPaths?: ImageSourcePropType[]; // Add this
  onSelect?: (value: string) => void;
};

const DropdownWrapper = ({
  children,
  options,
  iconPaths,
  onSelect,
}: DropdownWrapperProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    setOpen(false);
    onSelect?.(value);
  };

  return (
    <View className="relative">
      {/* Trigger (ANY element) */}
      <Pressable onPress={() => setOpen(!open)}>{children}</Pressable>
      {/* Dropdown */}
      {open && (
        <View className="absolute h-fit w-52 right-0 top-7 z-50 bg-[#1f222b] overflow-hidden flex-col items-start justify-between flex rounded-3xl p-5">
          {options.map((option, index) => (
            <Pressable
              key={option}
              onPress={() => handleSelect(option)}
              className={`h-10 w-full flex flex-row gap-2 ${
                index !== options.length - 1
                  ? "border-b-hairline border-[#83838329]"
                  : ""
              } items-center justify-start gap-4`}
            >
              {iconPaths && iconPaths[index] && (
                <Image source={iconPaths[index]} className="h-6 w-6" />
              )}
              <Text
                numberOfLines={1}
                ellipsizeMode='tail'
                className="text-textPrimary font-MonMedium"
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default DropdownWrapper;
