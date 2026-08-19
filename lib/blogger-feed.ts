import { normalizeBloggerFeed, type BloggerArticle } from "@/lib/blogger-feed-contract";

export async function fetchBloggerArticles(sourceUrl: string, maxItems: number): Promise<BloggerArticle[]> {
  const response = await fetch(sourceUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Sports803TV news is temporarily unavailable");
  return normalizeBloggerFeed(await response.json(), maxItems);
}
