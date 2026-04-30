import { View, Text } from 'react-native'
import React from 'react'

interface CommentProps {
  username: string;
  content: string;
  timestamp: string; // e.g. "2m ago"
}

const Comment: React.FC<CommentProps> = ({ username, content, timestamp }) => {
  return (
    <View className="flex flex-row items-start gap-3 mb-4">
      <View className="w-8 h-8 rounded-full bg-gray-400" />
      <View className="flex-1">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm font-MonMedium text-textPrimary">{username}</Text>
          <Text className="text-xs text-gray-500">{timestamp}</Text>
        </View>
        <Text className="text-sm mt-1 text-textSecondary font-MonBold">{content}</Text>
      </View>
    </View>
  );
};

export default Comment;

