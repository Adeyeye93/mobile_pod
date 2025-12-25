import { View, Image } from 'react-native'

type CreatorCoverProps = {
  creators: any[] // array of image sources
}

const AVATAR_LG = 64
const AVATAR_SM = 44

const CreatorCover = ({ creators }: CreatorCoverProps) => {
  const count = creators.length

  return (
    <View
      className="relative items-center justify-center rounded-lg"
      style={{
        backgroundColor: '#F4D58D',
        width: 100,
        height: 100,
      }}
    >
      {/* CASE 1: Single creator */}
      {count === 1 && (
        <Image
          source={creators[0]}
          style={{
            width: AVATAR_LG,
            height: AVATAR_LG,
            borderRadius: AVATAR_LG / 2,
          }}
          className="border-2 border-white"
        />
      )}

      {/* CASE 2: Two creators */}
      {count === 2 && (
        <View className="flex-row items-center">
          <Image
            source={creators[0]}
            style={{
              width: AVATAR_SM,
              height: AVATAR_SM,
              borderRadius: AVATAR_SM / 2,
            }}
            className="border-2 border-white z-10"
          />
          <Image
            source={creators[1]}
            style={{
              width: AVATAR_SM,
              height: AVATAR_SM,
              borderRadius: AVATAR_SM / 2,
              marginLeft: -12,
            }}
            className="border-2 border-white"
          />
        </View>
      )}

      {/* CASE 3: Three or more creators */}
      {count >= 3 && (
        <>
          {/* Left (overflow 10%) */}
          <Image
            source={creators[0]}
            style={{
              width: AVATAR_SM,
              height: AVATAR_SM,
              borderRadius: AVATAR_SM / 2,
              position: 'absolute',
              left: -AVATAR_SM * 0.1,
            }}
            className="border-2 border-white"
          />

          {/* Center (dominant) */}
          <Image
            source={creators[1]}
            style={{
              width: AVATAR_LG,
              height: AVATAR_LG,
              borderRadius: AVATAR_LG / 2,
            }}
            className="border-2 border-white z-10"
          />

          {/* Right (overflow 10%) */}
          <Image
            source={creators[2]}
            style={{
              width: AVATAR_SM,
              height: AVATAR_SM,
              borderRadius: AVATAR_SM / 2,
              position: 'absolute',
              right: -AVATAR_SM * 0.1,
            }}
            className="border-2 border-white"
          />
        </>
      )}
    </View>
  )
}

export default CreatorCover
