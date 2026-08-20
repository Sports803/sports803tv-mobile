import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AdSlot, AD_UNITS } from "@/components/ad-slot";
import { IframePlayer } from "@/components/iframe-player";
import { ScreenContainer } from "@/components/screen-container";
import { useExitInterstitial } from "@/lib/interstitial";
import { addHistory, getFavorites, getPrediction, savePrediction, saveReminder, saveStreamReport, toggleFavorite, type MatchPrediction } from "@/lib/local";
import { matchCenterAvailability } from "@/lib/match-center";
import { scheduleMatchReminder } from "@/lib/notifications";
import { exportMatchToCalendar } from "@/lib/calendar";
import { categoryLabel, eventStatus, eventTime, fetchEvents, playable, type SportsEvent } from "@/lib/sports";
import { shareEvent } from "@/lib/sharing";
import { trackAnalytics } from "@/lib/analytics";

const palette = {
  background: "#080C18",
  surface: "#11182A",
  elevated: "#17213A",
  text: "#F7F8FC",
  muted: "#9AA6BE",
  red: "#E0102A",
  green: "#36D399",
  gold: "#F4B740",
  border: "#26314A",
};

function TeamLogo({ uri, size = 56 }: { uri?: string; size?: number }) {
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: palette.elevated }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: palette.elevated, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: palette.muted, fontSize: size * 0.42 }}>⚽</Text>
    </View>
  );
}

function statusDetails(event: SportsEvent) {
  const status = eventStatus(event);
  if (status === "live") return { label: "LIVE NOW", color: palette.red };
  if (status === "ended") return { label: "ENDED", color: palette.muted };
  return { label: "UPCOMING", color: palette.green };
}

function scoreText(event: SportsEvent) {
  if (event.scoreHome || event.scoreAway) return `${event.scoreHome || "-"}  –  ${event.scoreAway || "-"}`;
  return event.score && event.score !== "- -" ? event.score : "—  –  —";
}

function formatKickoff(event: SportsEvent) {
  if (!event.kickoff) return "Time not available";
  return new Date(event.kickoff).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function RecommendedCard({ event, onOpen }: { event: SportsEvent; onOpen: () => void }) {
  const status = statusDetails(event);
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => ({ width: 188, backgroundColor: palette.elevated, borderColor: palette.border, borderWidth: 1, borderRadius: 16, padding: 12, marginRight: 10, opacity: pressed ? 0.82 : 1 })} accessibilityRole="button" accessibilityLabel={`Open recommended event ${event.homeName} versus ${event.awayName}`}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.color }} /><Text style={{ color: status.color, fontSize: 10, fontWeight: "900" }}>{status.label}</Text></View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <View style={{ flex: 1, alignItems: "center" }}><TeamLogo uri={event.homeLogo} size={32} /><Text style={{ color: palette.text, fontSize: 11, fontWeight: "800", textAlign: "center", marginTop: 5 }} numberOfLines={2}>{event.homeName}</Text></View>
        <Text style={{ color: palette.muted, fontSize: 10, fontWeight: "900" }}>VS</Text>
        <View style={{ flex: 1, alignItems: "center" }}><TeamLogo uri={event.awayLogo} size={32} /><Text style={{ color: palette.text, fontSize: 11, fontWeight: "800", textAlign: "center", marginTop: 5 }} numberOfLines={2}>{event.awayName || "Broadcast"}</Text></View>
      </View>
      <Text style={{ color: palette.muted, fontSize: 10, marginTop: 10 }} numberOfLines={1}>{event.competitionLabel || event.leagueName || categoryLabel(event.category)}</Text>
    </Pressable>
  );
}

export default function PlayerScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [error, setError] = useState("");
  const [immersive, setImmersive] = useState(false);
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const { showOnExit } = useExitInterstitial();
  const streamStartedRef = useRef("");
  const streamErrorRef = useRef("");

  useEffect(() => { void fetchEvents().then(setEvents).catch((e) => setError(e instanceof Error ? e.message : "Could not load event")); }, []);
  useEffect(() => { const timer = setInterval(() => { void fetchEvents().then(setEvents).catch(() => undefined); }, 30_000); return () => clearInterval(timer); }, []);
  const event = events.find((item) => item.id === eventId);
  useEffect(() => { if (event) { void addHistory(event.id); void getFavorites().then((list) => setFavorite(list.includes(event.id))); void getPrediction(event.id).then(setPrediction); } }, [event]);
  const source = useMemo(() => event?.channels[sourceIndex]?.src || playable(event || ({} as SportsEvent)), [event, sourceIndex]);
  const recommendations = useMemo(() => {
    if (!event) return [];
    return events.filter((item) => item.id !== event.id && ["live", "upcoming"].includes(eventStatus(item))).sort((a, b) => eventStatus(a) === "live" ? -1 : eventStatus(b) === "live" ? 1 : eventTime(a) - eventTime(b)).slice(0, 8);
  }, [event, events]);
  const status = event ? statusDetails(event) : { label: "", color: palette.muted };
  const leave = useCallback(() => { showOnExit(); router.back(); }, [router, showOnExit]);
  useEffect(() => { const subscription = BackHandler.addEventListener("hardwareBackPress", () => { leave(); return true; }); return () => subscription.remove(); }, [leave]);
  useEffect(() => { if (event) void trackAnalytics("player_open", { eventId: event.id, category: event.category }); }, [event]);
  const reportStreamStart = useCallback(() => {
    if (!event) return;
    const streamKey = `${event.id}:${sourceIndex}`;
    if (streamStartedRef.current === streamKey) return;
    streamStartedRef.current = streamKey;
    void trackAnalytics("stream_start", { eventId: event.id, surface: "event-player", sourceIndex });
  }, [event, sourceIndex]);
  const reportStreamError = useCallback(() => {
    if (!event) return;
    const streamKey = `${event.id}:${sourceIndex}`;
    if (streamErrorRef.current === streamKey) return;
    streamErrorRef.current = streamKey;
    void trackAnalytics("stream_error", { eventId: event.id, surface: "event-player", sourceIndex });
  }, [event, sourceIndex]);

  if (!event) return <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-4"><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>{error ? <Text style={{ color: palette.text }}>{error}</Text> : <ActivityIndicator color={palette.red} />}</View></ScreenContainer>;

  const header = <View>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}><Pressable onPress={leave} hitSlop={12} accessibilityLabel="Go back"><Text style={{ color: palette.text, fontSize: 32 }}>‹</Text></Pressable><View style={{ flex: 1, marginHorizontal: 12 }}><Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800" }}>SPORTS803TV PLAYER</Text><Text style={{ color: palette.text, fontWeight: "900", fontSize: 16 }} numberOfLines={1}>{event.homeName} vs {event.awayName || "Live broadcast"}</Text></View><Pressable onPress={async () => { const next = await toggleFavorite(event.id); setFavorite(next.includes(event.id)); void trackAnalytics("favorite_toggle", { eventId: event.id, favorite: next.includes(event.id) }); }} hitSlop={12} accessibilityLabel={favorite ? "Remove favorite" : "Add favorite"}><Text style={{ color: favorite ? palette.gold : palette.muted, fontSize: 27 }}>{favorite ? "★" : "☆"}</Text></Pressable></View>
    <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderColor: status.label === "LIVE NOW" ? palette.red : palette.border, borderWidth: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ color: status.color, fontSize: 11, fontWeight: "900" }}>● {status.label}</Text><Text style={{ color: palette.muted, fontSize: 11 }}>{event.category ? categoryLabel(event.category) : "Sports"}</Text></View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 15 }}><View style={{ flex: 1, alignItems: "center" }}><TeamLogo uri={event.homeLogo} /><Text style={{ color: palette.text, fontSize: 15, fontWeight: "900", textAlign: "center", marginTop: 8 }} numberOfLines={2}>{event.homeName}</Text></View><View style={{ alignItems: "center", paddingHorizontal: 8 }}><Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800" }}>SCORE</Text><Text style={{ color: palette.green, fontSize: 25, fontWeight: "900", marginTop: 3 }}>{scoreText(event)}</Text><Text style={{ color: palette.muted, fontSize: 10, marginTop: 4 }}>{formatKickoff(event)}</Text></View><View style={{ flex: 1, alignItems: "center" }}><TeamLogo uri={event.awayLogo} /><Text style={{ color: palette.text, fontSize: 15, fontWeight: "900", textAlign: "center", marginTop: 8 }} numberOfLines={2}>{event.awayName || "Live broadcast"}</Text></View></View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, paddingTop: 12, borderTopColor: palette.border, borderTopWidth: 1 }}><Text style={{ color: palette.muted, fontSize: 12, flex: 1 }} numberOfLines={1}>{event.competitionLabel || event.leagueName || "Sports803TV"}</Text><Text style={{ color: palette.text, fontSize: 11, fontWeight: "800" }}>{event.channels.length} stream{event.channels.length === 1 ? "" : "s"}</Text></View>
    </View>
    <View style={{ aspectRatio: 16 / 9, backgroundColor: "#000", borderRadius: 18, overflow: "hidden", borderColor: palette.border, borderWidth: 1 }}><IframePlayer uri={source} onReady={reportStreamStart} onError={reportStreamError} /></View>
    <Pressable onPress={() => setImmersive(true)} style={({ pressed }) => ({ alignSelf: "center", backgroundColor: palette.elevated, borderColor: palette.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginTop: 10, opacity: pressed ? 0.8 : 1 })} accessibilityLabel="Open match player in full screen"><Text style={{ color: palette.text, fontWeight: "800" }}>⛶ Full screen</Text></Pressable>
    <View style={{ backgroundColor: palette.surface, borderRadius: 16, padding: 12, marginTop: 10 }}><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}><Text style={{ color: palette.text, fontSize: 13, fontWeight: "900" }}>Available streams</Text><Pressable onPress={() => { const next = event.channels.length ? (sourceIndex + 1) % event.channels.length : 0; setSourceIndex(next); void trackAnalytics("source_switch", { eventId: event.id, sourceIndex: next }); }} disabled={!event.channels.length}><Text style={{ color: event.channels.length ? palette.green : palette.muted, fontSize: 11, fontWeight: "900" }}>TRY NEXT</Text></Pressable></View><FlatList horizontal showsHorizontalScrollIndicator={false} data={event.channels} keyExtractor={(channel, index) => `${channel.src}-${index}`} renderItem={({ item: channel, index }) => <Pressable onPress={() => { setSourceIndex(index); void trackAnalytics("source_switch", { eventId: event.id, sourceIndex: index }); }} style={{ backgroundColor: index === sourceIndex ? palette.red : palette.elevated, borderColor: index === sourceIndex ? palette.red : palette.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8 }}><Text style={{ color: palette.text, fontWeight: "800", fontSize: 12 }}>{channel.label || `Stream ${index + 1}`}</Text></Pressable>} ListEmptyComponent={<Text style={{ color: palette.muted, fontSize: 12 }}>No stream sources are currently available.</Text>} /></View>
    {eventStatus(event) !== "ended" ? <View style={{ backgroundColor: palette.surface, borderRadius: 16, borderColor: palette.border, borderWidth: 1, padding: 12, marginTop: 10 }}><Text style={{ color: palette.text, fontWeight: "900", fontSize: 13 }}>Your prediction</Text><Text style={{ color: palette.muted, fontSize: 11, marginTop: 3 }}>Saved only on this device. Pick the outcome you expect.</Text><View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>{(["home", "draw", "away"] as MatchPrediction[]).map((choice) => <Pressable key={choice} onPress={() => { void savePrediction(event.id, choice); setPrediction(choice); void trackAnalytics("prediction_set", { eventId: event.id, choice }); }} style={{ flex: 1, borderRadius: 14, borderColor: prediction === choice ? palette.red : palette.border, borderWidth: 1, paddingVertical: 9, backgroundColor: prediction === choice ? palette.red : palette.elevated, alignItems: "center" }} accessibilityLabel={`Predict ${choice === "home" ? event.homeName : choice === "away" ? event.awayName || "away team" : "a draw"}`}><Text style={{ color: palette.text, fontSize: 11, fontWeight: "800" }} numberOfLines={1}>{choice === "home" ? event.homeName : choice === "away" ? event.awayName || "Away" : "Draw"}</Text></Pressable>)}</View></View> : null}
    <View style={{ backgroundColor: "#101B2D", borderColor: palette.border, borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 }}><Text style={{ color: palette.text, fontWeight: "900", fontSize: 14 }}>Enjoy the match on Sports803TV</Text><Text style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }}>This is a free sports streaming experience. If a stream buffers, switch to another source above. Availability can change during the event.</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 12 }}><Pressable onPress={async () => { await saveStreamReport(event.id, "stream unavailable or buffering"); Alert.alert("Report received", "Thanks. We will review this stream source."); }}><Text style={{ color: palette.red, fontSize: 12, fontWeight: "800" }}>Report stream</Text></Pressable><Pressable onPress={() => { void shareEvent(event); void trackAnalytics("share_event", { eventId: event.id }); }}><Text style={{ color: palette.green, fontSize: 12, fontWeight: "800" }}>Share</Text></Pressable>{matchCenterAvailability(event).available ? <Pressable onPress={() => { void trackAnalytics("match_center_open", { eventId: event.id }); router.push({ pathname: "/match-center" as any, params: { eventId: event.id } }); }}><Text style={{ color: palette.gold, fontSize: 12, fontWeight: "800" }}>Match Center</Text></Pressable> : null}{eventStatus(event) === "upcoming" ? <><Pressable onPress={async () => { await saveReminder(event.id); await scheduleMatchReminder(event); void trackAnalytics("reminder_set", { eventId: event.id, surface: "event-player" }); Alert.alert("Reminder set", "You will be reminded 15 minutes before kickoff when notifications are enabled."); }}><Text style={{ color: palette.green, fontSize: 12, fontWeight: "800" }}>Remind me</Text></Pressable><Pressable onPress={async () => { const result = await exportMatchToCalendar(event); const message = result === "added" ? "The match has been added with a 30-minute calendar alert." : result === "permission-denied" ? "Calendar permission was not granted." : result === "invalid-time" ? "This event does not have a valid kickoff time." : "Calendar export is not available on this device."; Alert.alert(result === "added" ? "Added to calendar" : "Calendar unavailable", message); }}><Text style={{ color: palette.gold, fontSize: 12, fontWeight: "800" }}>Add to calendar</Text></Pressable></> : null}</View></View>
    <AdSlot unitId={AD_UNITS.playerBanner} label="Player sponsor" />
    {recommendations.length > 0 ? <View style={{ marginTop: 3, marginBottom: 14 }}><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}><View><Text style={{ color: palette.text, fontSize: 18, fontWeight: "900" }}>Recommended live events</Text><Text style={{ color: palette.muted, fontSize: 11, marginTop: 2 }}>Keep watching what is live now</Text></View><Text style={{ color: palette.red, fontSize: 11, fontWeight: "900" }}>LIVE & UPCOMING</Text></View><FlatList horizontal showsHorizontalScrollIndicator={false} data={recommendations} keyExtractor={(item) => `recommended-${item.id}`} renderItem={({ item }) => <RecommendedCard event={item} onOpen={() => { void trackAnalytics("event_open", { eventId: item.id, surface: "recommendation" }); router.push({ pathname: "/player" as any, params: { eventId: item.id } }); }} />} /></View> : <View style={{ backgroundColor: palette.surface, borderRadius: 16, padding: 14, marginBottom: 16 }}><Text style={{ color: palette.text, fontWeight: "900" }}>You are watching the latest available event</Text><Text style={{ color: palette.muted, fontSize: 12, marginTop: 5 }}>Check the Home tab for more matches and refresh the schedule for new streams.</Text></View>}
  </View>;

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background" className="px-3"><FlatList data={["player-content"]} renderItem={() => null} keyExtractor={(item) => item} ListHeaderComponent={header} contentContainerStyle={{ paddingBottom: 28 }} /><Modal visible={immersive} onRequestClose={() => setImmersive(false)} animationType="fade" supportedOrientations={["portrait", "landscape"]}><View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}><View style={{ position: "absolute", top: 44, right: 18, zIndex: 2 }}><Pressable onPress={() => setImmersive(false)} style={{ backgroundColor: "rgba(20,27,44,0.92)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }} accessibilityLabel="Exit full screen"><Text style={{ color: palette.text, fontWeight: "800" }}>Done</Text></Pressable></View><View style={{ width: "100%", aspectRatio: 16 / 9 }}><IframePlayer uri={source} onReady={reportStreamStart} onError={reportStreamError} /></View></View></Modal></ScreenContainer>;
}
