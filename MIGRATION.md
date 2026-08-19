# Sports803TV Migration Record

**Migration status:** Ready for a checkpoint retry. The project was imported from the supplied ZIP into the new Manus mobile project without replacing the Expo SDK 54 source with a blank app.

## Imported application scope

The migration retained the imported Expo Router navigation, TypeScript, NativeWind styling, dark Sports803TV theme, Firebase event and Live TV data flow, player and channel-player routes, iframe player behavior, favorites and history persistence, recommendations, donation links, notification and advertising integration boundaries, and the existing test suite. The imported project includes its app, components, libraries, server files, shared types, assets, and tests.

| Area | Migration outcome |
| --- | --- |
| Expo runtime | Expo SDK 54 project preserved and dependency patches aligned with Expo Doctor. |
| App identity | Slug remains `sports803tv-mobile`; Android package remains `com.app.sports803tvmobile`. |
| Firebase | Existing production paths, including `s803config/todaysMatches` and `livetv/channels`, were retained. No production data was changed. |
| Playback | Stream normalization, stream URL precedence, iframe player behavior, and player routes were retained. |
| Ads | Native AdMob loading is guarded so Expo Go uses a safe no-op fallback while release builds retain native advertising support. |
| Icon assets | A compact reference-inspired Sports803TV icon is installed at the required Expo icon, splash, favicon, and Android foreground paths. Each native asset is below 1 MiB. |

## New Expo and EAS association

The supplied new Expo Personal Access Token authenticated successfully, and the app is now associated with the selected **`uganda`** Expo owner.

| Setting | Value |
| --- | --- |
| Expo project | `@uganda/sports803tv-mobile` |
| New EAS project ID | `4b81361d-7506-414c-9678-f0384fe2d69d` |
| Old EAS project metadata in ZIP | None found; there was no project reference to transfer. |
| Existing Android package | Retained as `com.app.sports803tvmobile`. |

> A new EAS project has its own update and build ownership. Existing installs associated with a prior EAS project will not receive updates from this new project. A store update using the same Android package must use the original Android signing lineage (for example, the existing upload key or the relevant Google Play App Signing setup); otherwise the new account can create a build but cannot replace an already signed published app.

## Security and configuration boundaries

The Expo token was requested and stored through protected project configuration; it was never printed in logs or source. The import scan found no Firebase service-account key, Expo token, NVIDIA key, ImgBB key, PEM/P12 key, or `.env` credential file in the imported source. Public client configuration remains distinct from private credentials.

| Configuration category | Status |
| --- | --- |
| New Expo authentication | Configured securely as `EXPO_TOKEN`. |
| Public Firebase event and Live TV paths | Preserved in client-safe configuration; no writes or migrations performed. |
| Firebase Admin/service credentials | Not present in the ZIP and not required for the imported mobile flows. |
| Sportmonks credentials | No executable Sportmonks integration or configuration reference was found in the ZIP, so no token was requested or tested. If this integration is restored later, its token must be stored server-side only. |
| Share-event route | No dedicated share-event route was present in the imported executable source; existing deep-link route contracts were validated without inventing a replacement route. |

## Validation record

| Check | Result |
| --- | --- |
| TypeScript (`pnpm check`) | Passed. |
| Vitest (`pnpm test`) | Passed: 4 files and 10 tests; 1 existing auth logout test remains intentionally skipped. |
| ESLint (`pnpm lint`) | Passed. Node emitted a non-blocking module-type performance warning for `eslint.config.js`. |
| Expo configuration | Passed with the migrated app identity and EAS linkage. |
| Expo Doctor | Passed: 18 of 18 checks. |
| Static web export | Passed with 18 static routes, including player and channel-player routes. |
| Firebase and Live TV normalization | Passed through deterministic normalization tests. |
| Deep-link contract | Passed through deterministic player-route contract tests. |
| Expo Go native-module safeguard | Passed: AdMob native imports are guarded for Expo Go. |
| EAS linkage | Confirmed for `@uganda/sports803tv-mobile`. |

## Android APK build steps after the checkpoint is saved

Do **not** publish automatically. Once a successful checkpoint appears in the project interface, open the **Management UI**, then use the **Publish** button in the upper-right header. Select the **Android** target and choose the **APK** build option (rather than an app-bundle-only release if you need a directly installable APK). Confirm the build under the `uganda` Expo owner.

The first build under this new EAS project may require Android signing credentials. If the goal is to update an app already distributed through Google Play with the same package identity, use the original signing credentials or complete the appropriate Play App Signing transfer; do not create a new signing identity for an in-place store update unless the distribution plan permits it.
