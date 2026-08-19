import { getAnalyticsConsent } from "./local";

export type SportsAnalyticsEvent =
  | "app_open"
  | "tab_view"
  | "search"
  | "category_filter"
  | "player_open"
  | "source_switch"
  | "favorite_toggle"
  | "share_event"
  | "match_center_open"
  | "support_tap"
  | "ad_impression"
  | "prediction_set"
  | "app_invite_share";

/**
 * Consent-gated analytics boundary. A native Firebase Analytics adapter may be
 * attached only after the matching native Firebase configuration is supplied.
 * This function deliberately emits nothing while consent is absent or declined.
 */
export async function trackAnalytics(_event: SportsAnalyticsEvent, _attributes: Record<string, string | number | boolean | undefined> = {}) {
  return getAnalyticsConsent();
}
