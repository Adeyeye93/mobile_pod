import { View, ScrollView } from 'react-native'
import PageHead from '@/components/PageHead';
import Head from '@/components/author/head';
import Divider from '@/components/divider';
import AuthorListHead from '@/components/author/authorListHead';
import Pods from '@/components/author/pods';
import { icons } from '@/constants/icons';

const Author = () => {
  return (
    <View className="flex-1 bg-background px-4">
      <PageHead title="Author" iconsList={[icons.share, icons.rss, icons.report]} dropdownList={["Share", "View RSS feed", "Report"]} />
      <Head authorDetails />
      <AuthorListHead />

      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, minHeight: "100%" }}
      >
      <Divider value={385} gap={25} />
      <Pods />
      <Divider value={385} gap={25} />
      <Pods />
      <Divider value={385} gap={25} />
      <Pods />
      <Divider value={385} gap={25} />
      <Pods />
      <Divider value={385} gap={25} />
      <Pods />
      <Divider value={385} gap={25} />
      <Pods />
      <Divider value={385} gap={25} />
      <Pods />
      </ScrollView>
    </View>
  );
}

export default Author;