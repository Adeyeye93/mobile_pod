import { View, ScrollView  } from 'react-native'
import React from 'react'
import PageHead from '@/components/PageHead';
import PodList from '@/components/PodList';
import SectionHeader from '@/components/SectionHeader';
import Spacer from '@/components/spacer';


const Notification = () => {
  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, minHeight: "100%" }}
      >
        <PageHead title="Notifications" />
      <SectionHeader title="New Podcast Released Today" action="More" />
      <PodList Playing={false} Completed={true} />
      <Spacer value={20} />
      <SectionHeader title="Yesterday" action="More" />
      <PodList Playing={false} Completed={false} />
      </ScrollView>
      
    </View>
  );
}

export default Notification