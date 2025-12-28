import { View, Text } from "react-native";

type EpisodeDescriptionProps = {
  title: string;
  description: string;
  bulletPoints: string[];
  resourcesUrl?: string;
  reviewUrl?: string;
};

export default function EpisodeDescription({
  title,
  description,
  bulletPoints,
  resourcesUrl,
  reviewUrl,
}: EpisodeDescriptionProps) {
  return (
    <View className="p-4">
      {/* Description */}
      <Text className="text-textPrimary text-base leading-relaxed mb-4 font-MonRegular">
        {description}
      </Text>

      {/* Title */}
      <Text className="text-textPrimary text-lg mb-3 font-MonBold">
        {title}
      </Text>

      {/* Bullet points */}
      <View className="mb-4">
        {bulletPoints.map((point, index) => (
          <Text
            key={index}
            className="text-textPrimary text-base leading-relaxed mb-2 font-MonMedium"
          >
            • {point}
          </Text>
        ))}
      </View>

      {/* Resources link */}
      {resourcesUrl && (
        <Text className="text-textPrimary text-base mb-2 font-MonRegular">
          Full show notes and resources can be found here:{" "}
          <Text className="text-purple-500">{resourcesUrl}</Text>
        </Text>
      )}

      {/* Review link */}
      {reviewUrl && (
        <Text className="text-textPrimary text-base font-MonRegular">
          Like this show? Please leave us a review{" "}
          <Text className="text-purple-500">here</Text>
        </Text>
      )}
    </View>
  );
}
