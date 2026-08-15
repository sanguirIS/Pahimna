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
 * Dependency-free PNG downscaler. Decodes 8-bit RGBA PNGs, bilinearly resizes
 * them so the longest edge is at most `maxDim` pixels, and rewrites the file.
 *
 * Usage: node scripts/downscale-png.js <file> <maxDim> [<file> <maxDim> ...]
 *
 * Used to slim down the oversized Gemini portraits in PicVid/ — they are only
 * ever displayed at <=320px, so the full resolution is wasted bandwidth.
 * Originals remain recoverable from git history.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ---------- PNG decode (8-bit RGBA only) ----------
function decodePng(buf) {
  const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (buf[i] !== SIG[i]) throw new Error("not a PNG");
  }

  let width = 0;
  let height = 0;
  const idat = [];

  let off = 8;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.slice(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      if (bitDepth !== 8 || colorType !== 6) {
        throw new Error("unsupported PNG format (bit " + bitDepth + ", color " + colorType + ")");
      }
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    off += 12 + len;
  }

  if (!width || !height) throw new Error("missing IHDR");
  const raw = zlib.inflateSync(Buffer.concat(idat));
  return unfilter(width, height, raw);
}

function unfilter(width, height, raw) {
  const bpp = 4;
  const stride = width * bpp;
  const rgba = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const f = raw[pos++];
      const left = x >= bpp ? rgba[row + x - bpp] : 0;
      const up = y > 0 ? rgba[row - stride + x] : 0;
      const upLeft = x >= bpp && y > 0 ? rgba[row - stride + x - bpp] : 0;
      let val = f;
      if (filter === 1) val += left; // sub
      else if (filter === 2) val += up; // up
      else if (filter === 3) val += Math.floor((left + up) / 2); // average
      else if (filter === 4) {
        // paeth
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        val += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (filter !== 0) {
        throw new Error("unknown filter " + filter);
      }
      rgba[row + x] = val & 0xff;
    }
  }
  return { width, height, rgba };
}

// ---------- bilinear resize ----------
function resize(img, maxDim) {
  const w = img.width;
  const h = img.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const nw = Math.max(1, Math.round(w * scale));
  const nh = Math.max(1, Math.round(h * scale));
  if (nw === w && nh === h) return { width: w, height: h, rgba: img.rgba };

  const out = Buffer.alloc(nw * nh * 4);
  const xRatio = w / nw;
  const yRatio = h / nh;
  for (let y = 0; y < nh; y++) {
    const sy = y * yRatio;
    const y0 = Math.floor(sy);
    const y1 = Math.min(h - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < nw; x++) {
      const sx = x * xRatio;
      const x0 = Math.floor(sx);
      const x1 = Math.min(w - 1, x0 + 1);
      const fx = sx - x0;
      for (let c = 0; c < 4; c++) {
        const i00 = (y0 * w + x0) * 4 + c;
        const i10 = (y0 * w + x1) * 4 + c;
        const i01 = (y1 * w + x0) * 4 + c;
        const i11 = (y1 * w + x1) * 4 + c;
        const top = img.rgba[i00] * (1 - fx) + img.rgba[i10] * fx;
        const bot = img.rgba[i01] * (1 - fx) + img.rgba[i11] * fx;
        out[(y * nw + x) * 4 + c] = Math.round(top * (1 - fy) + bot * fy);
      }
    }
  }
  return { width: nw, height: nh, rgba: out };
}

// ---------- PNG encode ----------
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
  ihdr[9] = 6; // RGBA
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// ---------- CLI ----------
const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2 !== 0) {
  console.error("Usage: node scripts/downscale-png.js <file> <maxDim> [<file> <maxDim> ...]");
  process.exit(1);
}

for (let i = 0; i < args.length; i += 2) {
  const file = path.resolve(args[i]);
  const maxDim = parseInt(args[i + 1], 10);
  const before = fs.statSync(file).size;
  const img = decodePng(fs.readFileSync(file));
  const resized = resize(img, maxDim);
  const out = encodePng(resized.width, resized.height, resized.rgba);
  fs.writeFileSync(file, out);
  const after = fs.statSync(file).size;
  console.log(
    path.basename(file) + ": " +
    img.width + "x" + img.height + " -> " +
    resized.width + "x" + resized.height +
    " (" + Math.round(before / 1024) + " -> " + Math.round(after / 1024) + " KiB)"
  );
}
