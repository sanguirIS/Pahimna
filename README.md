# Pahimna

[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![CI](https://github.com/sanguirIS/Pahimna/actions/workflows/ci.yml/badge.svg)](https://github.com/sanguirIS/Pahimna/actions/workflows/ci.yml)

Pahimna is the personal website and creative hub of **Klenn Pahimna** — a portfolio, vlog showcase, family memories gallery, and a collection of web tools (password generator, photo editor), built with vanilla HTML/CSS/JavaScript.

> Developed by [Klenn Pahimna](https://github.com/sanguirIS) — Balbalungao, Lupao, Nueva Ecija, Philippines

## Features

- **Captcha gate** — human-authentication before entering the site (`HOME.html`)
- **Personal portfolio** — skills, education, certifications & achievements (`info.html`)
- **Vlog showcase** — YouTube channel highlights and personal videos (`Klenn.html`)
- **Memories gallery** — family, school, and community photo/video collections (`hytemala/`)
- **Web tools** — password idea generator, photo editor (`hytemala/pass.html`, `hytemala/pectol.html`)
- **Suggestion box** — feedback form powered by FormSubmit

## Pages

| Page | Description |
| --- | --- |
| `HOME.html` | Human-authentication (captcha) entry gate |
| `Klenn.html` | Main site: vlogs, memories, projects, editing tools |
| `info.html` | Personal portfolio & certifications |
| `waiting.html` | "Coming soon" / waiting page |
| `terms&regulation.html` | Site terms & regulations |
| `hytemala/` | Sub-pages: family memories, passwords, photo editor |

## Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript, Bootstrap 5, Tailwind CSS (CDN), AOS scroll animations
- **Icons & Fonts:** Line Awesome, Font Awesome, Material Symbols

## Getting Started

### Run locally

The site is fully static — no build step or dependencies required. Either open
`HOME.html` directly in your browser, or use the preview server:

```bash
npm run serve
```

Then open `http://localhost:8080` (use `npm run serve -- 3000` to pick a different port).

## Testing

Smoke tests run automatically in CI on every push and pull request. Run them locally with:

```bash
npm test
```

The suite checks that every source file carries the GPL-3.0 notice, the HTML/CSS/JS files are structurally sound, all JavaScript parses, and the site serves correctly over HTTP.

## Project Structure

```
├── HOME.html                  # Captcha entry gate
├── Klenn.html                 # Main personal website
├── info.html                  # Portfolio page
├── waiting.html               # Waiting / coming-soon page
├── terms&regulation.html      # Terms & regulations
├── design/                    # Stylesheets
├── JavaScript/                # Client-side scripts
├── assets/                    # Fonts and images
├── fonts/                     # Icon font files (Line Awesome)
├── hytemala/                  # Sub-pages & tools
├── package.json
└── LICENSE
```

## Docs

- [CHANGELOG.md](CHANGELOG.md) — release history

## Contributing

Contributions are welcome! Please open an issue or pull request.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

---

(c) 2026 DJKAM & DEVKLENN — Made with love.
