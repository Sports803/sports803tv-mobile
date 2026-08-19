# Sports803TV Expanded-Specification Gap Analysis

**Assessment date:** 19 August 2026  
**Scope:** Imported Expo SDK 54 mobile source and its managed Expo/EAS configuration. This review covers source-code behavior and configuration only; it does not alter the existing Firebase production dataset, existing stream records, or any external publisher account.

## Executive assessment

The imported application is a functioning **Firebase-first streaming companion**, rather than a complete multi-provider sports platform. Its strongest existing capabilities are Firebase event and Live TV retrieval, normalization of legacy stream-field aliases, a dark mobile-first discovery interface, iframe-based event playback, local favorites/history/reminders, responsive match cards, and guarded AdMob behavior for Expo Go. The new Uganda-owned Expo/EAS link, Android package identity, app slug, and compact launcher assets are already retained. [1] [2] [3]

> **Compatibility boundary.** Firebase paths, event normalization, and canonical iframe URLs are established contracts. Remediation must extend the model around those contracts rather than rewriting the source data or transforming stream URLs.

## Current capability matrix

| Area | Verified current behavior | Gap against the expanded specification | Priority |
|---|---|---|---|
| Firebase events | Reads `s803config/todaysMatches`, supports alternate field names, evaluates live/upcoming/ended state, and preserves usable HTTP(S) player URLs. | There is no provider identity, `fixtureId`, match-center payload, source attribution, or server-side validation. | High |
| Firebase Live TV | Reads `livetv/channels`, exposes a native Live TV list, and supports channel logos, categories, and an available-now state. | Channel playback assumes a raw video source and does not use the existing iframe wrapper where a channel record is an embedded player. There are no share, report, support, or source-fallback actions. | High |
| Home and discovery | Includes 2/3-column responsive match cards, category and state filters, text search, favorite-aware ordering, a popular-football rail, and recent history. | Search has no live suggestion layer; provider-specific event classification is not implemented; trending and recommendations are heuristic-only. | High |
| Event player | Shows teams, score, status, multi-source switching, back handling, report/reminder/favorite actions, an iframe player, a player ad slot, and related-event cards. | There is no share action, no Match Center, no score/lineup/stats/timeline/standings surface, and no source-specific integrity or playback telemetry. | High |
| Match Center | No route, provider query, fixture lookup, or dedicated data schema exists. | All requested Match Center tabs and Sportmonks-backed fixture detail are absent. | High |
| ESPN classification | No ESPN metadata, scorer, event classification utility, API client, or tests exist. | Football, basketball, NFL, hockey, baseball, motorsport, and combat-sports provider identities cannot be distinguished reliably. | High |
| Sportmonks | No Sportmonks SDK/client, server route, credential reference, data contract, or fallback handling exists. | The expected fixtures, standings, statistics, formations, and lineups cannot be requested. | High |
| Sharing and deep links | Notification responses and player navigation use `/player?eventId=…`; the player route reads `eventId`. | No `share-event` route, share sheet, canonical event-link builder, rich-preview endpoint, or social metadata is present. | High |
| Analytics and consent | No Firebase Analytics dependency, consent preference, event schema, or privacy/settings control is present. | App-open, tab, search, category, player, source, favorite, ad, and support taps are not recorded. | High |
| Ads | Google Mobile Ads is configured and uses runtime guards to avoid static native ad imports in Expo Go. [3] | No consent-aware ad lifecycle or ad-event analytics exists. Production ad units must remain release-build only. | Medium |
| Favorites, history, recommendations, settings | Favorites, history, team/league preferences, reminders, reports, data saver, and push tokens persist with AsyncStorage. | Preferences are device-local only. No analytics consent, privacy/ad controls, donation/support entry point, or optional account/cloud synchronization exists. | Medium |
| Blogger, ImgBB, NVIDIA, automated sync | The backend remains a template stub with no publisher workflow, image upload client, AI provider client, or scheduled synchronizer. | No server-only credential boundary or active-day synchronization architecture exists. | Medium |
| Build and release | Managed Expo config targets the Uganda-owned EAS project and preserves `com.app.sports803tvmobile`, `sports803tv-mobile`, portrait orientation, Hermes, and 64-bit Android architecture. [2] | There is no checked-in `eas.json` build profile and no generated APK artifact in the workspace to inspect. | Medium |

## High-impact remediation plan

The implementation pass should first add a backward-compatible provider identity layer to the existing `SportsEvent` contract. It should preserve Firebase event IDs and iframe URLs exactly, while allowing source metadata such as `provider`, `fixtureId`, `eventType`, `leagueId`, and `matchCenterAvailable` to be carried forward when the data is available. This enables explicit ESPN classification and a Sportmonks-first Match Center without changing Firebase reads. [1]

Next, the event player should gain an accessible Match Center trigger and a share action, and Live TV playback should use the current iframe component for embed records while retaining native video playback for direct media streams. This is a focused functional improvement over the current source-selection behavior and does not require modifying the Firebase dataset. [4] [5]

Analytics should be introduced behind a consent-aware interface. The interface can define all requested event names and record consent locally now, but native Firebase Analytics should not be enabled until the matching Android Firebase configuration is supplied and verified. This avoids claiming production telemetry that cannot run in a generic Expo Go client.

## Configuration boundary

| Configuration class | Treatment | Needed to complete feature |
|---|---|---|
| Firebase public database paths | Already in client source as public read endpoints; retain unchanged. | No new secret for current read-only Firebase event, Live TV, and news flows. |
| Expo/EAS token | Stored securely for the new Expo owner and not written to source. | Already configured for the current account. |
| Sportmonks API token | Private server-only credential. | Required before real fixture, lineup, formation, standing, and statistical data can be requested. |
| Blogger publishing authorization | Private server-only authorization. | Required only before publishing highlights or news drafts. |
| ImgBB API key | Private server-only credential. | Required only before upload automation is enabled. |
| NVIDIA/LLM credential | Private server-only credential. | Required only before AI summary or classification is enabled. |
| Firebase Analytics Android config | Native build configuration; do not hard-code it in TypeScript. | Required before enabling production Firebase Analytics. |

## Acceptance criteria for this remediation pass

The completed pass must retain existing data and navigation behavior, add regression coverage for classification, match-center fallback, share URL construction, analytics consent, and Live TV embed selection, and keep native advertising imports safe in Expo Go. TypeScript, Vitest, Expo lint, Expo configuration validation, and static web export must pass before a new checkpoint is saved. No APK, AAB, OTA update, publisher post, Firebase write, or external synchronization job should run automatically.

## References

[1]: ./lib/sports.ts "Firebase data contracts and stream normalization"
[2]: ./app.config.ts "Managed Expo and EAS configuration"
[3]: ./tests/native-module-safeguards.test.ts "Expo Go advertising safeguards"
[4]: ./app/player.tsx "Event player route"
[5]: ./app/channel-player.tsx "Live TV playback route"
