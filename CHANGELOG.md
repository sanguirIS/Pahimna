# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Upgraded `@azure/functions` to `4.16.2` (resolves the `undici` vulnerabilities reported by `npm audit`/Dependabot).

### Added

- `npm run serve` — dependency-free static preview server (`scripts/serve.js`) for browsing the site locally without the Azure Functions host.
- `npm test` — permanent smoke test (`scripts/smoke-test.js`) covering GPL notice headers, file structure, JS syntax, and HTTP serving of the site.
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) that runs the smoke tests on every push to `main` and on pull requests.

## [1.0.0] - 2026-08-09

### Changed

- **License migration to GPL-3.0** — the custom proprietary software agreement was
  replaced with the [GNU General Public License v3.0](LICENSE) (or any later
  version), Copyright (C) 2026 DJKAM & DEVKLENN. The project is now free
  (open-source) software.
- Added the FSF-recommended GPL-3.0 notice header to all 32 project-owned
  HTML, CSS, and JavaScript source files. Third-party vendored assets
  (Bootstrap, Line Awesome, AOS) were left untouched and retain their own
  licenses.
- Updated `terms&regulation.html` to match the GPL-3.0 license: code rights and
  the personal-media carve-out (Section 2), contribution licensing (Section 3),
  permitted uses of the code (Section 6), the GPL warranty disclaimer
  (Section 8), and a new License section (Section 10).
- Rewrote `README.md` as a full technical README covering features, pages,
  tech stack, local setup, Azure deployment, and project structure.
- Added project metadata to `package.json`: a `description` and
  `"license": "GPL-3.0-or-later"`.

### Added

- `CONTRIBUTING.md` — contribution guidelines (PR checklist, development
  setup, code style, commit conventions, issue reporting).
- `CHANGELOG.md` — this file.

### Notes

- Personal media content (videos, photos, animations) displayed on the website
  is **not** covered by the GPL-3.0 license and remains the property of its
  creators or respective rights holders.
- The site's Terms of Service page contains the full user-facing license
  notice and a link to the official GPL-3.0 text.
