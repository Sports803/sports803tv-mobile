import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { SupportActions } from "@/components/support-actions";
import { AdSlot, AD_UNITS } from "@/components/ad-slot";
import { fetchChannels, type LiveChannel } from "@/lib/sports";

export default function LiveTvScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try { setChannels(await fetchChannels()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load Live TV"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <ScreenContainer containerClassName="bg-background" className="px-4">
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#E0102A" />}
        ListHeaderComponent={<View style={{ paddingTop: 12, paddingBottom: 16 }}>
          <Text style={{ color: "#E0102A", fontWeight: "900", letterSpacing: 1.5, fontSize: 12 }}>SPORTS 803</Text>
          <Text style={{ color: "#F7F8FC", fontSize: 28, fontWeight: "900", marginTop: 4 }}>Live TV</Text>
          <Text style={{ color: "#9AA6BE", marginTop: 6 }}>Live channels from Firebase open in their original iframe player.</Text>
          <SupportActions />
          <AdSlot unitId={AD_UNITS.liveTvBanner} />
        </View>}
        renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/channel-player" as any, params: { channelId: item.id } })} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#11182A", borderColor: "#26314A", borderWidth: 1, padding: 14, borderRadius: 16, marginBottom: 10, opacity: pressed ? 0.8 : 1 })}>
          <View style={{ width: 58, height: 58, borderRadius: 14, overflow: "hidden", backgroundColor: "#17213A", alignItems: "center", justifyContent: "center" }}>{item.logo ? <Image source={{ uri: item.logo }} style={{ width: 58, height: 58 }} /> : <Text style={{ color: "#E0102A", fontSize: 24 }}>▶</Text>}</View>
          <View style={{ flex: 1 }}><Text style={{ color: "#F7F8FC", fontWeight: "800", fontSize: 16 }}>{item.name}</Text><Text style={{ color: "#9AA6BE", marginTop: 4 }}>{item.category || "Live channel"} · {item.sourceKind === "embed" ? "Iframe player" : "Direct stream"}</Text></View>
          <Text style={{ color: "#36D399", fontWeight: "900", fontSize: 11 }}>LIVE</Text>
        </Pressable>}
        ListEmptyComponent={loading ? <Text style={{ color: "#9AA6BE", paddingTop: 40 }}>Loading channels…</Text> : <View style={{ paddingTop: 40 }}><Text style={{ color: "#F7F8FC", fontWeight: "800" }}>No channels available</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>{error || "Add channels from the Event manager."}</Text></View>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </ScreenContainer>
  );
}
