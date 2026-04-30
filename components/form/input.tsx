import { View, Text, TextInput, Pressable, Image } from "react-native";
import React from "react";

interface InputProps {
  placeholder?: string;
  label?: string;
  textArea?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean; // ✅ lowercase, standard naming
  asAction?: boolean;
  actionFun?: () => void;
  actionImage?: any;
}

const Input = ({
  placeholder,
  label,
  textArea,
  value,
  onChangeText,
  editable = true, // ✅ defaults to true
  asAction,
  actionFun,
  actionImage,
}: InputProps) => {
  const uneditableBg = !editable ? "bg-[#2a2d35]" : "bg-[#40434d]";
  const uneditableText = !editable ? "text-gray-500" : "text-textSecondary";
    const uneditablePlaceHolder = !editable
      ? "placeholder:text-[#ffffff29] "
      : "placeholder:text-gray-200 ";


  return (
    <View className="w-full flex flex-col">
      <Text className="font-MonBold text-textSecondary mb-1">{label}</Text>
      {textArea ? (
        <TextInput
          className={`${uneditableBg} ${uneditableText} ${uneditablePlaceHolder} rounded-xl py-2 px-3 h-32 placeholder:font-MonMedium font-MonBold text-start`}
          placeholder={placeholder}
          multiline
          style={{ textAlignVertical: "top" }}
          numberOfLines={4}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
      ) : (
        <View
          className={`${uneditableBg} rounded-xl py-2 px-6 h-14 flex flex-row items-center justify-between`}
        >
          <TextInput
            className={`${uneditableText} ${uneditablePlaceHolder} h-14 placeholder:font-MonMedium font-MonBold flex-1`}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
          />
          {asAction && (
            <Pressable
              className="h-full w-8 items-center justify-center"
              onPress={actionFun}
            >
              <Image className="w-7 h-7" source={actionImage} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};
export default Input;
