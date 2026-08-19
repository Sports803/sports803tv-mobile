export type OwnerControlKey =
  | "homeLayout"
  | "featuredEvents"
  | "featuredChannels"
  | "channelOverrides"
  | "promotionBanner"
  | "adPlacements"
  | "supportLinks"
  | "reliabilityOverrides"
  | "notificationCampaign"
  | "announcement"
  | "newsFeed";

export type OwnerControlMap = Partial<Record<OwnerControlKey, unknown>>;

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function featuredIds(controls: OwnerControlMap, key: "featuredEvents" | "featuredChannels") {
  const value = controls[key];
  return asStringList(Array.isArray(value) ? value : asRecord(value).ids);
}

export function ownerAnnouncement(controls: OwnerControlMap) {
  const value = asRecord(controls.announcement);
  const message = typeof value.message === "string" ? value.message.trim() : "";
  return message ? {
    message,
    title: typeof value.title === "string" ? value.title.trim() : "Sports803TV update",
    tone: value.tone === "warning" ? "warning" as const : "info" as const,
  } : null;
}

export function ownerPromotion(controls: OwnerControlMap) {
  const value = asRecord(controls.promotionBanner);
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const message = typeof value.message === "string" ? value.message.trim() : "";
  const href = typeof value.href === "string" ? value.href.trim() : "";
  return title || message ? { title: title || "Featured on Sports803TV", message, href } : null;
}

export type ChannelReliability = "reliable" | "issues" | "offline";

export type ChannelOwnerOverride = {
  hidden: boolean;
  featured: boolean;
  priority: number;
  reliability: ChannelReliability;
  note: string;
};

export function ownerChannelOverride(controls: OwnerControlMap, channelId: string): ChannelOwnerOverride {
  const source = asRecord(asRecord(controls.channelOverrides)[channelId]);
  const reliability = source.reliability === "issues" || source.reliability === "offline" ? source.reliability : "reliable";
  return {
    hidden: source.hidden === true,
    featured: source.featured === true || featuredIds(controls, "featuredChannels").includes(channelId),
    priority: typeof source.priority === "number" && Number.isFinite(source.priority) ? source.priority : 0,
    reliability,
    note: typeof source.note === "string" ? source.note.trim().slice(0, 180) : "",
  };
}

export function ownerAdEnabled(controls: OwnerControlMap, placement: string) {
  const placementValue = asRecord(asRecord(controls.adPlacements)[placement]);
  return placementValue.enabled !== false;
}

export type OwnerHomeLayout = {
  showHero: boolean;
  showLiveNow: boolean;
  showFixtures: boolean;
  showNews: boolean;
  heroLimit: number;
  liveLimit: number;
  fixtureLimit: number;
};

function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;
}

export function ownerHomeLayout(controls: OwnerControlMap): OwnerHomeLayout {
  const value = asRecord(controls.homeLayout);
  return {
    showHero: value.showHero !== false,
    showLiveNow: value.showLiveNow !== false,
    showFixtures: value.showFixtures !== false,
    showNews: value.showNews !== false,
    heroLimit: boundedInteger(value.heroLimit, 3, 1, 6),
    liveLimit: boundedInteger(value.liveLimit, 8, 1, 16),
    fixtureLimit: boundedInteger(value.fixtureLimit, 16, 4, 40),
  };
}

export type CuratedArticle = {
  id: string;
  title: string;
  summary: string;
  href: string;
  imageUrl: string;
  category: string;
};

export type OwnerNewsFeed = {
  enabled: boolean;
  sourceUrl: string;
  maxItems: number;
  curated: CuratedArticle[];
};

function safePublicUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function ownerNewsFeed(controls: OwnerControlMap): OwnerNewsFeed {
  const value = asRecord(controls.newsFeed);
  const curated = Array.isArray(value.curated) ? value.curated : [];
  return {
    enabled: value.enabled !== false,
    sourceUrl: safePublicUrl(value.sourceUrl) || "https://sports803tv.blogspot.com/feeds/posts/default?alt=json",
    maxItems: boundedInteger(value.maxItems, 8, 1, 20),
    curated: curated.flatMap((item, index) => {
      const source = asRecord(item);
      const title = typeof source.title === "string" ? source.title.trim().slice(0, 160) : "";
      const href = safePublicUrl(source.href);
      if (!title || !href) return [];
      return [{
        id: typeof source.id === "string" && source.id.trim() ? source.id.trim().slice(0, 80) : `curated-${index}`,
        title,
        href,
        summary: typeof source.summary === "string" ? source.summary.trim().slice(0, 500) : "",
        imageUrl: safePublicUrl(source.imageUrl),
        category: typeof source.category === "string" ? source.category.trim().slice(0, 48) : "Sports803TV",
      }];
    }).slice(0, 12),
  };
}

export function ownerRankedChannels<T extends { id: string }>(channels: T[], controls: OwnerControlMap): T[] {
  return channels
    .map((channel, index) => ({ channel, index, control: ownerChannelOverride(controls, channel.id) }))
    .filter(({ control }) => !control.hidden)
    .sort((left, right) => Number(right.control.featured) - Number(left.control.featured) || right.control.priority - left.control.priority || left.index - right.index)
    .map(({ channel }) => channel);
}
