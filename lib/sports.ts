export const FIREBASE_DATABASE_URL = "https://sports-803-1b806-default-rtdb.firebaseio.com";

export type StreamSource = { label?: string; src?: string; url?: string; streamUrl?: string; iframe?: string; iframeUrl?: string; playerUrl?: string; source?: string; type?: string };
export type SportsEvent = {
  id: string;
  kickoff?: string | number;
  category: string;
  leagueName?: string;
  competitionLabel?: string;
  homeName: string;
  awayName?: string;
  homeLogo?: string;
  awayLogo?: string;
  score?: string;
  scoreHome?: string;
  scoreAway?: string;
  statusType?: string;
  status?: string;
  channels: StreamSource[];
  duration?: number;
  publicationStatus?: string;
  provider?: "firebase" | "espn" | "sportmonks" | "unknown";
  fixtureId?: string;
  leagueId?: string;
  eventType?: string;
};
export type LiveChannel = { id: string; name: string; logo?: string; src: string; category?: string; isLive?: boolean; sourceKind?: "video" | "embed" };

const text = (value: unknown, fallback = "") => typeof value === "string" ? value : value == null ? fallback : String(value);
const streamUrl = (s: StreamSource) => text(s.src || s.iframe || s.iframeUrl || s.playerUrl || s.url || s.streamUrl);

export function normalizeEvent(key: string, raw: any): SportsEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const channelValue = raw.channels ?? raw.streams;
  const channels = Array.isArray(channelValue) ? channelValue : channelValue && typeof channelValue === "object" ? Object.values(channelValue) : [];
  const directStream = text(raw.iframe || raw.iframeUrl || raw.playerUrl || raw.streamUrl || raw.stream || raw.url || raw.channelUrl);
  const validChannels = (channels as StreamSource[]).map((s: StreamSource) => ({ ...s, src: streamUrl(s) })).filter((s: StreamSource) => /^https?:\/\//i.test(s.src || ""));
  if (!validChannels.length && /^https?:\/\//i.test(directStream)) validChannels.push({ label: "Player", src: directStream, type: "embed" });
  const homeName = text(raw.homeName || raw.home || raw.title, "Home");
  const awayName = text(raw.awayName || raw.away);
  return {
    id: text(raw.id, key), kickoff: raw.kickoff || raw.date || raw.startTime,
    category: text(raw.category || raw.sport, "other").toLowerCase(),
    leagueName: text(raw.leagueName || raw.league), competitionLabel: text(raw.competitionLabel || raw.competitionCategory),
    homeName, awayName, homeLogo: text(raw.homeLogo), awayLogo: text(raw.awayLogo),
    score: text(raw.score, "- -"), scoreHome: text(raw.scoreHome), scoreAway: text(raw.scoreAway),
    statusType: text(raw.statusType), status: text(raw.status), channels: validChannels,
    duration: Number(raw.duration || 120), publicationStatus: text(raw.publicationStatus),
    provider: /sportmonks/i.test(text(raw.provider || raw.providerName || raw.dataProvider)) || raw.fixtureId || raw.fixture_id ? "sportmonks" : /espn/i.test(text(raw.provider || raw.providerName || raw.dataProvider)) ? "espn" : "firebase",
    fixtureId: text(raw.fixtureId || raw.fixture_id || raw.sportmonksFixtureId), leagueId: text(raw.leagueId || raw.league_id), eventType: text(raw.eventType || raw.type),
  };
}

export function normalizeChannel(key: string, raw: any): LiveChannel | null {
  if (!raw || typeof raw !== "object") return null;
  const iframe = text(raw.iframe || raw.iframeUrl || raw.playerUrl);
  const src = text(iframe || raw.src || raw.url || raw.streamUrl);
  if (!/^https?:\/\//i.test(src)) return null;
  return { id: text(raw.id, key), name: text(raw.name || raw.title, "Live channel"), logo: text(raw.logo), src, category: text(raw.category, "other"), isLive: raw.isLive !== false, sourceKind: iframe ? "embed" : "video" };
}

async function readPath(path: string, signal?: AbortSignal) {
  const response = await fetch(`${FIREBASE_DATABASE_URL}/${path}.json`, { signal });
  if (!response.ok) throw new Error(`Firebase request failed (${response.status})`);
  return response.json();
}

export async function fetchEvents(signal?: AbortSignal) {
  const raw = await readPath("s803config/todaysMatches", signal);
  return Object.entries(raw || {}).map(([key, value]) => normalizeEvent(key, value)).filter(Boolean) as SportsEvent[];
}

export async function fetchChannels(signal?: AbortSignal) {
  const raw = await readPath("livetv/channels", signal);
  return Object.entries(raw || {}).map(([key, value]) => normalizeChannel(key, value)).filter(Boolean) as LiveChannel[];
}

export const categoryLabel = (category: string) => category === "nfl" ? "American Football" : category === "mma" ? "Boxing & MMA" : category.charAt(0).toUpperCase() + category.slice(1);
export const eventTime = (event: SportsEvent) => event.kickoff ? new Date(event.kickoff).getTime() : 0;
export const isLive = (event: SportsEvent) => /LIVE|IN_PROGRESS|PLAYING/i.test(`${event.statusType} ${event.status}`);
export type EventStatus = "live" | "upcoming" | "ended";
export const eventStatus = (event: SportsEvent, now = Date.now()): EventStatus => {
  const explicit = `${event.statusType} ${event.status} ${event.publicationStatus}`;
  if (/FINAL|ENDED|FINISHED|COMPLETED|CLOSED|FT|STATUS_FINAL/i.test(explicit)) return "ended";
  const start = eventTime(event);
  const durationMinutes = Math.max(1, event.duration || 120);
  if (start > 0 && start + durationMinutes * 60_000 <= now) return "ended";
  if (isLive(event)) return "live";
  return "upcoming";
};
export const playable = (event?: SportsEvent | null) => event?.channels?.find((channel) => /^https?:\/\//i.test(channel.src || ""))?.src || "";
