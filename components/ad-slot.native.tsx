import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";

import { getAnalyticsConsent } from "@/lib/local";
import { trackAnalytics } from "@/lib/analytics";

type MobileAdsModule = typeof import("react-native-google-mobile-ads");

function getMobileAdsModule(): MobileAdsModule | null {
  // Expo Go cannot load custom native modules. Production and development builds retain AdMob.
  if (Constants.executionEnvironment === "storeClient") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- the guarded load prevents Expo Go from resolving this custom native module.
    return require("react-native-google-mobile-ads") as MobileAdsModule;
  } catch {
    return null;
  }
}

const mobileAds = getMobileAdsModule();

export const AD_UNITS = {
  appId: "ca-app-pub-5622139873916803~1201837341",
  homeBanner: "ca-app-pub-5622139873916803/8898112504",
  playerInterstitial: "ca-app-pub-5622139873916803/7775130344",
  nativeFeed: "ca-app-pub-5622139873916803/1633082187",
  playerBanner: "ca-app-pub-5622139873916803/2770215671",
  liveTvBanner: "ca-app-pub-5622139873916803/8006918844",
  exit: "ca-app-pub-5622139873916803/2332704152",
} as const;

export function AdSlot({ unitId, label = "Sponsored" }: { unitId: string; label?: string }) {
  const [hasConsent, setHasConsent] = useState(false);
  useEffect(() => { void getAnalyticsConsent().then(setHasConsent); }, []);
  if (Platform.OS === "web") return <View style={{ height: 1 }} />;
  if (!hasConsent) return <AdFallbackLabel label="Advertising is disabled until consent is enabled" />;
  if (!mobileAds) return <AdFallbackLabel label={label} />;
  const { BannerAd, BannerAdSize } = mobileAds;
  return <View accessible accessibilityLabel={`${label} advertisement`} style={{ minHeight: 52, marginVertical: 12, alignItems: "center", justifyContent: "center" }}><BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} onAdImpression={() => void trackAnalytics("ad_impression", { surface: "ad-banner", placement: label })} onAdClicked={() => void trackAnalytics("ad_tap", { surface: "ad-banner", placement: label })} onAdFailedToLoad={() => undefined} /></View>;
}

export function AdFallbackLabel({ label = "Sponsored" }: { label?: string }) { return <Text style={{ color: "#66718A", fontSize: 10 }}>{label}</Text>; }
