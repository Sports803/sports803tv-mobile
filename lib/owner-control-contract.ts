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
