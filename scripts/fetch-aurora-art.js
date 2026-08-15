/*
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
*/

/**
 * Fetches three AI-generated aurora artworks (Pollinations.ai, free and
 * keyless) into PicVid/aurora-{1,2,3}.jpg for the Multimodal AI Showcase
 * gallery on info.html and Klenn.html.
 *
 * Run with: node scripts/fetch-aurora-art.js
 *
 * The images are committed locally, so the live site does not depend on the
 * service at runtime. Re-run with different seeds to regenerate.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "PicVid");

const PROMPT =
  "abstract aurora digital art, deep purple night sky with flowing pink and cyan light ribbons, faint stars, dark background, high quality digital painting";

const VARIATIONS = [
  { file: "aurora-1.jpg", seed: 7 },
  { file: "aurora-2.jpg", seed: 21 },
  { file: "aurora-3.jpg", seed: 42 }
];

async function main() {
  for (const v of VARIATIONS) {
    const url =
      "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(PROMPT) +
      "?width=1024&height=1024&seed=" +
      v.seed +
      "&nologo=true";
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(v.file + ": HTTP " + res.status);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT_DIR, v.file), buf);
    console.log("Wrote " + v.file + " (" + Math.round(buf.length / 1024) + " KiB)");
  }
}

main().catch(function (err) {
  console.error("Failed: " + err.message);
  process.exit(1);
});
