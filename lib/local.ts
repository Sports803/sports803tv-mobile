import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "sports803:favorites";
const HISTORY_KEY = "sports803:history";
const TEAM_FAVORITES_KEY = "sports803:favorite-teams";
const LEAGUE_FAVORITES_KEY = "sports803:favorite-leagues";
const REMINDERS_KEY = "sports803:reminders";
const REPORTS_KEY = "sports803:stream-reports";
const DATA_SAVER_KEY = "sports803:data-saver";
const PUSH_TOKEN_KEY = "sports803:push-token";

async function readList(key: string) {
  try { return JSON.parse((await AsyncStorage.getItem(key)) || "[]") as string[]; } catch { return []; }
}
async function writeList(key: string, values: string[]) { await AsyncStorage.setItem(key, JSON.stringify(values.slice(0, 50))); }
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
export async function clearLocalData() { await AsyncStorage.multiRemove([FAVORITES_KEY, HISTORY_KEY, TEAM_FAVORITES_KEY, LEAGUE_FAVORITES_KEY, REMINDERS_KEY, REPORTS_KEY, DATA_SAVER_KEY, PUSH_TOKEN_KEY]); }
