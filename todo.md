# Project TODO

- [x] Configure Sports803TV branding, logo assets, app name, and dark theme tokens
- [x] Add Poppins and Inter font loading
- [x] Add four-tab navigation: Home, Live TV, Favorites, More
- [x] Define shared Firebase event and Live TV channel types
- [x] Load `s803config/todaysMatches` with normalization and pull-to-refresh
- [x] Render native event cards with team logos, status, score, and category chips
- [x] Add local category filtering without reloads
- [x] Add AsyncStorage favorites and recently viewed history
- [x] Add Home recently viewed section and Favorites screen
- [x] Implement player screen with immediate playback and source switching
- [x] Add player match details, score/status, loading, unavailable, and empty states
- [x] Add player back navigation with optional interstitial ad hook
- [x] Load `livetv/channels` and implement Live TV channel list
- [x] Implement full-screen channel playback
- [x] Add AdMob configuration and isolated banner/native/interstitial placement components
- [x] Update Sports803/Event with Live TV add/edit controls and Firebase `livetv/channels` writes
- [x] Add deterministic tests for Firebase normalization, filtering, favorites, history, and ad configuration
- [x] Validate TypeScript, lint, tests, and native/web rendering
- [ ] Save final checkpoint and provide APK build instructions through the project UI
- [x] Diagnose unavailable Expo preview
- [x] Diagnose Android APK build failure
- [x] Apply and validate preview/build compatibility fixes
- [x] Diagnose EAS Android Gradle failure from Build APK
- [x] Apply native build fix and validate a retry-ready checkpoint
- [x] Fix player crash when selected Firebase event has no channels array
- [x] Validate safe stream fallback and event click flow
- [x] Add Home search bar across teams, leagues, sports, and event titles
- [x] Validate combined search/category filtering and preview export
- [x] Add Live, Upcoming, and Ended status classification and filters
- [x] Add default live-upcoming-ended sorting with search/category composition
- [x] Determine whether repeated EAS Gradle failure is caused by AdMob
- [x] Apply and validate the safest APK build configuration
- [x] Enable New Architecture and Hermes for Reanimated
- [x] Add explicit AdMob Android app ID metadata
- [x] Validate native configuration and APK retry readiness
- [x] Identify the actual EAS failed Gradle task from the preceding log section
- [x] Apply the next targeted Android build fix or confirm the missing log is required
- [x] Resolve Expo Doctor’s three failed checks and outdated SDK 54 packages
- [x] Validate a clean Expo Doctor and APK-ready configuration

- [x] Diagnose the latest attached APK build failure: Expo schema rejected 254x74 icon and foreground assets
- [x] Replace invalid rectangular branding assets with square PNGs while preserving the logo
- [x] Re-run Expo Doctor, TypeScript, lint, tests, web export, and Android prebuild validation

- [x] Fix `react-native-google-mobile-ads:compileReleaseKotlin` Kotlin metadata mismatch from Google Mobile Ads 25.4.0
- [x] Re-run full validation after the AdMob dependency fix
- [x] Save a retry-ready checkpoint after the AdMob build fix

- [x] Add Popular Matches section above the main event list
- [x] Add responsive compact match-card grid with Firebase-driven popularity ordering
- [x] Validate card taps, filters, search, and responsive Home rendering

- [x] Convert the complete event list from full-width cards to a responsive grid
- [x] Fix stale live labels so events past their end time classify as ended
- [x] Restrict Popular matches to live/upcoming major football leagues and competitions
- [x] Validate the professional grid, status labels, filters, and Popular section

- [x] Add team logos and a richer match hero to the Player screen
- [x] Show score, live/upcoming/ended status, kickoff, league, and stream metadata
- [x] Improve stream switching controls and selected-source feedback
- [x] Add recommended live events and viewer guidance below the player
- [x] Validate Player navigation, stream switching, recommendations, and responsive layout

- [x] Remove ended events from Home and Player recommendation surfaces
- [x] Keep only live and upcoming events visible after refresh and status changes
- [x] Validate live/upcoming-only empty states and navigation

- [x] Add upcoming-match reminders with local scheduling
- [x] Add live score and status polling while viewing a match
- [x] Add league and competition browsing pages
- [x] Add automatic stream fallback when a source fails
- [x] Add team and league favorites
- [x] Add countdown timers for upcoming matches
- [x] Add notification permission and favorite-match notifications
- [x] Add a separate Results archive for ended matches
- [x] Add personalized Home sections for favorite teams and leagues
- [x] Add stream reporting for broken or inappropriate sources
- [x] Validate all ten enhancements across native-safe and web behavior

- [x] Add team pages and league/competition pages with live and upcoming fixtures
- [x] Add live match timelines and richer score updates
- [x] Add remote push-notification readiness and favorite-team alert workflows
- [x] Add personalized Home sections, countdowns, and results archive improvements
- [x] Add stream recovery, picture-in-picture, and casting-ready playback controls
- [x] Add data-saver mode and media refresh controls
- [x] Add news and highlights surfaces
- [x] Add stream reporting improvements and moderation-ready metadata
- [x] Validate the complete feature expansion across native-safe and web behavior

- [x] Import the uploaded Sports803TV Expo SDK 54 source over the blank Manus scaffold while retaining Manus project metadata
- [x] Preserve the imported mobile design, Android package identity, app slug, Firebase paths, stream normalization, and iframe player behavior
- [x] Inspect and securely configure all required migration environment variables without exposing prior credentials
- [x] Authenticate Expo/EAS using the new Manus-account token and determine EAS project ownership migration requirements
- [x] Validate TypeScript, Vitest, ESLint, Expo configuration, web export, Firebase normalization, deep links, Sportmonks configuration, and Expo Go safeguards
- [ ] Save a passing migration checkpoint and provide Android APK publish/build instructions
- [x] Generate and apply a new dark Sports803TV launcher icon for this Manus project before checkpointing
- [x] Replace the oversized launcher icon with a compact reference-inspired Sports803TV icon and retry the migration checkpoint
