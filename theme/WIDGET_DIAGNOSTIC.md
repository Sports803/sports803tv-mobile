# Sports803 Blogger Widget Diagnostic Guide

## What was verified

The live homepage was checked on **19 August 2026**. The sidebar Live TV widget rendered six channels, Trending rendered five ranked posts, and the Watch History widget rendered its expected empty-state message. The public Firebase endpoints for `livetv/channels` and `config` were reachable at the time of testing.[1] [2]

| Item | Live result | Interpretation |
|---|---|---|
| `HTML100` / `sidebar-livetv-widget` | Visible, populated with channels | The `livetv/channels` read path is available and the renderer is working. |
| `HTML102` / `sidebar-trending-feed` | Visible, populated with ranked posts | The `trending` read path and its client renderer are working. |
| `HTML103` / `sidebar-history-feed` | Visible with an empty state | Expected for a browser/device with no recorded website history. History is scoped to the local device ID. |
| `HTML1` | Script-only updater | It updates `.s803-matches .containerMatch` cards. It is not a visual featured panel by itself. |
| `HTML2` | Script-only remote configuration loader | It fetches `/config.json` and applies switches, branding, navigation, and optional ads. It intentionally has no card output. |
| `HTML8` | Script-only match-status helper | It decorates existing `.containerMatch` elements. It intentionally has no card output. |

> A **visible widget container with no body content** is not necessarily broken. `HTML1`, `HTML2`, and `HTML8` are helper scripts; their effect appears only when their matching target elements or configuration are present.

## Why a widget can look empty

The installed theme uses a browser-specific `s803_device_id` in local storage. A fresh browser, a private tab, or cleared site data receives a new identifier, so the Liked Posts, Saved Posts, and Watch History widgets correctly begin empty. The live site is intentionally app-only for browser Live TV playback; its gate may replace an on-page player but does not stop the sidebar channel list from loading.

The static `sports803-featured-widgets` placeholder block is located in the Blogger **comments includable**, not in the homepage content area. It therefore cannot be used as a homepage featured-panel renderer. If a real featured panel is required, create its visible markup inside the homepage/featured section and use a dedicated loader there rather than relying on `HTML1`.

## Fast browser-console checks

Open the site, then open the browser developer console and run the following commands. None writes data.

```js
await s803WidgetDiagnostics()
```

Expected output is an array where `config`, `livetv/channels`, and `trending` have `readable: true`. `exists: true` confirms that the path contains data.

```js
document.querySelectorAll('#sidebar-livetv-feed .sltv-item').length
document.querySelectorAll('#sidebar-trending-feed a').length
document.querySelectorAll('.s803-matches .containerMatch').length
```

The first two counts test visible Live TV and Trending rows. The third tests whether the match cards needed by `HTML1` and `HTML8` exist; a zero count means those two helpers have no cards to update on that page.

```js
localStorage.getItem('s803_device_id')
document.getElementById('sidebar-history-feed')?.innerText
```

These commands confirm the active browser identity and the current Watch History state. Do not clear local storage if you want to keep the current device’s history, saves, and likes.

## Firebase data contracts

The Live TV list accepts a Firebase object whose child records contain a name and stream URL. The theme supports either `src` or `url`, and optionally uses `logo`, `order`, `category`, and `isLive`.

```json
{
  "channel-id": {
    "name": "Example Sports",
    "src": "https://sports803.github.io/player/?embed=https://provider.example/embed",
    "logo": "https://example.com/logo.png",
    "order": 1,
    "isLive": true,
    "category": "football"
  }
}
```

The remote configuration is read from `/config.json`. It may contain keys such as `announcement`, `branding`, `features`, `leagues`, `navigation`, `ads`, and `customHtml`. Missing optional keys do not stop the base widgets. A test bypass is available by temporarily editing the `apply` call in `HTML2` locally, but the safer production test is to use the public `s803WidgetDiagnostics()` check above and make a small non-disruptive update to Firebase configuration.

Trending accepts a record with `title`, `url`, `thumb`, and numeric `likes`. Watch History is created by the website only when a visitor opens a tracked post, and is stored under `user_history/{browser-device-id}`. The public read rules must permit the frontend to read these paths; failed reads now show an explicit unavailable message instead of leaving a permanent loading label.

## Recommended verification sequence

1. Restore the corrected XML theme in Blogger, then force-refresh the page or open it in a private tab.
2. Run `await s803WidgetDiagnostics()` and confirm every required public path is readable.
3. Confirm that the Live TV and Trending counters are greater than zero.
4. Open one normal Blogger post in the same browser, return home, and confirm that Watch History has an entry if the site’s post-view tracking is enabled.
5. Test a homepage with match cards and run the `.s803-matches .containerMatch` count. A non-zero count confirms that the `HTML1` and `HTML8` helpers have work to perform.
6. If a read check fails, review the Firebase Realtime Database rules for the exact path and check the network request status; do not make credentials public in the theme.

## References

[1]: https://sports-803-1b806-default-rtdb.firebaseio.com/livetv/channels.json "Sports803 Live TV channels endpoint"
[2]: https://sports-803-1b806-default-rtdb.firebaseio.com/config.json "Sports803 public configuration endpoint"
