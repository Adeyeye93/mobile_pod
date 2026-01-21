import { icons } from "@/constants/icons";
import { usePlayListContent, usePlayListModal } from "@/context/ModalIntances";
import { ScrollView } from "react-native";
import Grid from "./OrderStyle/Grid";

export default function Playlists({ color }: any) {
  const { open } = usePlayListModal();
  const { setData, setLoading, setError, setTittle } = usePlayListContent();

  const handlePress = async ({ tittle }: { tittle: string }) => {
    setLoading(true);
    try {
      setTittle(tittle);
      const result = "data"; // await fetchData();
      setData(result);
      open();
    } catch (err) {
      // setError(err.message);
      open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flexWrap: "wrap",
        gap: 25,
        padding: 12,
      }}
      className=""
    >
      <Grid
        color={color}
        icon={icons.saved}
        use_icon
        Type="Liked Podcasts"
        onPress={() => handlePress({ tittle: "Liked Podcasts" })}
      />
      <Grid
        onPress={() => handlePress({ tittle: "Archive" })}
        color={color}
        icon={icons.arc}
        use_icon
        Type="Archive"
      />
      <Grid
        color={color}
        icon={icons.recentplayed}
        use_icon
        Type="Listen Later"
        onPress={() => handlePress({ tittle: "Listen Later" })}
      />
      <Grid
        color={color}
        icon={icons.playlater}
        use_icon
        Type="Recently Played"
        onPress={() => handlePress({ tittle: "Recently Played" })}
      />
      <Grid
        non_icon
        author="TED TALK"
        onPress={() => handlePress({ tittle: "TED TALK" })}
      />
    </ScrollView>
  );
}
