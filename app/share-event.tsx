import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { shareEvent } from "@/lib/sharing";
import { fetchEvents, type SportsEvent } from "@/lib/sports";

export default function ShareEventScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<SportsEvent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchEvents().then((events) => setEvent(events.find((item) => item.id === eventId) || null)).catch(() => setError("This shared event could not be loaded."));
  }, [eventId]);

  if (!event) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>{error ? <Text style={{ color: "#F7F8FC", textAlign: "center" }}>{error}</Text> : <ActivityIndicator color="#E0102A" />}</View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5"><View style={{ flex: 1, justifyContent: "center" }}><Text style={{ color: "#E0102A", fontWeight: "900", letterSpacing: 1.4 }}>SPORTS 803</Text><Text style={{ color: "#F7F8FC", fontSize: 30, fontWeight: "900", marginTop: 8, textAlign: "center" }}>{event.homeName} vs {event.awayName || "Live broadcast"}</Text><Text style={{ color: "#9AA6BE", textAlign: "center", marginTop: 10 }}>{event.competitionLabel || event.leagueName || "Sports803TV"}</Text><Pressable onPress={() => router.replace({ pathname: "/player" as any, params: { eventId: event.id } })} style={{ backgroundColor: "#E0102A", borderRadius: 16, padding: 15, marginTop: 28 }}><Text style={{ color: "#FFF", fontWeight: "900", textAlign: "center" }}>Open match</Text></Pressable><Pressable onPress={() => void shareEvent(event)} style={{ borderColor: "#26314A", borderWidth: 1, borderRadius: 16, padding: 15, marginTop: 12 }}><Text style={{ color: "#F7F8FC", fontWeight: "900", textAlign: "center" }}>Share again</Text></Pressable></View></ScreenContainer>;
}
