(() => {
  const settings = window.SPORTS803_ADMIN;
  const keys = [
    "homeLayout", "featuredEvents", "featuredChannels", "channelOverrides",
    "promotionBanner", "adPlacements", "supportLinks", "reliabilityOverrides",
    "notificationCampaign", "announcement",
  ];
  const $ = (id) => document.getElementById(id);
  const status = $("status");
  const editor = $("editor");
  const audit = $("audit");
  const select = $("key");
  const value = $("value");
  let config = [];

  keys.forEach((key) => select.add(new Option(key, key)));

  function api(path, options = {}) {
    if (!settings?.apiBaseUrl) throw new Error("Set apiBaseUrl in admin/config.js before deployment.");
    return fetch(`${settings.apiBaseUrl.replace(/\/$/, "")}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  }

  function currentValue() {
    return config.find((entry) => entry.key === select.value)?.value ?? {};
  }

  function displayCurrent() {
    value.value = JSON.stringify(currentValue(), null, 2);
  }

  async function load() {
    try {
      const me = await api("/api/auth/me");
      if (!me.ok) throw new Error("Sign in required");
      const identity = await me.json();
      if (identity.user?.role !== "admin") throw new Error("This account is not an owner");
      const [configResponse, auditResponse] = await Promise.all([
        api("/api/admin/control-config"), api("/api/admin/control-audit"),
      ]);
      config = (await configResponse.json()).config || [];
      const logs = (await auditResponse.json()).audit || [];
      status.textContent = `Signed in as ${identity.user.name || "owner"}`;
      editor.hidden = false;
      audit.hidden = false;
      displayCurrent();
      $("audit-list").replaceChildren(...logs.map((entry) => {
        const item = document.createElement("li");
        item.textContent = `${entry.action}: ${entry.configKey}`;
        return item;
      }));
    } catch (error) {
      editor.hidden = true;
      audit.hidden = true;
      status.textContent = error.message;
    }
  }

  $("login").addEventListener("click", () => {
    if (!settings?.apiBaseUrl || !settings?.portalUrl || !settings?.appId || !settings?.dashboardUrl) {
      status.textContent = "Complete admin/config.js before publishing.";
      return;
    }
    const callback = `${settings.apiBaseUrl.replace(/\/$/, "")}/api/oauth/callback?returnTo=${encodeURIComponent(settings.dashboardUrl)}`;
    window.location.assign(`${settings.portalUrl.replace(/\/$/, "")}/sign-in?appId=${encodeURIComponent(settings.appId)}&redirectUri=${encodeURIComponent(callback)}`);
  });
  $("refresh").addEventListener("click", load);
  select.addEventListener("change", displayCurrent);
  $("save").addEventListener("click", async () => {
    try {
      const parsed = JSON.parse(value.value);
      const response = await api(`/api/admin/control-config/${encodeURIComponent(select.value)}`, {
        method: "PUT", body: JSON.stringify({ value: parsed }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Save failed");
      status.textContent = "Saved. Mobile clients will receive the public overlay on refresh.";
      await load();
    } catch (error) {
      status.textContent = error.message;
    }
  });
  load();
})();
