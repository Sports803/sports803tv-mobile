import * as WebBrowser from "expo-web-browser";

import { trackAnalytics } from "@/lib/analytics";
import { makeSupportDestinations, type SupportDestination } from "@/lib/support-contract";

export const supportDestinations = makeSupportDestinations(
  process.env.EXPO_PUBLIC_PATREON_URL,
  process.env.EXPO_PUBLIC_BUYMEACOFFEE_URL,
);

export async function openSupportDestination(destination: SupportDestination) {
  void trackAnalytics("support_tap", { destination: destination.id });
  await WebBrowser.openBrowserAsync(destination.url);
}
