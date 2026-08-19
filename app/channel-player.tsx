import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useVideoPlayer, VideoView } from "expo-video";
import { fetchChannels, type LiveChannel } from "@/lib/sports";
import { AdSlot, AD_UNITS } from "@/components/ad-slot";

export default function ChannelPlayerScreen() {
  const router = useRouter(); const { channelId } = useLocalSearchParams<{ channelId: string }>(); const [channels, setChannels] = useState<LiveChannel[]>([]);
  useEffect(() => { void fetchChannels().then(setChannels); }, []);
  const channel = channels.find((item) => item.id === channelId); const player = useVideoPlayer(channel?.src || null, (instance) => { if (channel?.src) instance.play(); });
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black" className="px-3"><View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}><Pressable onPress={() => router.back()} accessibilityLabel="Close channel player"><Text style={{ color: "#F7F8FC", fontSize: 30 }}>‹</Text></Pressable><Text style={{ color: "#F7F8FC", fontWeight: "900", marginLeft: 12 }}>{channel?.name || "Live TV"}</Text></View><View style={{ flex: 1, justifyContent: "center" }}>{channel ? <VideoView player={player} style={{ width: "100%", aspectRatio: 16 / 9 }} contentFit="contain" allowsFullscreen allowsPictureInPicture /> : <Text style={{ color: "#9AA6BE", textAlign: "center" }}>Loading channel…</Text>}</View><AdSlot unitId={AD_UNITS.liveTvBanner} label="Live TV sponsor" /></ScreenContainer>;
}
