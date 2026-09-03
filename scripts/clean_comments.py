from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(r"d:\Pahimna")
IGNORE = {
    "design/bootstrap.min.css",
    "JavaScript/bootstrap.bundle.min.js",
}
LICENSE_BLOCK = """<!--
Pahimna - personal website and creative hub.
Copyright (C) 2026 DJKAM & DEVKLENN

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->"""


def normalize_html_license(text: str) -> str:
    stripped = text.lstrip("\ufeff")
    if stripped.startswith("<!DOCTYPE html>"):
        return stripped
    return "<!DOCTYPE html>\n" + stripped.lstrip("\n") if stripped else "<!DOCTYPE html>\n"


def remove_comments(source: str) -> str:
    result: list[str] = []
    i = 0
    n = len(source)
    in_single = False
    in_double = False
    in_template = False
    in_html_comment = False
    in_block_comment = False
    in_line_comment = False

    while i < n:
        ch = source[i]
        nxt = source[i + 1] if i + 1 < n else ""
        prev = source[i - 1] if i > 0 else ""

        if in_single:
            result.append(ch)
            if ch == "\\" and i + 1 < n:
                result.append(source[i + 1])
                i += 2
                continue
            if ch == "'":
                in_single = False
            i += 1
            continue

        if in_double:
            result.append(ch)
            if ch == "\\" and i + 1 < n:
                result.append(source[i + 1])
                i += 2
                continue
            if ch == '"':
                in_double = False
            i += 1
            continue

        if in_template:
            result.append(ch)
            if ch == "\\" and i + 1 < n:
                result.append(source[i + 1])
                i += 2
                continue
            if ch == "`":
                in_template = False
            i += 1
            continue

        if in_html_comment:
            if source.startswith("-->", i):
                in_html_comment = False
                i += 3
            else:
                i += 1
            continue

        if in_block_comment:
            if source.startswith("*/", i):
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_line_comment:
            if ch == "\n":
                result.append(ch)
                in_line_comment = False
            i += 1
            continue

        if source.startswith("<!--", i):
            in_html_comment = True
            i += 4
            continue

        if source.startswith("/*", i):
            in_block_comment = True
            i += 2
            continue

        if ch == "/" and nxt == "/" and prev != ":":
            in_line_comment = True
            i += 2
            continue

        if ch == "'":
            in_single = True
            result.append(ch)
            i += 1
            continue

        if ch == '"':
            in_double = True
            result.append(ch)
            i += 1
            continue

        if ch == "`":
            in_template = True
            result.append(ch)
            i += 1
            continue

        result.append(ch)
        i += 1

    cleaned = "".join(result)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip() + "\n"


for p in sorted(ROOT.rglob("*")):
    if not p.is_file():
        continue
    if p.suffix.lower() not in {".html", ".css", ".js"}:
        continue
    rel = p.relative_to(ROOT).as_posix()
    if rel in IGNORE:
        continue
    if "node_modules" in rel:
        continue
    text = p.read_text(encoding="utf-8")
    if "Pahimna - personal website and creative hub." in text:
        match = re.search(r"(?s)(<!--\s*Pahimna - personal website and creative hub\.[\s\S]*?-->|/\*\s*Pahimna - personal website and creative hub\.[\s\S]*?\*/)", text)
        if match:
            text = text[:match.start()] + text[match.end():]
    cleaned = remove_comments(text)
    if p.suffix.lower() == ".html":
        cleaned = normalize_html_license(cleaned)
        if "<html" not in cleaned:
            # keep valid HTML skeleton if a file is missing structure
            cleaned = "<!DOCTYPE html>\n<html>\n" + cleaned.replace("<!DOCTYPE html>\n", "", 1).lstrip("\n") + "\n</html>\n"
    result = LICENSE_BLOCK + "\n\n" + cleaned.lstrip("\n")
    p.write_text(result, encoding="utf-8")
    print(rel)
