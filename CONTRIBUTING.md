# 🤝 Contributing to Pahimna

First off, thanks for taking the time to contribute! 💜

Pahimna is licensed under the **GNU GPL v3.0 (or later)**. By contributing to this project, you agree that your contributions are licensed under the same license.

## Table of Contents

- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Conventions](#commit-conventions)
- [Reporting Issues](#reporting-issues)
- [Questions?](#questions)

## How to Contribute

1. **Fork** the repository and create your feature branch from `main`.
2. **Keep changes small and focused** — one pull request per feature or bug fix.
3. **Test your changes locally** before opening a pull request.
4. **Open a pull request** with a clear title and description explaining *what* and *why*.

### Pull Request Checklist

- [ ] The code follows the existing project conventions
- [ ] Changes have been tested locally (site loads, no console errors)
- [ ] No new dependencies were added unless strictly necessary
- [ ] The PR description clearly explains the change

## Development Setup

```bash
# Install dependencies
npm install

# Start the local Azure Functions host
npm start
```

Open the site in your browser (e.g. `http://localhost:7071`) or load `HOME.html` directly.

## Code Style

- Follow the existing conventions in the file you are editing (indentation, naming, file structure).
- Keep the UI consistent with the existing design system in `design/`.
- Avoid introducing new dependencies unless they are clearly needed.
- Use semantic HTML and keep accessibility in mind.
- Preserve the GPL-3.0 license notice header at the top of every source file.

## Commit Conventions

Write clear, descriptive commit messages using conventional prefixes:

| Prefix | Purpose |
| --- | --- |
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting only (no code change) |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `chore:` | Maintenance tasks |

Example: `feat: add weather tool to hytemala`

## Reporting Issues

- **Search existing issues first** — yours may already be reported.
- Include **steps to reproduce**, **expected vs. actual behavior**, and **environment details** (browser, OS).

## Questions?

Feel free to open a discussion, or reach out through the [suggestion form](https://formsubmit.co/pahimna294klenn@gmail.com) on the site.
