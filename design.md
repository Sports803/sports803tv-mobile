# Sports803TV Mobile Interface Design

## Product direction

Sports803TV Mobile is a portrait-first sports streaming companion. It should feel like a focused first-party sports app rather than a wrapped website: fast event discovery, clear live status, one-tap playback, and persistent personal shortcuts. The visual system uses a deep navy-black canvas, red live accent, restrained surfaces, and dense but readable sports metadata.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Home | Live and upcoming events from `s803config/todaysMatches`, category chips, pull-to-refresh, native event cards, favorite toggles, recently viewed row, and home banner placement. |
| Event player | Immediate stream playback, source/server switcher, event title, teams, logos, league, score/status, favorite action, report/unavailable state, player banner placement, and back interception for interstitial handling. |
| Live TV | Channels from `livetv/channels`, channel logos/names, live badges, pull-to-refresh, and full-screen channel playback. |
| Favorites | Locally saved events and teams, filtered event list, empty state with a return-to-Home action. |
| More | About Sports803TV, data freshness, app settings, clear history/favorites, support/report links, and privacy/ad explanation. |
| Full-screen channel player | Landscape-capable or full-screen video view for a selected Live TV channel with a clear close/back action. |

## Primary user flows

1. User opens Home. The app loads `s803config/todaysMatches`, normalizes Firebase records, shows shimmer cards while loading, and renders category chips. User taps a chip to filter locally without another Firebase request.
2. User taps an event card or stream action. The app records the event in local history, opens the player, selects the first usable stream, and begins playback immediately without an extra play button.
3. User taps another source button below the player. The current source changes in place and the selected source is visibly marked.
4. User presses back from the player. The app attempts to show the configured interstitial, then returns to the previous screen. If the ad is not loaded, navigation must still work.
5. User opens Live TV. The app loads `livetv/channels`, presents native channel rows, and opens a full-screen player on selection.
6. User stars an event. The event ID is stored in AsyncStorage and appears in Favorites. History stores a small bounded list of recently viewed event IDs and is surfaced on Home.
7. User pulls down on Home or Live TV. The app performs a fresh read, updates the last-refresh timestamp, and displays a non-blocking error state if the network is unavailable.

## Layout and interaction

All screens assume mobile portrait orientation and one-handed use. The top area uses a compact branded header, while filters use horizontally scrolling chips with a minimum 44-point touch target. Event cards use a two-column team presentation, a strong time/status row, a single primary Watch action, and a secondary favorite icon. Lists use `FlatList` with stable keys and bottom safe-area padding.

The player screen gives the video the first 60 percent of the visual hierarchy. Source buttons sit immediately below it. The lower section contains the match detail panel and score/status information. Ads are separated from controls: the player banner appears below match details, while the back interstitial is non-blocking and never prevents navigation.

## Color choices

| Token | Color | Usage |
|---|---|---|
| Background | `#080C18` | App canvas and full-screen player background |
| Surface | `#11182A` | Event cards, panels, bottom sheets |
| Elevated surface | `#17213A` | Selected cards, source switcher, settings groups |
| Accent red | `#E0102A` | Live badges, primary actions, active tab, focused states |
| Accent red dark | `#A90D21` | Pressed state and gradients |
| Text primary | `#F7F8FC` | Headings and team names |
| Text secondary | `#9AA6BE` | League, time, and explanatory metadata |
| Success | `#36D399` | Available/live confirmation |
| Warning | `#F4B740` | Delayed or checking state |
| Divider | `#26314A` | Card borders and list separation |

## Typography and motion

Use Poppins Bold/SemiBold for app title, live labels, team names, and primary actions. Use Inter Regular/Medium for metadata and settings. Skeletons use a low-contrast shimmer. Card press uses a subtle opacity/scale response. Hero transitions are restrained and must not delay playback.

## Data vocabulary

`SportsEvent` includes `id`, `kickoff`, `homeName`, `awayName`, `homeLogo`, `awayLogo`, `category`, `leagueName`, `score`, `statusType`, `channels`, and optional `competitionLabel`. `LiveChannel` includes `id`, `name`, `logo`, `src`, `isLive`, and optional `category`. Firebase normalization must accept the existing canonical `todaysMatches` records and legacy aliases without changing the source database.

## Ad placement policy

The requested AdMob identifiers are configuration values, not visual content. Native ad components should be isolated behind a provider interface so the app remains testable in development. Test IDs must be used during development builds, and production IDs should be enabled only in the release configuration. Ads must never cover playback controls, block back navigation, or appear in a way that resembles a stream button.

## Manus migration constraints

The imported Expo SDK 54, Expo Router, TypeScript, and NativeWind structure is the source of truth for this migration. The Android package `com.app.sports803tvmobile` and the slug `sports803tv-mobile` are retained unless Expo account ownership makes a change unavoidable. Firebase public-read paths, Firebase event and channel normalization, Sportmonks contracts if present, stream URL precedence, iframe player behavior, and any sharing or deep-link routes are compatibility boundaries: they must not be altered during import. Public client configuration may remain in Expo-safe configuration, while private server credentials must be supplied only through protected environment settings and must never enter source control, app bundles, logs, or generated files.
