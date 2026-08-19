import { Text, View } from "react-native";

export const AD_UNITS = {
  appId: "ca-app-pub-5622139873916803~1201837341",
  homeBanner: "ca-app-pub-5622139873916803/8898112504",
  playerInterstitial: "ca-app-pub-5622139873916803/7775130344",
  nativeFeed: "ca-app-pub-5622139873916803/1633082187",
  playerBanner: "ca-app-pub-5622139873916803/2770215671",
  liveTvBanner: "ca-app-pub-5622139873916803/8006918844",
  exit: "ca-app-pub-5622139873916803/2332704152",
} as const;

export function AdSlot({ unitId: _unitId, label: _label }: { unitId: string; label?: string }) { return <View style={{ height: 1 }} />; }
export function AdFallbackLabel({ label = "Sponsored" }: { label?: string }) { return <Text style={{ color: "#66718A", fontSize: 10 }}>{label}</Text>; }
