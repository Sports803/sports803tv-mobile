import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

import { ScreenContainer } from "@/components/screen-container";
import { SupportActions } from "@/components/support-actions";
import { AdSlot, AD_UNITS } from "@/components/ad-slot";
import { IframePlayer } from "@/components/iframe-player";
import { fetchChannels, type LiveChannel } from "@/lib/sports";

export default function ChannelPlayerScreen() {
  const router = useRouter();
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  useEffect(() => { void fetchChannels().then(setChannels); }, []);

  const channel = channels.find((item) => item.id === channelId);
  const directVideoSource = channel?.sourceKind === "video" ? channel.src : null;
  const player = useVideoPlayer(directVideoSource, (instance) => { if (directVideoSource) instance.play(); });

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black" className="px-3">
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Close channel player"><Text style={{ color: "#F7F8FC", fontSize: 30 }}>‹</Text></Pressable>
        <Text style={{ color: "#F7F8FC", fontWeight: "900", marginLeft: 12 }}>{channel?.name || "Live TV"}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center" }}>
        {channel ? channel.sourceKind === "video" ? (
          <VideoView player={player} style={{ width: "100%", aspectRatio: 16 / 9 }} contentFit="contain" allowsFullscreen allowsPictureInPicture />
        ) : (
          <View style={{ width: "100%", aspectRatio: 16 / 9 }}><IframePlayer uri={channel.src} /></View>
        ) : <Text style={{ color: "#9AA6BE", textAlign: "center" }}>Loading channel…</Text>}
        <SupportActions compact />
      </View>
      <AdSlot unitId={AD_UNITS.liveTvBanner} label="Live TV sponsor" />
    </ScreenContainer>
  );
}
