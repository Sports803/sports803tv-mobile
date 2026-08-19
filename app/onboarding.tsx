import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { setOnboardingComplete, toggleFavoriteSport } from "@/lib/local";

const SPORTS = ["Football", "Basketball", "Cricket", "Formula 1", "Tennis", "Rugby"];
const TEAMS = ["Arsenal", "Barcelona", "Real Madrid", "Manchester United", "Liverpool", "LA Lakers", "Golden State Warriors"];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sports, setSports] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const title = useMemo(() => ["Welcome to Sports803TV", "Choose your sports", "Add favourite teams"][step], [step]);
  const subtitle = useMemo(() => ["Live matches, fixtures, highlights, and news in one place.", "We will prioritize the competitions you care about.", "This is optional. You can change it any time in Settings."][step], [step]);
  const finish = async () => { await setOnboardingComplete(); router.replace("/(tabs)" as any); };
  const pickSport = async (name: string) => { setSports(await toggleFavoriteSport(name)); };
  const pickTeam = (name: string) => setTeams((current) => current.includes(name) ? current.filter((value) => value !== name) : [name, ...current]);
  const options = step === 1 ? SPORTS : TEAMS;
  const selected = step === 1 ? sports : teams;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" containerClassName="bg-background">
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between", paddingVertical: 26 }}>
      <View><Text style={{ color: "#E0102A", fontWeight: "900", letterSpacing: 1.8, fontSize: 12 }}>SPORTS 803</Text><View style={{ flexDirection: "row", gap: 6, marginTop: 22 }}>{[0, 1, 2].map((item) => <View key={item} style={{ height: 5, width: item === step ? 34 : 10, borderRadius: 4, backgroundColor: item === step ? "#E0102A" : "#26314A" }} />)}</View></View>
      <View><Text style={{ color: "#F7F8FC", fontWeight: "900", fontSize: 32, lineHeight: 40 }}>{title}</Text><Text style={{ color: "#9AA6BE", marginTop: 12, fontSize: 16, lineHeight: 24 }}>{subtitle}</Text>{step > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 28 }}>{options.map((option) => <Pressable key={option} onPress={() => step === 1 ? void pickSport(option) : pickTeam(option)} style={{ backgroundColor: selected.includes(option) ? "#E0102A" : "#17213A", borderColor: selected.includes(option) ? "#E0102A" : "#26314A", borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 11 }}><Text style={{ color: "#F7F8FC", fontWeight: "800" }}>{selected.includes(option) ? "✓ " : ""}{option}</Text></Pressable>)}</View>}</View>
      <View style={{ gap: 14 }}><Pressable onPress={() => step < 2 ? setStep(step + 1) : void finish()} style={{ backgroundColor: "#E0102A", borderRadius: 16, alignItems: "center", paddingVertical: 16 }}><Text style={{ color: "#fff", fontWeight: "900" }}>{step < 2 ? "Continue" : "Start watching"}</Text></Pressable><Pressable onPress={() => void finish()} style={{ alignItems: "center", paddingVertical: 10 }}><Text style={{ color: "#9AA6BE", fontWeight: "800" }}>{step === 0 ? "Skip for now" : "Skip personalization"}</Text></Pressable></View>
    </ScrollView>
  </ScreenContainer>;
}
