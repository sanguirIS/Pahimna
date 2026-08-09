# Pahimna

[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Pahimna is the personal website and creative hub of **Klenn Pahimna** — a portfolio, vlog showcase, family memories gallery, and a collection of web tools (weather, password generator, photo editor), built with vanilla HTML/CSS/JavaScript and an Azure Functions backend.

> Developed by [Klenn Pahimna](https://github.com/sanguirIS) — Balbalungao, Lupao, Nueva Ecija, Philippines

## Features

- **Captcha gate** — human-authentication before entering the site (`HOME.html`)
- **Personal portfolio** — skills, education, certifications & achievements (`info.html`)
- **Vlog showcase** — YouTube channel highlights and personal videos (`Klenn.html`)
- **Memories gallery** — family, school, and community photo/video collections (`hytemala/`)
- **Web tools** — weather app, password idea generator, photo editor (`hytemala/welder.html`, `hytemala/pass.html`, `hytemala/pectol.html`)
- **Suggestion box** — feedback form powered by FormSubmit
- **Serverless API** — HTTP endpoint via Azure Functions (`src/`)

## Pages

| Page | Description |
| --- | --- |
| `HOME.html` | Human-authentication (captcha) entry gate |
| `Klenn.html` | Main site: vlogs, memories, projects, editing tools |
| `info.html` | Personal portfolio & certifications |
| `waiting.html` | "Coming soon" / waiting page |
| `terms&regulation.html` | Site terms & regulations |
| `hytemala/` | Sub-pages: family memories, weather, passwords, photo editor |

## Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript, Bootstrap 5, Tailwind CSS (CDN), AOS scroll animations
- **Backend:** Node.js + [Azure Functions](https://learn.microsoft.com/azure/azure-functions/) (`@azure/functions` v4)
- **Icons & Fonts:** Line Awesome, Font Awesome, Material Symbols

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- An [Azure subscription](https://azure.microsoft.com/free/) (only required for deployment)

### Run locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Azure Functions host (serves the API alongside the static site)
npm start
```

Then open the site in your browser (e.g. `http://localhost:7071`), or simply open `HOME.html` directly.

### Preview the static site (no install needed)

Just want to browse the pages? No dependencies required:

```bash
npm run serve
```

Then open `http://localhost:8080` (use `npm run serve -- 3000` to pick a different port).

### Deploy to Azure

```bash
func azure functionapp publish <your-function-app-name>
```

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
├── src/                       # Azure Functions (Node.js)
│   ├── index.js
│   └── functions/
│       └── httpTrigger1.js
├── package.json
├── host.json                  # Azure Functions host configuration
└── LICENSE
```

## Docs

- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines
- [CHANGELOG.md](CHANGELOG.md) — release history

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

---

(c) 2026 DJKAM & DEVKLENN — Made with love.
