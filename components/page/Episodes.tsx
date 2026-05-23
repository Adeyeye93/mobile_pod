import { Text, View } from 'react-native'
import PageHead from '../PageHead'

const Episodes = () => {
  return (
    <View className='h-full w-full -mt-10'>
      <PageHead title='Episodes' has_menu has_priv={false}/>
      <Text>Hello</Text>
    </View>
  )
}

export default Episodes