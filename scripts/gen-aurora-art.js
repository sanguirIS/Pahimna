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
 * Generates PicVid/aurora-{1,2,3}.png — abstract generative-art studies in the
 * site's aurora palette (deep purple base, pink/cyan ribbons), for the
 * Multimodal AI Showcase image gallery on info.html and Klenn.html.
 *
 * Run with: node scripts/gen-aurora-art.js
 *
 * The gallery labels these "Generative". Swap in real AI-generated images
 * later by overwriting the same filenames (or updating the <img> srcs).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SIZE = 1024;

// ---------- minimal PNG encoder (RGBA, no dependencies) ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ---------- deterministic noise (film grain) ----------
function hash2(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

// ---------- aurora renderer ----------
const STOP = [
  [15, 5, 36], // #0f0524 base
  [26, 11, 46], // #1a0b2e
  [123, 44, 191], // #7b2cbf
  [255, 46, 99], // #ff2e63
  [0, 245, 212] // #00f5d4
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function paletteColor(t) {
  t = Math.max(0, Math.min(1, t)) * (STOP.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  return [
    Math.round(lerp(STOP[i][0], STOP[i + 1][0], f)),
    Math.round(lerp(STOP[i][1], STOP[i + 1][1], f)),
    Math.round(lerp(STOP[i][2], STOP[i + 1][2], f))
  ];
}

const BANDS = [
  { y: 0.32, amp: 0.1, freq: 2.4, phase: 0.0, color: [255, 46, 99], width: 0.05 },
  { y: 0.55, amp: 0.14, freq: 1.6, phase: 2.1, color: [0, 245, 212], width: 0.06 },
  { y: 0.78, amp: 0.09, freq: 3.1, phase: 4.2, color: [123, 44, 191], width: 0.08 }
];

function render(seedOffset) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    const ny = y / SIZE;
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const base = paletteColor(ny * 0.85 + 0.15);
      let r = base[0];
      let g = base[1];
      let b = base[2];
      for (const band of BANDS) {
        const cy = band.y + band.amp * Math.sin(nx * band.freq * Math.PI + band.phase + seedOffset);
        const d = Math.abs(ny - cy);
        const glow = Math.exp(-(d * d) / (2 * band.width * band.width));
        if (glow > 0.003) {
          r = lerp(r, band.color[0], glow * 0.85);
          g = lerp(g, band.color[1], glow * 0.85);
          b = lerp(b, band.color[2], glow * 0.85);
        }
      }
      const noise = (hash2(x + Math.round(seedOffset * 7919), y) - 0.5) * 6;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));
      const i = (y * SIZE + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255;
    }
  }
  return encodePng(SIZE, SIZE, rgba);
}

const outDir = path.join(__dirname, "..", "PicVid");
[
  ["aurora-1.png", 0.0],
  ["aurora-2.png", 1.3],
  ["aurora-3.png", 2.7]
].forEach(function (item) {
  const png = render(item[1]);
  const out = path.join(outDir, item[0]);
  fs.writeFileSync(out, png);
  console.log("Wrote " + out + " (" + Math.round(png.length / 1024) + " KiB)");
});
