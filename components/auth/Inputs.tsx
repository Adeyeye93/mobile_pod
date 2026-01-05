import { icons } from "@/constants/icons";
import { useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";

interface InputProps {
  placeholder: string;
  [key: string]: any;
  secret_icon?: any;
  icon: any;
}

const Inputs = ({ placeholder, secret_icon, icon, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <View
      className={`border w-full h-20 flex flex-row items-center justify-between px-5 rounded-3xl ${
        isFocused
          ? "border-[#4169e1] bg-[#4169e111]"
          : "border-[#1f222b] bg-[#1f222b]"
      }`}
    >
      <Image
        source={icon}
        className="w-7 h-7"
        tintColor={isFocused ? "#4169e1" : "#9e9e9e"}
      ></Image>
      <TextInput
        placeholderTextColor={isFocused ? "#ffff" : "#9e9e9e"}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 h-full px-5 text-xl text-textSecondary font-MonMedium"
        placeholder={placeholder}
        {...props}
      />
      {secret_icon && (
        <Pressable onPress={() => setIsRevealed(!isRevealed)}>
          <Image
            source={isRevealed ? icons.reveal : icons.hide}
            className="w-7 h-7"
            tintColor={isFocused ? "#4169e1" : "#9e9e9e"}
          ></Image>
        </Pressable>
      )}
    </View>
  );
};

export default Inputs;
