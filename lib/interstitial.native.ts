import Constants from "expo-constants";
import { useEffect, useMemo, useState } from "react";
import { AD_UNITS } from "@/components/ad-slot";
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

export function useExitInterstitial() {
  const [ready, setReady] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  useEffect(() => { void getAnalyticsConsent().then(setHasConsent); }, []);
  const ad = useMemo(() => hasConsent ? mobileAds?.InterstitialAd.createForAdRequest(AD_UNITS.playerInterstitial) ?? null : null, [hasConsent]);
  useEffect(() => {
    if (!ad || !mobileAds) return;
    const loaded = ad.addAdEventListener(mobileAds.AdEventType.LOADED, () => setReady(true));
    const closed = ad.addAdEventListener(mobileAds.AdEventType.CLOSED, () => { setReady(false); ad.load(); });
    const impression = ad.addAdEventListener(mobileAds.AdEventType.OPENED, () => void trackAnalytics("ad_impression", { surface: "exit-interstitial" }));
    const clicked = ad.addAdEventListener(mobileAds.AdEventType.CLICKED, () => void trackAnalytics("ad_tap", { surface: "exit-interstitial" }));
    ad.load();
    return () => { loaded(); closed(); impression(); clicked(); };
  }, [ad]);
  return { showOnExit: () => { if (ready && ad) ad.show(); } };
}
