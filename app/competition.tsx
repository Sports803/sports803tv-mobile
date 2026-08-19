import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { eventStatus, fetchEvents, type SportsEvent } from "@/lib/sports";

export default function CompetitionScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const competition = decodeURIComponent(name || "");
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const load = useCallback(async () => setEvents((await fetchEvents()).filter((event) => eventStatus(event) !== "ended")), []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => { const target = competition.toLowerCase().trim(); return events.filter((event) => { const labels = `${event.leagueName || ""} ${event.competitionLabel || ""}`.toLowerCase(); return labels.includes(target) || target.includes(labels); }); }, [competition, events]);
  return <ScreenContainer containerClassName="bg-background" className="px-4"><FlatList data={visible} keyExtractor={(item) => item.id} ListHeaderComponent={<View style={{ paddingTop: 14, paddingBottom: 18 }}><Pressable onPress={() => router.back()}><Text style={{ color: "#9AA6BE", marginBottom: 14 }}>‹ Back</Text></Pressable><Text style={{ color: "#E0102A", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }}>COMPETITION</Text><Text style={{ color: "#F7F8FC", fontSize: 27, fontWeight: "900", marginTop: 4 }}>{competition || "Competition"}</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>Live and upcoming events</Text></View>} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/player" as any, params: { eventId: item.id } })} style={{ backgroundColor: "#11182A", borderColor: eventStatus(item) === "live" ? "#E0102A" : "#26314A", borderWidth: 1, borderRadius: 16, padding: 15, marginBottom: 10 }}><Text style={{ color: eventStatus(item) === "live" ? "#E0102A" : "#36D399", fontWeight: "900", fontSize: 11 }}>{eventStatus(item) === "live" ? "● LIVE NOW" : "● UPCOMING"}</Text><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "900", marginTop: 10 }}>{item.homeName} vs {item.awayName || "Live broadcast"}</Text><Text style={{ color: "#9AA6BE", fontSize: 12, marginTop: 6 }}>{item.channels.length ? "Watch available stream" : "Details available"}</Text></Pressable>} ListEmptyComponent={<Text style={{ color: "#9AA6BE", paddingTop: 30 }}>No live or upcoming events found in this competition.</Text>} contentContainerStyle={{ paddingBottom: 28 }} /></ScreenContainer>;
}
