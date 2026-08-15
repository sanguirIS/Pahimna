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
 * Generates PicVid/multimodal-demo.wav — a short, gentle music-box style
 * placeholder track for the Multimodal AI Showcase audio player on info.html.
 *
 * Run with: node scripts/gen-placeholder-audio.js
 *
 * The page points at that filename, so you can drop in a real recording later
 * (same name, or update the src on the <audio> element) with no other changes.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 22050;
const NOTE_DURATION = 1.15; // seconds of audible decay per note
const STEP = 1.2;           // seconds between note onsets
const MASTER = 0.8;         // peak normalization target

// note name -> frequency (A4 = 440 Hz, equal temperament)
const F = {
  C3: 130.81,
  G3: 196.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
};

// Gentle music-box melody: a soft pentatonic rise, fall, and closing turn.
const MELODY = [
  ["C5", 0.0],
  ["E5", 1.2],
  ["G5", 2.4],
  ["A5", 3.6],
  ["G5", 4.8],
  ["E5", 6.0],
  ["D5", 7.2],
  ["C5", 8.4],
  ["E5", 9.6],
  ["G5", 10.8],
];

const TOTAL_SECONDS = 12.6;
const TOTAL_SAMPLES = Math.floor(TOTAL_SECONDS * SAMPLE_RATE);
const samples = new Float64Array(TOTAL_SAMPLES);

function addNote(freq, onset, dur, amp) {
  const start = Math.floor(onset * SAMPLE_RATE);
  const n = Math.floor(dur * SAMPLE_RATE);
  const tau = 0.45; // exponential decay time constant
  for (let i = 0; i < n && start + i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // quick attack, exponential decay
    const env = Math.min(1, t / 0.01) * Math.exp(-t / tau);
    // fundamental + a touch of the octave for a bell-like timbre
    const v =
      Math.sin(2 * Math.PI * freq * t) +
      0.28 * Math.sin(2 * Math.PI * freq * 2 * t);
    samples[start + i] += v * env * amp;
  }
}

// Soft low pad underneath for warmth.
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  samples[i] += 0.05 * Math.sin(2 * Math.PI * F.C3 * t) + 0.03 * Math.sin(2 * Math.PI * F.G3 * t);
}

MELODY.forEach(function (pair) {
  addNote(F[pair[0]], pair[1], NOTE_DURATION, 0.3);
});

// Normalize to a healthy peak without clipping.
let peak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) peak = Math.max(peak, Math.abs(samples[i]));
const gain = peak > 0 ? MASTER / peak : 1;

const pcm = Buffer.alloc(TOTAL_SAMPLES * 2);
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const v = Math.max(-1, Math.min(1, samples[i] * gain));
  pcm.writeInt16LE(Math.round(v * 32767), i * 2);
}

// ---- WAV container (RIFF / PCM / mono) ----
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16); // fmt chunk size
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const out = path.join(__dirname, "..", "PicVid", "multimodal-demo.wav");
fs.writeFileSync(out, Buffer.concat([header, pcm]));
console.log(
  "Wrote " + out + " (" + Math.round(pcm.length / 1024) + " KiB, " + TOTAL_SECONDS + "s)"
);
