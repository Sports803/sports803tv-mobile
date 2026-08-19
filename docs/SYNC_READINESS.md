# Synchronization Readiness

The imported source contains no Blogger or ImgBB configuration, and the current task has no configured Blogger or ImgBB connector and no active schedule. No automated cross-publisher synchronization was created because that would require an authenticated publisher destination and clear write permission.

The app now supports optional Sportmonks fixture enrichment behind a server-only `SPORTMONKS_API_TOKEN`. Firebase remains the primary application source for Live TV and event discovery. The protected Sportmonks endpoint caches a fixture for 60 seconds and returns a safe availability response instead of passing the credential to mobile clients.

To enable a future publisher workflow, provide the target Blogger site and authenticated publishing integration, specify whether posts, event schedules, or thumbnails are authoritative, and approve a schedule. ImgBB should be enabled only if externally hosted image uploads are required; its key must remain server-side.
