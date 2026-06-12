import { View, Text } from "react-native";

const timeClass = "text-textSecondary font-MonRegular text-[11.5px]";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")} mins`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} mo ago`;
  return `${Math.floor(diff / 31536000)} yr ago`;
}

interface TimerProps {
  publishedAt?: string;
  durationSeconds?: number;
}

const Timer = ({ publishedAt, durationSeconds }: TimerProps) => {
  return (
    <View className="flex-row items-center gap-3">
      {publishedAt && (
        <Text className={timeClass}>{timeAgo(publishedAt)}</Text>
      )}
      {publishedAt && durationSeconds && (
        <Text className={timeClass}>|</Text>
      )}
      {durationSeconds != null && durationSeconds > 0 && (
        <Text className={timeClass}>{formatDuration(durationSeconds)}</Text>
      )}
    </View>
  );
};

export default Timer;
