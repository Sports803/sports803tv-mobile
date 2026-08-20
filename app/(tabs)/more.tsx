import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { SupportActions } from "@/components/support-actions";
import { trackAnalytics, trackAnalyticsActivation } from "@/lib/analytics";
import { clearLocalData, getAnalyticsConsent, getAppLanguage, getDataSaver, getLeagueFavorites, getNotificationsEnabled, getTeamFavorites, setAnalyticsConsent, setAppLanguage, setDataSaver, setNotificationsEnabled, type AppLanguage, toggleLeagueFavorite, toggleTeamFavorite } from "@/lib/local";
import { cancelAllMatchReminders, requestNotificationPermission } from "@/lib/notifications";
import { shareSports803 } from "@/lib/sharing";
import { fetchEvents, type SportsEvent } from "@/lib/sports";
import { useThemeContext } from "@/lib/theme-provider";

const card = { backgroundColor: "#11182A", borderColor: "#26314A", borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12 } as const;

export default function MoreScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [dataSaver, setDataSaverState] = useState(false);
  const [analyticsConsent, setAnalyticsConsentState] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>("en");
  const { colorScheme, setColorScheme } = useThemeContext();
  const load = useCallback(async () => {
    const [items, teamPrefs, leaguePrefs] = await Promise.all([fetchEvents(), getTeamFavorites(), getLeagueFavorites()]);
    setEvents(items); setTeams(teamPrefs); setLeagues(leaguePrefs);
  }, []);
  useEffect(() => { void load(); void getDataSaver().then(setDataSaverState); void getAnalyticsConsent().then(setAnalyticsConsentState); void getNotificationsEnabled().then(setNotificationsEnabledState); void getAppLanguage().then(setLanguage); }, [load]);
  const teamOptions = useMemo(() => Array.from(new Set(events.flatMap((event) => [event.homeName, event.awayName].filter(Boolean) as string[]))).slice(0, 12), [events]);
  const leagueOptions = useMemo(() => Array.from(new Set(events.map((event) => event.leagueName || event.competitionLabel).filter(Boolean) as string[])).slice(0, 12), [events]);
  const setConsent = async (granted: boolean) => { setAnalyticsConsentState(await setAnalyticsConsent(granted)); if (granted) { void trackAnalyticsActivation(); void trackAnalytics("tab_view", { tab: "more", consent: true }); } };

  return (
    <ScreenContainer containerClassName="bg-background" className="px-4">
      <FlatList
        data={["content"]}
        renderItem={() => null}
        keyExtractor={(item) => item}
        ListHeaderComponent={<View style={{ paddingTop: 14, paddingBottom: 28 }}>
          <Text style={{ color: "#E0102A", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 }}>SPORTS 803</Text>
          <Text style={{ color: "#F7F8FC", fontSize: 28, fontWeight: "900", marginTop: 4 }}>More</Text>
          <Text style={{ color: "#9AA6BE", marginTop: 8, lineHeight: 20 }}>Personalize your schedule, reminders, privacy, and viewing experience.</Text>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Notifications</Text><Text style={{ color: "#9AA6BE", marginTop: 8, lineHeight: 19 }}>Allow local reminders 15 minutes before your selected matches begin.</Text><Pressable onPress={async () => { const next = !notificationsEnabled; const granted = next ? await requestNotificationPermission() : true; if (!granted) { Alert.alert("Notifications", "Notifications were not enabled on this device."); return; } if (!next) await cancelAllMatchReminders(); setNotificationsEnabledState(await setNotificationsEnabled(next)); }} style={{ marginTop: 14 }}><Text style={{ color: notificationsEnabled ? "#36D399" : "#9AA6BE", fontWeight: "900" }}>{notificationsEnabled ? "✓ Match alerts enabled" : "Enable match alerts"}</Text></Pressable></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Appearance & language</Text><Text style={{ color: "#9AA6BE", marginTop: 7, lineHeight: 19 }}>Choose the colors you prefer. Language preference is saved for future translated Sports803TV content; provider and Blogger headlines remain in their published language.</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}><Pressable onPress={() => setColorScheme("dark")} style={{ backgroundColor: colorScheme === "dark" ? "#E0102A" : "#17213A", borderRadius: 16, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: "#F7F8FC", fontWeight: "800", fontSize: 12 }}>Dark</Text></Pressable><Pressable onPress={() => setColorScheme("light")} style={{ backgroundColor: colorScheme === "light" ? "#E0102A" : "#17213A", borderRadius: 16, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: "#F7F8FC", fontWeight: "800", fontSize: 12 }}>Light</Text></Pressable></View><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{([ ["en", "English"], ["es", "Español"], ["fr", "Français"], ["pt", "Português"] ] as const).map(([value, label]) => <Pressable key={value} onPress={async () => setLanguage(await setAppLanguage(value))} style={{ backgroundColor: language === value ? "#E0102A" : "#17213A", borderRadius: 16, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: "#F7F8FC", fontWeight: "800", fontSize: 12 }}>{label}</Text></Pressable>)}</View></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Privacy & analytics</Text><Text style={{ color: "#9AA6BE", marginTop: 8, lineHeight: 19 }}>Optional analytics measure anonymous app activity, stream performance, feature use, and broad device-region trends. No event is recorded until you opt in. Names, messages, stream URLs, precise location, and private preferences are not sent.</Text><Pressable onPress={() => void setConsent(!analyticsConsent)} style={{ marginTop: 14 }}><Text style={{ color: analyticsConsent ? "#36D399" : "#9AA6BE", fontWeight: "900" }}>{analyticsConsent ? "✓ Anonymous analytics enabled" : "Enable anonymous analytics"}</Text></Pressable><Text style={{ color: "#66718A", fontSize: 11, marginTop: 8 }}>You can turn this off or clear local data at any time.</Text></View>

          <View style={card}><SupportActions /></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Invite friends</Text><Text style={{ color: "#9AA6BE", marginTop: 6, lineHeight: 19 }}>Share Sports803TV so your friends can follow live matches and watch together.</Text><Pressable onPress={() => { void shareSports803(); void trackAnalytics("app_invite_share", { surface: "more" }); }} style={{ marginTop: 14 }}><Text style={{ color: "#36D399", fontWeight: "900" }}>Share Sports803TV</Text></Pressable></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Favorite teams</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>Your Home screen can prioritize these teams.</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{teamOptions.map((name) => <Pressable key={name} onPress={async () => setTeams(await toggleTeamFavorite(name))} style={{ backgroundColor: teams.includes(name) ? "#E0102A" : "#17213A", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8 }}><Text style={{ color: "#F7F8FC", fontSize: 11, fontWeight: "800" }}>{teams.includes(name) ? "★ " : "☆ "}{name}</Text></Pressable>)}</View></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Favorite leagues</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>Follow competitions that matter to you.</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>{leagueOptions.map((name) => <Pressable key={name} onPress={async () => setLeagues(await toggleLeagueFavorite(name))} style={{ backgroundColor: leagues.includes(name) ? "#E0102A" : "#17213A", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8 }}><Text style={{ color: "#F7F8FC", fontSize: 11, fontWeight: "800" }}>{leagues.includes(name) ? "★ " : "☆ "}{name}</Text></Pressable>)}</View></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Playback & data</Text><Text style={{ color: "#9AA6BE", marginTop: 6 }}>Reduce refresh frequency and image loading on mobile data.</Text><Pressable onPress={async () => setDataSaverState(await setDataSaver(!dataSaver))} style={{ marginTop: 14 }}><Text style={{ color: dataSaver ? "#36D399" : "#9AA6BE", fontWeight: "900" }}>{dataSaver ? "✓ Data saver enabled" : "Enable data saver"}</Text></Pressable><Text style={{ color: "#9AA6BE", fontSize: 12, marginTop: 12 }}>Iframe channels keep their provider controls and open full-screen from the embedded player when supported.</Text></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Explore</Text><Pressable onPress={() => router.push("/results" as any)} style={{ marginTop: 14 }}><Text style={{ color: "#36D399", fontWeight: "900" }}>Open results archive</Text></Pressable><Pressable onPress={() => router.push("/news" as any)} style={{ marginTop: 12 }}><Text style={{ color: "#36D399", fontWeight: "900" }}>Open news & highlights</Text></Pressable><Pressable onPress={() => router.push({ pathname: "/explore" as any, params: { kind: "league", value: "Premier League" } })} style={{ marginTop: 12 }}><Text style={{ color: "#36D399", fontWeight: "900" }}>Browse league pages</Text></Pressable><Text style={{ color: "#9AA6BE", fontSize: 12, marginTop: 5 }}>Finished matches are kept here instead of cluttering the live schedule.</Text></View>

          <View style={card}><Text style={{ color: "#F7F8FC", fontSize: 17, fontWeight: "800" }}>Local preferences</Text><Text style={{ color: "#9AA6BE", marginTop: 8 }}>Favorites, reminders, reports, analytics consent, and recently viewed events stay on this device.</Text><Pressable onPress={() => Alert.alert("Clear local data", "Remove favorites, reminders, reports, consent, and recently viewed events?", [{ text: "Cancel", style: "cancel" }, { text: "Clear", style: "destructive", onPress: () => void clearLocalData().then(load) }])} style={{ marginTop: 16 }}><Text style={{ color: "#E0102A", fontWeight: "800" }}>Clear local data</Text></Pressable></View>
          <Text style={{ color: "#66718A", fontSize: 11, marginTop: 22 }}>Version 1.0.0 • Free sports streaming companion</Text>
        </View>}
      />
    </ScreenContainer>
  );
}
