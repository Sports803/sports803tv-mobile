# Blogger Feed Integration Notes

## Verified source

The owner-provided public source is [Sports 803](https://sports803tv.blogspot.com/). It presents a live sports schedule with sport filters, live/upcoming/ended event filters, schedule data, and links to WhatsApp and Telegram community destinations.

## Integration boundary

The mobile app will treat the Blogger source as **read-only editorial input**. It will not attempt to write to, scrape credentials from, or modify the Blogger site. The owner dashboard will control whether the source is enabled, the source URL, the maximum number of displayed articles, and optional curated article cards. The app will use RSS/Atom-compatible data where available and will always offer an external article link when an item is opened.

## Product decision

The existing Firebase event and Live TV data remain the authority for stream availability and match playback. Blogger-derived content is limited to the Home and News editorial surfaces so it cannot alter Firebase stream identities, provider handling, or player behavior.
