# Sportmonks Match Center Integration Notes

Sportmonks Football API 3.0 uses the base URL `https://api.sportmonks.com/v3/football`. Requests may authenticate with either an `api_token` query parameter or an `Authorization` header. The source token must remain server-only; the mobile client must call the protected project API rather than Sportmonks directly.

For a fixture-backed Match Center, request the fixture endpoint with only needed includes, for example participants, events, statistics, lineups, and standings where the customer subscription supports them. Include relations can reduce round trips but increase response size, so the app should request the basic fixture first and use a short-lived server cache before loading richer tabs.

## Sources

- Sportmonks, [Making your first request](https://docs.sportmonks.com/v3/welcome/making-your-first-request), accessed 2026-08-19.
- Sportmonks, [Get all fixtures](https://docs.sportmonks.com/v3/endpoints-and-entities/endpoints/fixtures/get-all-fixtures), accessed 2026-08-19.
- Sportmonks, [Includes](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/includes), accessed 2026-08-19.
