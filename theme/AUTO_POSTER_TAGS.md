# Sports803TV Blogger Auto-Poster Labels

Use these **exact primary Blogger labels** when the event auto-poster creates articles. The updated companion theme exposes matching widgets that link to each category archive.

| Widget | Primary label | Supported related labels |
|---|---|---|
| Motorsport | `Motorsport` | `Formula 1`, `F1`, `MotoGP`, `WRC`, `NASCAR` |
| Basketball | `Basketball` | `NBA`, `WNBA`, `EuroLeague`, `NBL` |
| Fighting | `Fighting` | `Boxing`, `MMA`, `UFC`, `WWE`, `Kickboxing` |
| Football | `Football` | `Soccer`, `Premier League`, `La Liga`, `Champions League`, `CAF` |

Every auto-post should include one primary label plus any relevant related labels. For example, an F1 race recap should include `Motorsport`, `Formula 1`, and `F1`.

## Live TV policy

The companion theme now replaces browser Live TV widgets and Live TV navigation with an app-install prompt. The button uses `S803_CFG.APP_LINK` when it contains a valid `http` or `https` URL. Until an APK is attached to a GitHub Release, it falls back to the Sports803TV Releases page. Update `APP_LINK` in Firebase as soon as the Android APK has a public download URL.
