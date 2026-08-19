import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { fetchEvents, type SportsEvent } from "@/lib/sports";
import { getFavorites, toggleFavorite } from "@/lib/local";

export default function FavoritesScreen() {
  const router = useRouter(); const [events, setEvents] = useState<SportsEvent[]>([]); const [favorites, setFavorites] = useState<string[]>([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const [items, ids] = await Promise.all([fetchEvents(), getFavorites()]); setEvents(items); setFavorites(ids); setLoading(false); }, []);
  useEffect(() => { void load().catch(() => setLoading(false)); }, [load]);
  const visible = useMemo(() => events.filter((item) => favorites.includes(item.id)), [events, favorites]);
  return <ScreenContainer containerClassName="bg-background" className="px-4"><FlatList data={visible} keyExtractor={(item) => item.id} ListHeaderComponent={<View style={{ paddingTop: 14, paddingBottom: 18 }}><Text style={{ color: "#E0102A", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }}>YOUR PICKS</Text><Text style={{ color: "#F7F8FC", fontSize: 28, fontWeight: "900", marginTop: 4 }}>Favorites</Text></View>} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/player" as any, params: { eventId: item.id } })} style={{ backgroundColor: "#11182A", borderColor: "#26314A", borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10 }}><Text style={{ color: "#F7F8FC", fontSize: 16, fontWeight: "800" }}>{item.homeName} vs {item.awayName}</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>{item.competitionLabel || item.leagueName || item.category}</Text><Pressable onPress={async () => setFavorites(await toggleFavorite(item.id))} style={{ marginTop: 12 }}><Text style={{ color: "#F4B740", fontWeight: "800" }}>★ Remove favorite</Text></Pressable></Pressable>} ListEmptyComponent={<View style={{ paddingTop: 50 }}><Text style={{ color: "#F7F8FC", fontSize: 18, fontWeight: "800" }}>{loading ? "Loading favorites…" : "No saved events yet"}</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>Star an event on Home to keep it here.</Text></View>} contentContainerStyle={{ paddingBottom: 28 }} /></ScreenContainer>;
}
