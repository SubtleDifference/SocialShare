# Changelog

## [1.1.1] - 2026-10-30

### Added

- Dependency-free labelled controls generated with `data-ss-platforms`, with optional custom icons.
- Container-level URL, text and handle settings, explicit action attributes, and a small JavaScript API.
- Native sharing where supported, copy feedback, keyboard support, visible focus and reduced-motion handling.
- A pinned build process, compatibility/security regressions, and licence/version checks for release files.

### Fixed

- Sharing with extra styling classes, missing optional text, and double-encoded Messenger/Rocket.Chat URLs.
- Native URI space encoding, clipboard failure reporting and duplicate/late initialisation.
- External-window opener isolation in the readable and minified scripts, plus prepared sharing links.
- Fixed icon-only control sizing and copy-error visibility on narrow screens.

### Changed

- Consolidated CSS and added theme variables while retaining existing layout/service classes and the legacy global helper.
- Replaced the demo's stale inline script and external framework/icon dependencies with the maintained library.
- Updated setup, customisation, compatibility and privacy documentation.
- Included the complete MIT notice in readable/minified JavaScript and CSS and the demo files. Build output retains it automatically.

Earlier repository revisions were unversioned. This is the first tagged release.
