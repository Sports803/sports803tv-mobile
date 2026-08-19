# Reference Preview Inspection Notes

The supplied Manus preview URL presents an Expo Go QR-code handoff in the browser rather than an interactive device preview. Its native Live TV and support controls therefore cannot be inspected visually from this browser session. The comparison will use the user-confirmed requirements together with the project source and current Firebase contracts: Live TV channels from `livetv/channels` must preserve iframe URLs and open an iframe-capable player, while visible support controls must be restored where configuration supplies a destination.

## Verified implementation differences

The public `livetv/channels` collection contains 89 records, of which 17 of 18 usable HTTP sources have an iframe-oriented URL pattern and five have direct-media extensions. The prior normalizer treated a channel as an iframe only when dedicated fields such as `iframeUrl` existed, so most URL-valued Firebase channel records could be selected for the native video player rather than the WebView iframe player. The remediation will preserve each raw URL—including query parameters such as `embed` and `mora`—and classify direct HLS, DASH, and MP4 streams separately from iframe-oriented URLs.

No donation or support key is populated in the public Firebase configuration. The user supplied a Patreon destination and a Buy Me a Coffee destination, both of which resolve successfully and will appear as explicit support actions in Live TV, channel playback, and More. No credentials or private Firebase data are required for this client-visible navigation.
