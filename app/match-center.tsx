import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { matchCenterAvailability, matchCenterTabs, type MatchCenterTab } from "@/lib/match-center";
import { fetchEvents, type SportsEvent } from "@/lib/sports";
import { trpc } from "@/lib/trpc";

const emptyCopy: Record<MatchCenterTab, string> = {
  Summary: "Live score, venue, and provider details appear here when the fixture is available.",
  Timeline: "Timeline data is not available from the current event source.",
  Stats: "Match statistics are not available from the current event source.",
  Lineups: "Lineups and formations are not available from the current event source.",
  Standings: "Standings are not available from the current event source.",
};

const providerField: Record<MatchCenterTab, string | null> = {
  Summary: null,
  Timeline: "events",
  Stats: "statistics",
  Lineups: "lineups",
  Standings: "standings",
};

export default function MatchCenterScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<SportsEvent | null>(null);
  const [activeTab, setActiveTab] = useState<MatchCenterTab>("Summary");

  useEffect(() => { void fetchEvents().then((items) => setEvent(items.find((item) => item.id === eventId) || null)); }, [eventId]);
  const availability = useMemo(() => event ? matchCenterAvailability(event) : null, [event]);
  const fixtureQuery = trpc.sportmonks.fixture.useQuery(
    { fixtureId: availability?.fixtureId || "0" },
    { enabled: Boolean(availability?.available && availability.fixtureId) },
  );
  const providerFixture = fixtureQuery.data?.available ? fixtureQuery.data.fixture : null;
  const providerItems = providerFixture && providerField[activeTab] ? providerFixture[providerField[activeTab]!] : null;
  const providerCount = Array.isArray(providerItems) ? providerItems.length : 0;

  if (!event) return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4"><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#E0102A" /></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4"><ScrollView contentContainerStyle={{ paddingVertical: 10, paddingBottom: 30 }}><Pressable onPress={() => router.back()}><Text style={{ color: "#9AA6BE", marginBottom: 14 }}>‹ Back to player</Text></Pressable><Text style={{ color: "#E0102A", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }}>MATCH CENTER</Text><Text style={{ color: "#F7F8FC", fontSize: 24, fontWeight: "900", marginTop: 5 }}>{event.homeName} vs {event.awayName || "Live broadcast"}</Text><Text style={{ color: "#9AA6BE", marginTop: 5 }}>{event.competitionLabel || event.leagueName || "Sports803TV"}</Text><View style={{ backgroundColor: "#11182A", borderColor: "#26314A", borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 18 }}><Text style={{ color: "#F7F8FC", fontWeight: "900" }}>{event.score || "—  –  —"}</Text><Text style={{ color: availability?.available ? "#36D399" : "#9AA6BE", fontSize: 12, lineHeight: 18, marginTop: 8 }}>{fixtureQuery.isFetching ? "Loading protected fixture details…" : fixtureQuery.data?.available === false ? fixtureQuery.data.reason : availability?.reason}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 18 }}>{matchCenterTabs.map((tab) => <Pressable key={tab} onPress={() => setActiveTab(tab)} style={{ backgroundColor: activeTab === tab ? "#E0102A" : "#17213A", borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 }}><Text style={{ color: "#F7F8FC", fontSize: 12, fontWeight: "800" }}>{tab}</Text></Pressable>)}</ScrollView><View style={{ backgroundColor: "#11182A", borderColor: "#26314A", borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 14 }}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "900" }}>{activeTab}</Text><Text style={{ color: "#9AA6BE", lineHeight: 20, marginTop: 8 }}>{providerFixture ? activeTab === "Summary" ? `Verified Sportmonks fixture loaded${fixtureQuery.data?.cached ? " from short-lived cache" : ""}.` : providerCount ? `${providerCount} provider ${activeTab.toLowerCase()} record${providerCount === 1 ? "" : "s"} available.` : `No ${activeTab.toLowerCase()} records were returned for this fixture.` : emptyCopy[activeTab]}</Text>{availability?.available ? <Text style={{ color: "#9AA6BE", fontSize: 12, lineHeight: 18, marginTop: 12 }}>Provider calls occur through the protected server. Firebase source details remain the safe fallback when the fixture ID or provider data is unavailable.</Text> : null}</View></ScrollView></ScreenContainer>;
}
