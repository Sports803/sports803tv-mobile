import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
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
  const [immersive, setImmersive] = useState(false);
  useEffect(() => { void fetchChannels().then(setChannels); }, []);

  const channel = channels.find((item) => item.id === channelId);
  const directVideoSource = channel?.sourceKind === "video" ? channel.src : null;
  const player = useVideoPlayer(directVideoSource, (instance) => { if (directVideoSource) instance.play(); });

  const playerView = channel ? channel.sourceKind === "video" ? (
    <VideoView player={player} style={{ width: "100%", aspectRatio: 16 / 9 }} contentFit="contain" allowsFullscreen allowsPictureInPicture />
  ) : <IframePlayer uri={channel.src} /> : <Text style={{ color: "#9AA6BE", textAlign: "center" }}>Loading channel…</Text>;
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-black" className="px-3">
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Close channel player"><Text style={{ color: "#F7F8FC", fontSize: 30 }}>‹</Text></Pressable>
        <Text style={{ color: "#F7F8FC", fontWeight: "900", marginLeft: 12 }}>{channel?.name || "Live TV"}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={{ width: "100%", aspectRatio: 16 / 9 }}>{playerView}</View>
        {channel ? <Pressable onPress={() => setImmersive(true)} style={({ pressed }) => ({ alignSelf: "center", backgroundColor: "#17213A", borderColor: "#26314A", borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginTop: 12, opacity: pressed ? 0.8 : 1 })} accessibilityLabel="Open full screen player"><Text style={{ color: "#F7F8FC", fontWeight: "800" }}>⛶ Full screen</Text></Pressable> : null}
        <SupportActions compact />
      </View>
      <AdSlot unitId={AD_UNITS.liveTvBanner} label="Live TV sponsor" />
      <Modal visible={immersive} onRequestClose={() => setImmersive(false)} animationType="fade" supportedOrientations={["portrait", "landscape"]}>
        <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}>
          <View style={{ position: "absolute", zIndex: 2, top: 44, right: 18 }}><Pressable onPress={() => setImmersive(false)} style={{ backgroundColor: "rgba(20,27,44,0.92)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }} accessibilityLabel="Exit full screen"><Text style={{ color: "#F7F8FC", fontWeight: "800" }}>Done</Text></Pressable></View>
          <View style={{ width: "100%", aspectRatio: 16 / 9 }}>{channel?.sourceKind === "video" ? <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="contain" allowsFullscreen allowsPictureInPicture /> : channel ? <IframePlayer uri={channel.src} /> : null}</View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
