import { icons } from "@/constants/icons";
import { images } from "@/constants/image";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";


const OPTIONS: VisibilityOption[] = [
  {
    key: "public",
    label: "Public",
    description: "Everyone can join and listen",
    icon: icons.globe, // Replace with actual globe icon
  },
  {
    key: "private",
    label: "Private",
    description: "Only the invited can listen",
    icon: icons.privat as ImageSourcePropType,
  },
];

const VisibilitySelector = ({
  value,
  onChange,
}: {
  value: any;
  onChange: (val: VisibilityOption) => void;
}) => {
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, width: "100%" }}>
      {OPTIONS.map((option) => {
        const isSelected = value === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option)}
            activeOpacity={0.8}
            style={{
              flex: 1,
              backgroundColor: "#1f2937",
              borderRadius: 16,
              paddingVertical: 15,
              paddingHorizontal: 0,
              alignItems: "center",
              gap: 10,
              borderWidth: 2,
              borderColor: isSelected ? "#4169e1" : "transparent",
            }}
          >
            {/* Icon circle */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
            >
              <Image
                // tintColor={"grey"}
                className="w-full h-full"
                source={option.icon}
              />
            </View>

            <Text
              className="font-MonBold"
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#fff",
                textAlign: "center",
              }}
            >
              {option.label}
            </Text>

            <Text
              className="font-MonRegular"
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                textAlign: "center",
              }}
            >
              {option.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default VisibilitySelector;
