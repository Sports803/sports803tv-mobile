import { describe, expect, it } from "vitest";

import { normalizeBloggerFeed } from "../lib/blogger-feed-contract";

describe("Blogger feed contract", () => {
  it("keeps only safe public story data from Blogger feed entries", () => {
    const feed = { feed: { entry: [{ id: { $t: "post-1" }, title: { $t: "A match story" }, published: { $t: "2026-08-19T00:00:00Z" }, category: [{ term: "Football" }], link: [{ rel: "alternate", href: "https://sports803tv.blogspot.com/2026/08/story.html" }], content: { $t: '<img src="https://images.example/story.jpg"/><p>Match <strong>preview</strong></p>' } }, { title: { $t: "Blocked" }, link: [{ rel: "alternate", href: "javascript:bad" }] }] } };
    expect(normalizeBloggerFeed(feed, 99)).toEqual([expect.objectContaining({ id: "post-1", title: "A match story", summary: "Match preview", imageUrl: "https://images.example/story.jpg", category: "Football" })]);
  });
});
