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
  | "announcement";

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

export function ownerRankedChannels<T extends { id: string }>(channels: T[], controls: OwnerControlMap): T[] {
  return channels
    .map((channel, index) => ({ channel, index, control: ownerChannelOverride(controls, channel.id) }))
    .filter(({ control }) => !control.hidden)
    .sort((left, right) => Number(right.control.featured) - Number(left.control.featured) || right.control.priority - left.control.priority || left.index - right.index)
    .map(({ channel }) => channel);
}
