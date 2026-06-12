import { View, Image } from 'react-native'
import { images } from '@/constants/image'

type CreatorCoverProps = {
  creators: string[] // array of avatar URLs; empty/missing → placeholder
}

const AVATAR_LG = 64
const AVATAR_SM = 44
const BG = '#1f222b'

function src(url: string | undefined) {
  return url ? { uri: url } : images.chaDefault
}

const CreatorCover = ({ creators }: CreatorCoverProps) => {
  const count = creators.filter(Boolean).length

  return (
    <View
      className="relative items-center justify-center rounded-xl"
      style={{ backgroundColor: BG, width: 100, height: 100 }}
    >
      {/* Single creator */}
      {count <= 1 && (
        <Image
          source={src(creators[0])}
          style={{ width: AVATAR_LG, height: AVATAR_LG, borderRadius: AVATAR_LG / 2 }}
          className="border-2 border-[#2a2f3a]"
        />
      )}

      {/* Two creators */}
      {count === 2 && (
        <View className="flex-row items-center">
          <Image
            source={src(creators[0])}
            style={{ width: AVATAR_SM, height: AVATAR_SM, borderRadius: AVATAR_SM / 2 }}
            className="border-2 border-[#2a2f3a] z-10"
          />
          <Image
            source={src(creators[1])}
            style={{ width: AVATAR_SM, height: AVATAR_SM, borderRadius: AVATAR_SM / 2, marginLeft: -12 }}
            className="border-2 border-[#2a2f3a]"
          />
        </View>
      )}

      {/* Three or more creators */}
      {count >= 3 && (
        <>
          <Image
            source={src(creators[0])}
            style={{
              width: AVATAR_SM, height: AVATAR_SM,
              borderRadius: AVATAR_SM / 2,
              position: 'absolute', left: -AVATAR_SM * 0.1,
            }}
            className="border-2 border-[#2a2f3a]"
          />
          <Image
            source={src(creators[1])}
            style={{ width: AVATAR_LG, height: AVATAR_LG, borderRadius: AVATAR_LG / 2 }}
            className="border-2 border-[#2a2f3a] z-10"
          />
          <Image
            source={src(creators[2])}
            style={{
              width: AVATAR_SM, height: AVATAR_SM,
              borderRadius: AVATAR_SM / 2,
              position: 'absolute', right: -AVATAR_SM * 0.1,
            }}
            className="border-2 border-[#2a2f3a]"
          />
        </>
      )}
    </View>
  )
}

export default CreatorCover
