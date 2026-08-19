import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { SupportActions } from "@/components/support-actions";
import { AdSlot, AD_UNITS } from "@/components/ad-slot";
import { OwnerBanner } from "@/components/owner-banner";
import { fetchOwnerControls } from "@/lib/owner-config";
import { ownerAdEnabled, ownerChannelOverride, ownerRankedChannels, type OwnerControlMap } from "@/lib/owner-control-contract";
import { fetchChannels, type LiveChannel } from "@/lib/sports";

export default function LiveTvScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownerControls, setOwnerControls] = useState<OwnerControlMap>({});
  const load = useCallback(async (force = false) => {
    setError("");
    try { const [nextChannels, nextControls] = await Promise.all([fetchChannels(), fetchOwnerControls(force)]); setChannels(nextChannels); setOwnerControls(nextControls); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load Live TV"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visibleChannels = useMemo(() => ownerRankedChannels(channels, ownerControls), [channels, ownerControls]);

  return (
    <ScreenContainer containerClassName="bg-background" className="px-4">
      <FlatList
        data={visibleChannels}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(true); }} tintColor="#E0102A" />}
        ListHeaderComponent={<View style={{ paddingTop: 12, paddingBottom: 16 }}>
          <Text style={{ color: "#E0102A", fontWeight: "900", letterSpacing: 1.5, fontSize: 12 }}>SPORTS 803</Text>
          <Text style={{ color: "#F7F8FC", fontSize: 28, fontWeight: "900", marginTop: 4 }}>Live TV</Text>
          <Text style={{ color: "#9AA6BE", marginTop: 6 }}>Live channels from Firebase open in their original iframe player.</Text>
          <OwnerBanner controls={ownerControls} />
          <SupportActions />
          {ownerAdEnabled(ownerControls, "liveTvBanner") ? <AdSlot unitId={AD_UNITS.liveTvBanner} /> : null}
        </View>}
        renderItem={({ item }) => { const owner = ownerChannelOverride(ownerControls, item.id); const availability = owner.reliability === "offline" ? "OFFLINE" : owner.reliability === "issues" ? "CHECK STREAM" : "LIVE"; const availabilityColor = owner.reliability === "offline" ? "#9AA6BE" : owner.reliability === "issues" ? "#F4B740" : "#36D399"; return <Pressable onPress={() => router.push({ pathname: "/channel-player" as any, params: { channelId: item.id } })} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#11182A", borderColor: owner.reliability === "issues" ? "#F4B740" : "#26314A", borderWidth: 1, padding: 14, borderRadius: 16, marginBottom: 10, opacity: pressed ? 0.8 : 1 })}>
          <View style={{ width: 58, height: 58, borderRadius: 14, overflow: "hidden", backgroundColor: "#17213A", alignItems: "center", justifyContent: "center" }}>{item.logo ? <Image source={{ uri: item.logo }} style={{ width: 58, height: 58 }} /> : <Text style={{ color: "#E0102A", fontSize: 24 }}>▶</Text>}</View>
          <View style={{ flex: 1 }}><View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}><Text style={{ color: "#F7F8FC", fontWeight: "800", fontSize: 16, flexShrink: 1 }}>{item.name}</Text>{owner.featured ? <Text style={{ color: "#F4B740", fontWeight: "900", fontSize: 10 }}>FEATURED</Text> : null}</View><Text style={{ color: "#9AA6BE", marginTop: 4 }}>{item.category || "Live channel"} · {item.sourceKind === "embed" ? "Iframe player" : "Direct stream"}</Text>{owner.note ? <Text style={{ color: availabilityColor, marginTop: 3, fontSize: 11 }} numberOfLines={1}>{owner.note}</Text> : null}</View>
          <Text style={{ color: availabilityColor, fontWeight: "900", fontSize: 11 }}>{availability}</Text>
        </Pressable>; }}
        ListEmptyComponent={loading ? <Text style={{ color: "#9AA6BE", paddingTop: 40 }}>Loading channels…</Text> : <View style={{ paddingTop: 40 }}><Text style={{ color: "#F7F8FC", fontWeight: "800" }}>No channels available</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>{error || "Add channels from the Event manager."}</Text></View>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </ScreenContainer>
  );
}
