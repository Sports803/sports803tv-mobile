import { Platform } from "react-native";
import { getApiBaseUrl } from "../constants/oauth";
import { getAnalyticsActivationReported, getAnalyticsConsent, getAnonymousAnalyticsInstallId, setAnalyticsActivationReported } from "./local";

export type SportsAnalyticsEvent =
  | "app_activate"
  | "app_open"
  | "screen_view"
  | "tab_view"
  | "search"
  | "category_filter"
  | "event_open"
  | "player_open"
  | "stream_start"
  | "stream_error"
  | "source_switch"
  | "favorite_toggle"
  | "share_event"
  | "match_center_open"
  | "support_tap"
  | "ad_impression"
  | "ad_tap"
  | "prediction_set"
  | "reminder_set"
  | "app_invite_share"
  | "notification_open";

type AnalyticsAttributes = Record<string, string | number | boolean | undefined>;

function deviceCountry() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.replace("_", "-");
    const match = locale.match(/-([A-Za-z]{2})\b/);
    return match?.[1]?.toUpperCase();
  } catch {
    return undefined;
  }
}

function compactProperties(attributes: AnalyticsAttributes) {
  return Object.fromEntries(Object.entries(attributes)
    .filter(([key, value]) => value !== undefined && !/(token|email|name|url|message|query)/i.test(key))
    .slice(0, 12));
}

/**
 * Consent-gated analytics boundary. A native Firebase Analytics adapter may be
 * attached only after the matching native Firebase configuration is supplied.
 * This function deliberately emits nothing while consent is absent or declined.
 */
export async function trackAnalytics(event: SportsAnalyticsEvent, attributes: AnalyticsAttributes = {}) {
  if (!(await getAnalyticsConsent())) return false;
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/public/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousInstallId: await getAnonymousAnalyticsInstallId(),
        eventName: event,
        surface: typeof attributes.surface === "string" ? attributes.surface : undefined,
        contentId: typeof attributes.eventId === "string" ? attributes.eventId : typeof attributes.channelId === "string" ? attributes.channelId : undefined,
        countryCode: deviceCountry(),
        platform: Platform.OS,
        properties: compactProperties(attributes),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Reports one consented activation per local app installation, never before opt-in. */
export async function trackAnalyticsActivation() {
  if (!(await getAnalyticsConsent()) || await getAnalyticsActivationReported()) return false;
  const recorded = await trackAnalytics("app_activate", { surface: "consent" });
  if (recorded) await setAnalyticsActivationReported();
  return recorded;
}
