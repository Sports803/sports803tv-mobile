export type BloggerArticle = {
  id: string;
  title: string;
  summary: string;
  href: string;
  imageUrl: string;
  category: string;
  publishedAt?: string;
};

function safeHttpsUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function textFromHtml(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function firstImage(value: unknown) {
  if (typeof value !== "string") return "";
  const src = value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return safeHttpsUrl(src);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function normalizeBloggerFeed(value: unknown, maxItems = 8): BloggerArticle[] {
  const feed = record(record(value).feed);
  const entries = Array.isArray(feed.entry) ? feed.entry : [];
  const limit = Math.max(1, Math.min(20, Math.round(maxItems)));
  return entries.flatMap((entry, index) => {
    const item = record(entry);
    const titleValue = record(item.title).$t;
    const title = typeof titleValue === "string" ? titleValue.trim().slice(0, 160) : "";
    const links = Array.isArray(item.link) ? item.link : [];
    const href = links.map(record).find((link) => link.rel === "alternate" && typeof link.href === "string")?.href;
    const content = record(item.content).$t ?? record(item.summary).$t;
    const imageUrl = safeHttpsUrl(record(item["media$thumbnail"]).url) || firstImage(content);
    const categoryEntries = Array.isArray(item.category) ? item.category : [];
    const category = categoryEntries.map(record).find((entry) => typeof entry.term === "string")?.term;
    const idValue = record(item.id).$t;
    const publishedValue = record(item.published).$t;
    const id = typeof idValue === "string" ? idValue : `blogger-${index}`;
    const publishedAt = typeof publishedValue === "string" ? publishedValue : "";
    const safeHref = safeHttpsUrl(href);
    if (!title || !safeHref) return [];
    return [{ id, title, href: safeHref, summary: textFromHtml(content), imageUrl, category: typeof category === "string" ? category.slice(0, 48) : "Sports803TV", publishedAt }];
  }).slice(0, limit);
}
