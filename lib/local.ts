import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "sports803:favorites";
const HISTORY_KEY = "sports803:history";
const TEAM_FAVORITES_KEY = "sports803:favorite-teams";
const LEAGUE_FAVORITES_KEY = "sports803:favorite-leagues";
const REMINDERS_KEY = "sports803:reminders";
const REPORTS_KEY = "sports803:stream-reports";
const DATA_SAVER_KEY = "sports803:data-saver";
const PUSH_TOKEN_KEY = "sports803:push-token";
const ANALYTICS_CONSENT_KEY = "sports803:analytics-consent";
const ANALYTICS_INSTALL_ID_KEY = "sports803:analytics-install-id";
const ANALYTICS_ACTIVATION_REPORTED_KEY = "sports803:analytics-activation-reported";
const PREDICTIONS_KEY = "sports803:predictions";
const ONBOARDING_COMPLETE_KEY = "sports803:onboarding-complete";
const FAVORITE_SPORTS_KEY = "sports803:favorite-sports";
const NOTIFICATIONS_ENABLED_KEY = "sports803:notifications-enabled";
const LANGUAGE_KEY = "sports803:language";

export type MatchPrediction = "home" | "draw" | "away";
export type AppLanguage = "en" | "es" | "fr" | "pt";

async function readList(key: string) {
  try { return JSON.parse((await AsyncStorage.getItem(key)) || "[]") as string[]; } catch { return []; }
}
async function writeList(key: string, values: string[]) { await AsyncStorage.setItem(key, JSON.stringify(values.slice(0, 50))); }
async function readPredictions() { try { const value = JSON.parse((await AsyncStorage.getItem(PREDICTIONS_KEY)) || "{}"); return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, MatchPrediction> : {}; } catch { return {}; } }
export const getFavorites = () => readList(FAVORITES_KEY);
export const getHistory = () => readList(HISTORY_KEY);
export const getTeamFavorites = () => readList(TEAM_FAVORITES_KEY);
export const getLeagueFavorites = () => readList(LEAGUE_FAVORITES_KEY);
export async function toggleFavorite(id: string) { const current = await getFavorites(); const next = current.includes(id) ? current.filter((value) => value !== id) : [id, ...current]; await writeList(FAVORITES_KEY, next); return next; }
export async function toggleTeamFavorite(name: string) { const current = await getTeamFavorites(); const next = current.includes(name) ? current.filter((value) => value !== name) : [name, ...current]; await writeList(TEAM_FAVORITES_KEY, next); return next; }
export async function toggleLeagueFavorite(name: string) { const current = await getLeagueFavorites(); const next = current.includes(name) ? current.filter((value) => value !== name) : [name, ...current]; await writeList(LEAGUE_FAVORITES_KEY, next); return next; }
export async function addHistory(id: string) { const current = await getHistory(); const next = [id, ...current.filter((value) => value !== id)]; await writeList(HISTORY_KEY, next); return next; }
export async function saveReminder(id: string) { const current = await readList(REMINDERS_KEY); const next = current.includes(id) ? current : [id, ...current]; await writeList(REMINDERS_KEY, next); return next; }
export const getReminders = () => readList(REMINDERS_KEY);
export async function getDataSaver() { return (await AsyncStorage.getItem(DATA_SAVER_KEY)) === "true"; }
export async function setDataSaver(enabled: boolean) { await AsyncStorage.setItem(DATA_SAVER_KEY, String(enabled)); return enabled; }
export async function savePushToken(token: string) { await AsyncStorage.setItem(PUSH_TOKEN_KEY, token); }
export async function saveStreamReport(eventId: string, reason: string) { const current = await readList(REPORTS_KEY); const next = [`${eventId}:${reason}:${Date.now()}`, ...current]; await writeList(REPORTS_KEY, next); return next; }
export async function getAnalyticsConsent() { return (await AsyncStorage.getItem(ANALYTICS_CONSENT_KEY)) === "granted"; }
export async function setAnalyticsConsent(granted: boolean) { await AsyncStorage.setItem(ANALYTICS_CONSENT_KEY, granted ? "granted" : "declined"); return granted; }
export async function getAnonymousAnalyticsInstallId() {
  let value = await AsyncStorage.getItem(ANALYTICS_INSTALL_ID_KEY);
  if (!value) {
    value = `s803-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
    await AsyncStorage.setItem(ANALYTICS_INSTALL_ID_KEY, value);
  }
  return value;
}
export async function getAnalyticsActivationReported() { return (await AsyncStorage.getItem(ANALYTICS_ACTIVATION_REPORTED_KEY)) === "true"; }
export async function setAnalyticsActivationReported() { await AsyncStorage.setItem(ANALYTICS_ACTIVATION_REPORTED_KEY, "true"); }
export async function getPrediction(eventId: string) { return (await readPredictions())[eventId] ?? null; }
export async function savePrediction(eventId: string, prediction: MatchPrediction) { const current = await readPredictions(); const next = { ...current, [eventId]: prediction }; await AsyncStorage.setItem(PREDICTIONS_KEY, JSON.stringify(next)); return prediction; }
export const getFavoriteSports = () => readList(FAVORITE_SPORTS_KEY);
export async function toggleFavoriteSport(sport: string) { const current = await getFavoriteSports(); const next = current.includes(sport) ? current.filter((value) => value !== sport) : [sport, ...current]; await writeList(FAVORITE_SPORTS_KEY, next); return next; }
export async function getOnboardingComplete() {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)) === "true";
  } catch {
    return false;
  }
}
export async function setOnboardingComplete(completed = true) { await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, String(completed)); return completed; }
export async function getNotificationsEnabled() { return (await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY)) === "true"; }
export async function setNotificationsEnabled(enabled: boolean) { await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled)); return enabled; }
export async function getAppLanguage(): Promise<AppLanguage> { const value = await AsyncStorage.getItem(LANGUAGE_KEY); return value === "es" || value === "fr" || value === "pt" ? value : "en"; }
export async function setAppLanguage(language: AppLanguage) { await AsyncStorage.setItem(LANGUAGE_KEY, language); return language; }
export async function clearLocalData() { await AsyncStorage.multiRemove([FAVORITES_KEY, HISTORY_KEY, TEAM_FAVORITES_KEY, LEAGUE_FAVORITES_KEY, REMINDERS_KEY, REPORTS_KEY, DATA_SAVER_KEY, PUSH_TOKEN_KEY, ANALYTICS_CONSENT_KEY, ANALYTICS_INSTALL_ID_KEY, ANALYTICS_ACTIVATION_REPORTED_KEY, PREDICTIONS_KEY, ONBOARDING_COMPLETE_KEY, FAVORITE_SPORTS_KEY, NOTIFICATIONS_ENABLED_KEY, LANGUAGE_KEY]); }
