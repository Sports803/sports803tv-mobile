import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { AdSlot, AD_UNITS } from "@/components/ad-slot";
import { ScreenContainer } from "@/components/screen-container";
import {
  categoryLabel,
  eventStatus,
  eventTime,
  fetchEvents,
  type EventStatus,
  type SportsEvent,
} from "@/lib/sports";
import { getFavorites, getHistory, getLeagueFavorites, getTeamFavorites, toggleFavorite } from "@/lib/local";
import { classifySport } from "@/lib/match-center";
import { trackAnalytics } from "@/lib/analytics";
import { OwnerBanner } from "@/components/owner-banner";
import { fetchOwnerControls } from "@/lib/owner-config";
import { featuredIds, ownerAdEnabled, ownerHomeLayout, ownerNewsFeed, type OwnerControlMap } from "@/lib/owner-control-contract";
import { fetchBloggerArticles } from "@/lib/blogger-feed";
import type { BloggerArticle } from "@/lib/blogger-feed-contract";

const categories = [
  "all",
  "football",
  "basketball",
  "nfl",
  "hockey",
  "baseball",
  "motorsport",
  "mma",
  "other",
];
const statuses: ("all" | EventStatus)[] = ["all", "live", "upcoming"];
const palette = {
  surface: "#11182A",
  elevated: "#17213A",
  text: "#F7F8FC",
  muted: "#9AA6BE",
  red: "#E0102A",
  border: "#26314A",
  green: "#36D399",
  gold: "#F4B740",
};

function TeamLogo({ uri, size = 40 }: { uri?: string; size?: number }) {
  return uri ? (
    <Image
      source={{ uri }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.elevated,
      }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.elevated,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: palette.muted, fontSize: size * 0.42 }}>⚽</Text>
    </View>
  );
}

function formatCountdown(event: SportsEvent) {
  const remaining = eventTime(event) - Date.now();
  if (remaining <= 0) return "Starting soon";
  const minutes = Math.floor(remaining / 60_000);
  return minutes >= 60 ? `Starts in ${Math.floor(minutes / 60)}h ${minutes % 60}m` : `Starts in ${minutes}m`;
}

function statusCopy(event: SportsEvent, now?: number) {
  const status = eventStatus(event, now);
  if (status === "live") return { label: "LIVE NOW", color: palette.red };
  if (status === "ended") return { label: "ENDED", color: palette.muted };
  return { label: "UPCOMING", color: palette.green };
}

function EventCard({
  event,
  favorite,
  onFavorite,
  onOpen,
  width,
}: {
  event: SportsEvent;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  width: number;
}) {
  const status = statusCopy(event);
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => ({
        backgroundColor: palette.surface,
        borderColor: status.label === "LIVE NOW" ? palette.red : palette.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 15,
        marginBottom: 12,
        width,
        opacity: pressed ? 0.82 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.homeName} versus ${event.awayName}`}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: status.color, fontSize: 11, fontWeight: "800" }}>
          ● {status.label}
          {status.label === "UPCOMING" ? ` · ${formatCountdown(event)}` : ""}
        </Text>
        <Pressable onPress={onFavorite} hitSlop={12} accessibilityLabel={favorite ? "Remove favorite" : "Add favorite"}>
          <Text style={{ color: favorite ? palette.gold : palette.muted, fontSize: 22 }}>{favorite ? "★" : "☆"}</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TeamLogo uri={event.homeLogo} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "800" }} numberOfLines={1}>{event.homeName}</Text>
          <Text style={{ color: palette.muted, fontSize: 12, marginVertical: 2 }}>vs</Text>
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: "800" }} numberOfLines={1}>{event.awayName || "Live broadcast"}</Text>
        </View>
        <TeamLogo uri={event.awayLogo} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 10, borderTopColor: palette.border, borderTopWidth: 1 }}>
        <Text style={{ color: palette.muted, fontSize: 12, flex: 1 }} numberOfLines={1}>{event.competitionLabel || event.leagueName || categoryLabel(event.category)}</Text>
        <Text style={{ color: palette.green, fontWeight: "800", fontSize: 12 }}>{event.channels.length ? "WATCH NOW" : "NO STREAM"}</Text>
      </View>
    </Pressable>
  );
}

function PopularMatchCard({
  event,
  favorite,
  onFavorite,
  onOpen,
  width,
}: {
  event: SportsEvent;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  width: number;
}) {
  const status = statusCopy(event);
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => ({
        width,
        minHeight: 164,
        backgroundColor: palette.elevated,
        borderColor: status.label === "LIVE NOW" ? palette.red : palette.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 12,
        marginBottom: 10,
        opacity: pressed ? 0.82 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Open popular match ${event.homeName} versus ${event.awayName}`}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.color }} />
          <Text style={{ color: status.color, fontSize: 10, fontWeight: "900" }} numberOfLines={1}>{status.label}</Text>
        </View>
        <Pressable onPress={onFavorite} hitSlop={10} accessibilityLabel={favorite ? "Remove favorite" : "Add favorite"}>
          <Text style={{ color: favorite ? palette.gold : palette.muted, fontSize: 18 }}>{favorite ? "★" : "☆"}</Text>
        </Pressable>
      </View>
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, width: "100%" }}>
          <View style={{ alignItems: "center", flex: 1 }}>
            <TeamLogo uri={event.homeLogo} size={34} />
            <Text style={{ color: palette.text, fontSize: 11, fontWeight: "800", marginTop: 7, textAlign: "center" }} numberOfLines={2}>{event.homeName}</Text>
          </View>
          <Text style={{ color: palette.muted, fontSize: 11, fontWeight: "800" }}>VS</Text>
          <View style={{ alignItems: "center", flex: 1 }}>
            <TeamLogo uri={event.awayLogo} size={34} />
            <Text style={{ color: palette.text, fontSize: 11, fontWeight: "800", marginTop: 7, textAlign: "center" }} numberOfLines={2}>{event.awayName || "Broadcast"}</Text>
          </View>
        </View>
      </View>
      <View style={{ marginTop: 10, paddingTop: 8, borderTopColor: palette.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: palette.muted, fontSize: 10, flex: 1 }} numberOfLines={1}>{event.competitionLabel || event.leagueName || categoryLabel(event.category)}</Text>
        <Text style={{ color: event.channels.length ? palette.green : palette.muted, fontSize: 10, fontWeight: "900" }}>{event.channels.length ? "WATCH" : "DETAILS"}</Text>
      </View>
    </Pressable>
  );
}

function HeroMatchCard({ event, onOpen, width }: { event: SportsEvent; onOpen: () => void; width: number }) {
  const status = statusCopy(event);
  return <Pressable onPress={onOpen} style={({ pressed }) => ({ width, minHeight: 198, borderRadius: 22, padding: 18, marginBottom: 8, backgroundColor: "#1D1730", borderColor: status.label === "LIVE NOW" ? palette.red : "#4A365C", borderWidth: 1, opacity: pressed ? 0.84 : 1, justifyContent: "space-between" })}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={{ color: status.color, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 }}>● {status.label}</Text><Text style={{ color: palette.gold, fontWeight: "900", fontSize: 11 }}>FEATURED</Text></View>
    <View><Text style={{ color: palette.text, fontSize: 22, fontWeight: "900" }} numberOfLines={2}>{event.homeName} <Text style={{ color: palette.muted }}>vs</Text> {event.awayName || "Live broadcast"}</Text><Text style={{ color: palette.muted, marginTop: 8, fontSize: 12 }} numberOfLines={1}>{event.competitionLabel || event.leagueName || categoryLabel(event.category)}</Text></View>
    <View style={{ alignSelf: "flex-start", backgroundColor: palette.red, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{event.channels.length ? "WATCH LIVE" : "VIEW MATCH"}</Text></View>
  </Pressable>;
}

function NewsArticleCard({ article, width }: { article: BloggerArticle; width: number }) {
  return <Pressable onPress={() => void Linking.openURL(article.href)} style={({ pressed }) => ({ width, borderRadius: 16, overflow: "hidden", backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, marginBottom: 10, opacity: pressed ? 0.8 : 1 })}>
    {article.imageUrl ? <Image source={{ uri: article.imageUrl }} style={{ width: "100%", height: width * 0.62, backgroundColor: palette.elevated }} resizeMode="cover" /> : <View style={{ height: width * 0.42, backgroundColor: "#1D1730", padding: 12, justifyContent: "flex-end" }}><Text style={{ color: palette.red, fontWeight: "900", fontSize: 11 }}>{article.category.toUpperCase()}</Text></View>}
    <View style={{ padding: 11 }}><Text style={{ color: palette.muted, fontSize: 10, fontWeight: "900", marginBottom: 5 }}>{article.category.toUpperCase()}</Text><Text style={{ color: palette.text, fontSize: 13, lineHeight: 18, fontWeight: "800" }} numberOfLines={3}>{article.title}</Text>{article.summary ? <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 7 }} numberOfLines={3}>{article.summary}</Text> : null}</View>
  </Pressable>;
}

function Skeletons() {
  return <View>{[1, 2, 3].map((item) => <View key={item} style={{ height: 145, borderRadius: 18, backgroundColor: palette.surface, marginBottom: 12, opacity: 0.65 }} />)}</View>;
}

const majorFootballCompetition = /premier league|epl|la liga|laliga|mls|saudi pro league|ligue 1|league 1|bundesliga|serie a|eredivisie|primeira liga|champions league|uefa champions|europa league|conference league|fa cup|coppa italia|copa del rey|dfb pokal|efl championship/i;

function isMajorFootballMatch(event: SportsEvent) {
  if (classifySport(event.category) !== "football") return false;
  const competition = [event.leagueName, event.competitionLabel].filter(Boolean).join(" ");
  return majorFootballCompetition.test(competition);
}

function popularityScore(event: SportsEvent, now: number) {
  const candidate = event as SportsEvent & Record<string, unknown>;
  const explicit = [candidate.popularity, candidate.popularScore, candidate.priority, candidate.importance, candidate.featured]
    .map((value) => typeof value === "number" ? value : value === true ? 100 : 0)
    .reduce((sum, value) => sum + value, 0);
  const liveBoost = eventStatus(event, now) === "live" ? 1000 : 0;
  const streamBoost = event.channels.length ? 100 : 0;
  return liveBoost + explicit + streamBoost;
}

export default function HomeScreen() {
  const router = useRouter();
  const { width: viewportWidth } = useWindowDimensions();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | EventStatus>("all");
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [teamFavorites, setTeamFavorites] = useState<string[]>([]);
  const [leagueFavorites, setLeagueFavorites] = useState<string[]>([]);
  const [ownerControls, setOwnerControls] = useState<OwnerControlMap>({});
  const [newsArticles, setNewsArticles] = useState<BloggerArticle[]>([]);
  const load = useCallback(async () => { setError(""); try { const [nextEvents, nextControls] = await Promise.all([fetchEvents(), fetchOwnerControls(refreshing)]); setEvents(nextEvents); setOwnerControls(nextControls); const newsConfig = ownerNewsFeed(nextControls); if (newsConfig.enabled) { try { const remote = await fetchBloggerArticles(newsConfig.sourceUrl, newsConfig.maxItems); const combined = [...newsConfig.curated, ...remote].filter((article, index, list) => list.findIndex((candidate) => candidate.href === article.href) === index); setNewsArticles(combined.slice(0, newsConfig.maxItems)); } catch { setNewsArticles(newsConfig.curated); } } else setNewsArticles([]); } catch (e) { setError(e instanceof Error ? e.message : "Could not load events"); } finally { setLoading(false); setRefreshing(false); } }, [refreshing]);
  useEffect(() => { void Promise.all([load(), getFavorites().then(setFavorites), getHistory().then(setHistory), getTeamFavorites().then(setTeamFavorites), getLeagueFavorites().then(setLeagueFavorites)]); }, [load]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rank: Record<EventStatus, number> = { live: 0, upcoming: 1, ended: 2 };
    return events.filter((event) => {
      const categoryMatch = selected === "all" || classifySport(event.category) === selected;
      const currentStatus = eventStatus(event, now);
      const statusMatch = currentStatus !== "ended" && (selectedStatus === "all" || currentStatus === selectedStatus);
      const haystack = [event.homeName, event.awayName, event.leagueName, event.competitionLabel, event.category].filter(Boolean).join(" ").toLowerCase();
      return categoryMatch && statusMatch && (!needle || haystack.includes(needle));
    }).sort((a, b) => {
      const preference = (event: SportsEvent) => teamFavorites.includes(event.homeName) || teamFavorites.includes(event.awayName || "") || leagueFavorites.includes(event.leagueName || "") || leagueFavorites.includes(event.competitionLabel || "") ? -1 : 0;
      return preference(a) - preference(b) || rank[eventStatus(a, now)] - rank[eventStatus(b, now)] || eventTime(a) - eventTime(b);
    });
  }, [events, selected, selectedStatus, query, now, teamFavorites, leagueFavorites]);
  const popular = useMemo(() => [...filtered]
    .filter((event) => {
      const status = eventStatus(event, now);
      return (status === "live" || status === "upcoming") && isMajorFootballMatch(event);
    })
    .sort((a, b) => popularityScore(b, now) - popularityScore(a, now) || eventTime(a) - eventTime(b))
    .slice(0, 6), [filtered, now]);
  const ownerFeatured = useMemo(() => {
    const ids = featuredIds(ownerControls, "featuredEvents");
    return ids.map((id) => filtered.find((event) => event.id === id)).filter((event): event is SportsEvent => Boolean(event));
  }, [filtered, ownerControls]);
  const homeLayout = useMemo(() => ownerHomeLayout(ownerControls), [ownerControls]);
  const heroMatches = useMemo(() => [...ownerFeatured, ...popular].filter((event, index, list) => list.findIndex((candidate) => candidate.id === event.id) === index).slice(0, homeLayout.heroLimit), [ownerFeatured, popular, homeLayout.heroLimit]);
  const liveNow = useMemo(() => filtered.filter((event) => eventStatus(event, now) === "live").slice(0, homeLayout.liveLimit), [filtered, now, homeLayout.liveLimit]);
  const fixtureEvents = useMemo(() => filtered.filter((event) => eventStatus(event, now) === "upcoming").slice(0, homeLayout.fixtureLimit), [filtered, now, homeLayout.fixtureLimit]);
  const recent = history.flatMap((id) => { const event = events.find((item) => item.id === id); return event && eventStatus(event, now) !== "ended" ? [event] : []; });
  const setFav = async (id: string) => setFavorites(await toggleFavorite(id));
  const gridGap = 10;
  const columns = viewportWidth >= 800 ? 3 : 2;
  const horizontalPadding = 32;
  const cardWidth = Math.max(142, (viewportWidth - horizontalPadding - gridGap * (columns - 1)) / columns);
  const openEvent = (event: SportsEvent) => router.push({ pathname: "/player" as any, params: { eventId: event.id } });
  const competitionNames = Array.from(new Set(events.map((event) => event.leagueName || event.competitionLabel).filter(Boolean) as string[])).slice(0, 10);
  const heroWidth = Math.max(260, viewportWidth - 56);
  const articleWidth = Math.max(145, (viewportWidth - 42) / 2);
  const fixtureDate = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
  const header = <View>
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingBottom: 14 }}><View><Text style={{ color: palette.red, fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }}>SPORTS 803</Text><Text style={{ color: palette.text, fontSize: 28, fontWeight: "900" }}>Live sports, your way</Text></View><Pressable onPress={() => router.push("/(tabs)/more" as any)} accessibilityRole="button" accessibilityLabel="Open alert settings" style={{ backgroundColor: palette.surface, width: 42, height: 42, borderRadius: 21, borderColor: palette.border, borderWidth: 1, alignItems: "center", justifyContent: "center" }}><MaterialIcons name="notifications-none" size={20} color={palette.text} /></Pressable></View>
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, marginBottom: 12 }}><Text style={{ color: palette.muted, fontSize: 18, marginRight: 8 }}>⌕</Text><TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => void trackAnalytics("search", { queryLength: query.trim().length })} placeholder="Search teams, leagues, sports" placeholderTextColor={palette.muted} returnKeyType="search" clearButtonMode="while-editing" accessibilityLabel="Search events" style={{ flex: 1, color: palette.text, paddingVertical: 12, fontSize: 14 }} />{query ? <Pressable onPress={() => setQuery("")} hitSlop={10} accessibilityLabel="Clear event search"><Text style={{ color: palette.muted, fontSize: 18 }}>×</Text></Pressable> : null}</View>
    <FlatList horizontal showsHorizontalScrollIndicator={false} data={categories} keyExtractor={(item) => item} contentContainerStyle={{ gap: 8, paddingBottom: 16 }} renderItem={({ item }) => <Pressable onPress={() => { setSelected(item); void trackAnalytics("category_filter", { category: item }); }} style={{ backgroundColor: selected === item ? palette.red : palette.surface, borderColor: selected === item ? palette.red : palette.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}><Text style={{ color: palette.text, fontWeight: "700", fontSize: 12 }}>{item === "all" ? "All" : categoryLabel(item)}</Text></Pressable>} />
    <FlatList horizontal showsHorizontalScrollIndicator={false} data={statuses} keyExtractor={(item) => `status-${item}`} contentContainerStyle={{ gap: 8, paddingBottom: 12 }} renderItem={({ item }) => <Pressable onPress={() => setSelectedStatus(item)} style={{ backgroundColor: selectedStatus === item ? palette.elevated : "transparent", borderColor: selectedStatus === item ? palette.red : palette.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8 }}><Text style={{ color: selectedStatus === item ? palette.text : palette.muted, fontWeight: "800", fontSize: 12 }}>{item === "all" ? "All statuses" : item === "live" ? "Live now" : "Upcoming"}</Text></Pressable>} />
    <OwnerBanner controls={ownerControls} />
    {competitionNames.length > 0 ? <FlatList horizontal showsHorizontalScrollIndicator={false} data={competitionNames} keyExtractor={(item) => `competition-${item}`} contentContainerStyle={{ gap: 8, paddingBottom: 12 }} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/competition" as any, params: { name: item } })} style={{ backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }}><Text style={{ color: palette.muted, fontWeight: "800", fontSize: 11 }}>{item}</Text></Pressable>} /> : null}
    {homeLayout.showHero && heroMatches.length > 0 ? <View style={{ marginBottom: 18 }}><View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}><Text style={{ color: palette.text, fontSize: 20, fontWeight: "900" }}>Big games</Text><Text style={{ color: palette.red, fontWeight: "900", fontSize: 11 }}>WATCH LIVE</Text></View><FlatList horizontal showsHorizontalScrollIndicator={false} data={heroMatches} keyExtractor={(item) => `hero-${item.id}`} contentContainerStyle={{ gap: 10 }} renderItem={({ item }) => <HeroMatchCard event={item} width={heroWidth} onOpen={() => openEvent(item)} />} /></View> : null}
    {homeLayout.showLiveNow && liveNow.length > 0 ? <View style={{ marginBottom: 18 }}><View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}><View><Text style={{ color: palette.text, fontSize: 20, fontWeight: "900" }}>Live now</Text><Text style={{ color: palette.muted, fontSize: 11, marginTop: 2 }}>Scores and streams in progress</Text></View><Text style={{ color: palette.red, fontWeight: "900", fontSize: 11 }}>● LIVE</Text></View><FlatList horizontal showsHorizontalScrollIndicator={false} data={liveNow} keyExtractor={(item) => `live-${item.id}`} contentContainerStyle={{ gap: 10 }} renderItem={({ item }) => <PopularMatchCard event={item} width={Math.max(190, viewportWidth * 0.58)} favorite={favorites.includes(item.id)} onFavorite={() => void setFav(item.id)} onOpen={() => openEvent(item)} />} /></View> : null}
    {recent.length > 0 ? <View style={{ marginBottom: 18 }}><Text style={{ color: palette.text, fontSize: 16, fontWeight: "800", marginBottom: 8 }}>Recently viewed</Text><FlatList horizontal showsHorizontalScrollIndicator={false} data={recent.slice(0, 5)} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: 8 }} renderItem={({ item }) => <Pressable onPress={() => openEvent(item)} style={{ backgroundColor: palette.elevated, borderRadius: 12, padding: 10, width: 160 }}><Text style={{ color: palette.text, fontWeight: "700" }} numberOfLines={2}>{item.homeName} vs {item.awayName}</Text><Text style={{ color: palette.muted, fontSize: 11, marginTop: 4 }}>{item.leagueName || "Sports803TV"}</Text></Pressable>} /></View> : null}
    {ownerAdEnabled(ownerControls, "homeBanner") ? <AdSlot unitId={AD_UNITS.homeBanner} /> : null}
    {error ? <View style={{ backgroundColor: "#3A1520", borderRadius: 12, padding: 12, marginBottom: 14 }}><Text style={{ color: "#FFB7C1" }}>{error}</Text></View> : null}
    {homeLayout.showFixtures ? <View style={{ marginTop: 2, marginBottom: 12 }}><Text style={{ color: palette.text, fontSize: 20, fontWeight: "900" }}>Today’s fixtures</Text><Text style={{ color: palette.muted, marginTop: 3, fontSize: 12 }}>{fixtureDate}</Text></View> : null}
  </View>;
  const footer = homeLayout.showNews && newsArticles.length > 0 ? <View style={{ marginTop: 16 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}><View><Text style={{ color: palette.text, fontSize: 20, fontWeight: "900" }}>Trending news</Text><Text style={{ color: palette.muted, marginTop: 3, fontSize: 12 }}>From Sports803TV</Text></View><Pressable onPress={() => router.push("/news" as any)}><Text style={{ color: palette.red, fontWeight: "900", fontSize: 12 }}>SEE ALL</Text></Pressable></View><View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>{newsArticles.map((article) => <NewsArticleCard key={article.id} article={article} width={articleWidth} />)}</View></View> : null;
  const mainEvents = homeLayout.showFixtures ? fixtureEvents : [];
  return <ScreenContainer containerClassName="bg-background" className="px-4"><FlatList key={`events-${columns}`} data={mainEvents} numColumns={columns} columnWrapperStyle={mainEvents.length ? { gap: gridGap } : undefined} keyExtractor={(item) => item.id} renderItem={({ item }) => <EventCard event={item} width={cardWidth} favorite={favorites.includes(item.id)} onFavorite={() => void setFav(item.id)} onOpen={() => openEvent(item)} />} ListHeaderComponent={header} ListFooterComponent={footer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={palette.red} />} ListEmptyComponent={loading ? <Skeletons /> : homeLayout.showFixtures ? <View style={{ paddingVertical: 30, alignItems: "center" }}><Text style={{ color: palette.text, fontSize: 16, fontWeight: "800" }}>No upcoming fixtures found</Text><Text style={{ color: palette.muted, marginTop: 6, textAlign: "center" }}>{query.trim() ? "Try another team, league, or sport." : "Pull down to refresh the live fixture feed."}</Text></View> : null} contentContainerStyle={{ paddingBottom: 28 }} /></ScreenContainer>;
}
