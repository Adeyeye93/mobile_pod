import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import PageHead from '@/components/PageHead';
import ChannelList from '@/components/ChannelList';
import Divider from '@/components/divider';
const subscriptions = () => {
  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, minHeight: "100%" }}
      >
        <PageHead title="Subscriptions" has_link={true} />
        <ChannelList />
        <Divider value={200} gap={15} />
        <ChannelList />
        <Divider value={200} gap={15} />
        <ChannelList />
        <Divider value={200} gap={15} />
        <ChannelList />
        <Divider value={200} gap={15} />
        <ChannelList />
        <Divider value={200} gap={15} />
      </ScrollView>
    </View>
  );
}

export default subscriptions