(() => {
  const settings = window.SPORTS803_ADMIN || {};
  const TOKEN_KEY = "sports803-owner-dashboard-token";
  const $ = (id) => document.getElementById(id);
  const status = $("status");
  const dashboard = $("dashboard");
  const loginCard = $("login-card");
  const logout = $("logout");
  let config = [];

  const apiBase = () => {
    if (!settings.apiBaseUrl) throw new Error("This dashboard still needs its public API address in admin/config.js.");
    return settings.apiBaseUrl.replace(/\/$/, "");
  };
  const token = () => sessionStorage.getItem(TOKEN_KEY) || "";
  const api = (path, options = {}) => fetch(`${apiBase()}${path}`, {
    headers: { "Content-Type": "application/json", ...(token() ? { "X-Owner-Dashboard-Token": token() } : {}), ...(options.headers || {}) },
    ...options,
  });
  const record = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const valueFor = (key) => config.find((entry) => entry.key === key)?.value;
  const setStatus = (message) => { status.textContent = message; };
  const lines = (text) => text.split("\n").map((item) => item.trim()).filter(Boolean);

  async function save(key, value, successMessage) {
    const response = await api(`/api/admin/control-config/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify({ value }) });
    if (!response.ok) throw new Error((await response.json()).error || "Unable to save this setting.");
    setStatus(successMessage || "Saved. Viewers receive this update the next time the app refreshes.");
    await load();
  }

  function fillForms() {
    const announcement = record(valueFor("announcement"));
    $("announcement-title").value = announcement.title || "";
    $("announcement-message").value = announcement.message || "";
    $("announcement-tone").value = announcement.tone === "warning" ? "warning" : "info";
    const promotion = record(valueFor("promotionBanner"));
    $("promotion-title").value = promotion.title || "";
    $("promotion-message").value = promotion.message || "";
    $("promotion-link").value = promotion.href || "";
    const featured = valueFor("featuredChannels");
    $("featured-channel-ids").value = (Array.isArray(featured) ? featured : record(featured).ids || []).join("\n");
    $("live-tv-ad").checked = record(record(valueFor("adPlacements")).liveTvBanner).enabled !== false;
    $("patreon-url").value = record(valueFor("supportLinks")).patreon || "";
    $("coffee-url").value = record(valueFor("supportLinks")).buyMeACoffee || "";
    const home = record(valueFor("homeLayout"));
    $("hero-limit").value = home.heroLimit || 3;
    $("live-limit").value = home.liveLimit || 8;
    $("fixture-limit").value = home.fixtureLimit || 16;
    $("show-hero").checked = home.showHero !== false;
    $("show-live-now").checked = home.showLiveNow !== false;
    $("show-fixtures").checked = home.showFixtures !== false;
    $("show-news").checked = home.showNews !== false;
    $("home-banner-ad").checked = record(record(valueFor("adPlacements")).homeBanner).enabled !== false;
    const news = record(valueFor("newsFeed"));
    $("news-enabled").checked = news.enabled !== false;
    $("news-source-url").value = news.sourceUrl || "https://sports803tv.blogspot.com/feeds/posts/default?alt=json";
    $("news-max-items").value = news.maxItems || 8;
    renderChannelRules();
    renderCuratedArticles();
  }

  function renderChannelRules() {
    const rules = record(valueFor("channelOverrides"));
    const target = $("channel-rules");
    target.replaceChildren();
    const entries = Object.entries(rules);
    if (!entries.length) { target.textContent = "No channel rules saved yet."; return; }
    entries.forEach(([id, rule]) => {
      const row = document.createElement("div");
      const item = record(rule);
      row.className = "rule-row";
      row.textContent = `${id} · ${item.reliability || "reliable"}${item.hidden ? " · hidden" : ""}${item.featured ? " · featured" : ""}`;
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "link-button"; remove.textContent = "Remove";
      remove.addEventListener("click", () => { const next = { ...rules }; delete next[id]; save("channelOverrides", next, "Channel rule removed.").catch(showError); });
      row.append(remove); target.append(row);
    });
  }

  function renderCuratedArticles() {
    const news = record(valueFor("newsFeed"));
    const target = $("curated-articles");
    target.replaceChildren();
    const articles = Array.isArray(news.curated) ? news.curated : [];
    if (!articles.length) { target.textContent = "No hand-picked stories saved. The Blogger feed will still be shown."; return; }
    articles.forEach((article, index) => {
      const item = record(article);
      const row = document.createElement("div");
      row.className = "rule-row";
      row.textContent = item.title || `Featured story ${index + 1}`;
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "link-button"; remove.textContent = "Remove";
      remove.addEventListener("click", () => { const next = articles.filter((_, itemIndex) => itemIndex !== index); save("newsFeed", { ...news, curated: next }, "Featured story removed.").catch(showError); });
      row.append(remove); target.append(row);
    });
  }

  function showError(error) { setStatus(error instanceof Error ? error.message : "Something went wrong."); }

  async function load() {
    if (!token()) { dashboard.hidden = true; loginCard.hidden = false; logout.hidden = true; return; }
    try {
      const [configResponse, auditResponse] = await Promise.all([api("/api/admin/control-config"), api("/api/admin/control-audit")]);
      if (!configResponse.ok || !auditResponse.ok) throw new Error("Your owner session has expired. Please sign in again.");
      config = (await configResponse.json()).config || [];
      const logs = (await auditResponse.json()).audit || [];
      $("audit-list").replaceChildren(...logs.map((entry) => { const item = document.createElement("li"); item.textContent = `${entry.action}: ${entry.configKey}`; return item; }));
      fillForms(); dashboard.hidden = false; loginCard.hidden = true; logout.hidden = false; setStatus("Dashboard ready. Changes appear when the app refreshes.");
    } catch (error) { sessionStorage.removeItem(TOKEN_KEY); dashboard.hidden = true; loginCard.hidden = false; logout.hidden = true; showError(error); }
  }

  $("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const response = await api("/api/admin/dashboard-login", { method: "POST", body: JSON.stringify({ username: $("username").value, password: $("password").value }) });
      if (!response.ok) throw new Error((await response.json()).error || "Unable to sign in.");
      const data = await response.json(); sessionStorage.setItem(TOKEN_KEY, data.token); $("password").value = ""; await load();
    } catch (error) { showError(error); }
  });
  $("refresh").addEventListener("click", () => load());
  logout.addEventListener("click", () => { sessionStorage.removeItem(TOKEN_KEY); setStatus("Signed out."); load(); });
  document.querySelectorAll(".clear").forEach((button) => button.addEventListener("click", () => save(button.dataset.control, {}, "Removed. The app will hide this item after its next refresh.").catch(showError)));
  $("announcement-form").addEventListener("submit", (event) => { event.preventDefault(); save("announcement", { title: $("announcement-title").value.trim(), message: $("announcement-message").value.trim(), tone: $("announcement-tone").value }, "Announcement saved.").catch(showError); });
  $("promotion-form").addEventListener("submit", (event) => { event.preventDefault(); save("promotionBanner", { title: $("promotion-title").value.trim(), message: $("promotion-message").value.trim(), href: $("promotion-link").value.trim() }, "Featured banner saved.").catch(showError); });
  $("home-layout-form").addEventListener("submit", (event) => { event.preventDefault(); Promise.all([
    save("homeLayout", { showHero: $("show-hero").checked, showLiveNow: $("show-live-now").checked, showFixtures: $("show-fixtures").checked, showNews: $("show-news").checked, heroLimit: Number($("hero-limit").value) || 3, liveLimit: Number($("live-limit").value) || 8, fixtureLimit: Number($("fixture-limit").value) || 16 }),
    save("adPlacements", { ...record(valueFor("adPlacements")), homeBanner: { enabled: $("home-banner-ad").checked } }),
  ]).then(() => setStatus("Home layout saved. Refresh the app to see the new composition.")).catch(showError); });
  $("news-form").addEventListener("submit", (event) => { event.preventDefault(); const current = record(valueFor("newsFeed")); const title = $("curated-title").value.trim(); const href = $("curated-link").value.trim(); const curated = Array.isArray(current.curated) ? current.curated : []; const next = title && href ? [...curated, { id: `story-${Date.now()}`, title, href, summary: $("curated-summary").value.trim(), imageUrl: $("curated-image").value.trim(), category: $("curated-category").value.trim() || "Sports803TV" }] : curated; save("newsFeed", { ...current, enabled: $("news-enabled").checked, sourceUrl: $("news-source-url").value.trim(), maxItems: Number($("news-max-items").value) || 8, curated: next }, title && href ? "News settings and featured story saved." : "News settings saved.").then(() => { $("curated-title").value = ""; $("curated-link").value = ""; $("curated-summary").value = ""; $("curated-image").value = ""; $("curated-category").value = ""; }).catch(showError); });
  $("clear-curated").addEventListener("click", () => { const current = record(valueFor("newsFeed")); save("newsFeed", { ...current, curated: [] }, "Featured stories removed.").catch(showError); });
  $("live-tv-form").addEventListener("submit", (event) => { event.preventDefault(); Promise.all([save("featuredChannels", { ids: lines($("featured-channel-ids").value) }), save("adPlacements", { ...record(valueFor("adPlacements")), liveTvBanner: { enabled: $("live-tv-ad").checked } })]).then(() => setStatus("Live TV settings saved.")).catch(showError); });
  $("channel-rule-form").addEventListener("submit", (event) => { event.preventDefault(); const id = $("channel-id").value.trim(); if (!id) return; const rules = record(valueFor("channelOverrides")); save("channelOverrides", { ...rules, [id]: { reliability: $("channel-reliability").value, priority: Number($("channel-priority").value) || 0, note: $("channel-note").value.trim(), featured: $("channel-featured").checked, hidden: $("channel-hidden").checked } }, "Channel rule saved.").then(() => event.target.reset()).catch(showError); });
  $("support-form").addEventListener("submit", (event) => { event.preventDefault(); save("supportLinks", { patreon: $("patreon-url").value.trim(), buyMeACoffee: $("coffee-url").value.trim() }, "Support links saved.").catch(showError); });
  load();
})();
