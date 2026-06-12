import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { images } from '@/constants/image'
import PlayPauseButton from './playPauseButton';
import PodTitle from './PodTitle';
import { useAudio } from '@/context/AudioPlayerContext';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'expo-router';
import type { Recording } from '@/hook/useRecordings';

let timeClass = 'text-textSecondary font-MonRegular text-[11.5px]';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')} mins`;
}

let Comp = ({ item }: { item: Recording }) => {
  const router = useRouter();
  const { loadTrack, currentTrack, status, toggle } = useAudio();
  const { ref: playerRef } = usePlayer();

  const isThisTrack = currentTrack?.id === item.id;
  const isPlaying = isThisTrack && status.playing;

  const handlePlay = () => {
    if (isThisTrack) {
      // Already loaded — just toggle and show the player
      toggle();
      playerRef.current?.expand();
    } else {
      loadTrack({
        id: item.id,
        title: item.title,
        creatorName: item.creator_name ?? 'Unknown',
        creatorId: item.creator_id,
        thumbnail: item.thumbnail,
        creatorAvatar: item.creator_avatar,
        masterUrl: item.master_url,
        downloadUrl: item.download_url,
        durationSeconds: item.duration_seconds,
      });
      playerRef.current?.expand();
    }
  };

  return (
    <View className="w-full h-40 flex flex-row justify-between items-center gap-4">
      <View className="w-40 h-full rounded-[28px] overflow-hidden">
        <Image
          source={item.thumbnail ? { uri: item.thumbnail } : images.podDefault}
          className="h-full w-full object-cover"
        />
      </View>
      <View className="flex-1 flex flex-col justify-between items-start h-full">
        <PodTitle id={item.id} title={item.title} />
        <View className="flex-row items-center gap-5">
          <Pressable onPress={() => router.navigate(`/home/author/${item.creator_id}` as any)}>
            <Text className={timeClass}>{item.creator_name}</Text>
          </Pressable>
          <Text className={timeClass}>|</Text>
          <Text className={timeClass}>{formatDuration(item.duration_seconds)}</Text>
        </View>
        <PlayPauseButton Playing={isPlaying} Completed={false} onPlay={handlePlay} />
      </View>
    </View>
  );
}

interface PodListProps {
  data: Recording[];
  loading?: boolean;
}

const PodList = ({ data, loading = false }: PodListProps) => {
  if (loading) {
    return (
      <View className='w-full h-fit flex flex-col justify-start items-start mt-5 gap-6'>
        {[0, 1].map((i) => (
          <View key={i} className="w-full h-40 flex flex-row justify-between items-center gap-4">
            <View className="w-40 h-full rounded-[28px] bg-white/5" />
            <View className="flex-1 gap-3">
              <View className="h-4 rounded-full bg-white/5 w-4/5" />
              <View className="h-4 rounded-full bg-white/5 w-3/5" />
              <View className="h-8 rounded-full bg-white/5 w-24" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className='w-full h-fit flex flex-col justify-start items-start mt-5 gap-6'>
        <Text className="text-textSecondary font-MonRegular text-sm">No recordings yet</Text>
      </View>
    );
  }

  return (
    <View className='w-full h-fit flex flex-col justify-start items-start mt-5 gap-6'>
      {data.map((item) => (
        <Comp key={item.id} item={item} />
      ))}
    </View>
  )
}

export default PodList
