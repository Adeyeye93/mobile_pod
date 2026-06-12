import { View } from 'react-native'
import Timer from '@/components/author/timer'
import PlayPauseButton from '../playPauseButton'
import PodTitle from '../PodTitle'
import { useAudio } from '@/context/AudioPlayerContext'
import { usePlayer } from '@/context/PlayerContext'
import { images } from '@/constants/image'
import type { CreatorEpisode } from '@/hook/useCreatorEpisodes'

interface PodsProps {
  episode: CreatorEpisode;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string | null;
}

const Pods = ({ episode, creatorId, creatorName, creatorAvatar }: PodsProps) => {
  const { loadTrack, toggle, status, currentTrack } = useAudio();
  const { ref } = usePlayer();

  const isThisTrack = currentTrack?.id === episode.id;
  const isPlaying = isThisTrack && status.playing;

  const handlePlay = async () => {
    if (isThisTrack) {
      toggle();
      ref.current?.expand();
    } else {
      await loadTrack({
        id: episode.id,
        title: episode.title,
        creatorName,
        creatorId,
        thumbnail: episode.thumbnail_url,
        creatorAvatar: creatorAvatar ?? null,
        masterUrl: episode.master_url,
        downloadUrl: episode.download_url,
        durationSeconds: episode.duration_seconds,
      });
      ref.current?.expand();
    }
  };

  return (
    <View className='w-full h-fit flex flex-col justify-start items-start gap-2'>
      <Timer publishedAt={episode.published_at} durationSeconds={episode.duration_seconds} />
      <PodTitle id={episode.id} title={episode.title} />
      <PlayPauseButton Playing={isPlaying} Completed={false} onPlay={handlePlay} />
    </View>
  );
};

export default Pods;
