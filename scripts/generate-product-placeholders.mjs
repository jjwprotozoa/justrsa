// scripts/generate-product-placeholders.mjs
// Generates the temporary Drop 001 product placeholder PNGs in /public/products.
// These exist only so the layout can be built before the real shirt mockups land.
// Replace the generated files with the final mockups (same filenames) and delete this script.
// Run with: npm run placeholders

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "products");

const WIDTH = 1200;
const HEIGHT = 1500;

const INK = [10, 10, 10]; // near-black
const PAPER = [237, 232, 222]; // warm off-white
const GOLD = [176, 124, 42]; // burnt gold

/** Files map 1:1 to the `image` field in lib/products.ts. */
const FILES = [
  { name: "drop-001-01-not-ai-just-rsa.png", digits: "01", bg: INK, fg: PAPER },
  { name: "drop-001-02-41-46-ft.png", digits: "02", bg: PAPER, fg: INK },
  { name: "drop-001-03-just-another-saturday.png", digits: "03", bg: INK, fg: PAPER },
];

const SEGMENTS = {
  0: "abcdef",
  1: "bc",
  2: "abged",
  3: "abcdg",
  4: "fgbc",
  5: "afgcd",
  6: "afgecd",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};

function createCanvas(color) {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);
  for (let i = 0; i < WIDTH * HEIGHT; i += 1) {
    pixels[i * 3] = color[0];
    pixels[i * 3 + 1] = color[1];
    pixels[i * 3 + 2] = color[2];
  }
  return pixels;
}

function fillRect(pixels, x, y, w, h, color) {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(WIDTH, Math.round(x + w));
  const y1 = Math.min(HEIGHT, Math.round(y + h));
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const i = (py * WIDTH + px) * 3;
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
    }
  }
}

function strokeRect(pixels, x, y, w, h, thickness, color) {
  fillRect(pixels, x, y, w, thickness, color);
  fillRect(pixels, x, y + h - thickness, w, thickness, color);
  fillRect(pixels, x, y, thickness, h, color);
  fillRect(pixels, x + w - thickness, y, thickness, h, color);
}

function drawDigit(pixels, char, x, y, w, h, t, color) {
  const on = SEGMENTS[char] ?? "";
  const mid = y + h / 2;
  if (on.includes("a")) fillRect(pixels, x, y, w, t, color);
  if (on.includes("b")) fillRect(pixels, x + w - t, y, t, h / 2, color);
  if (on.includes("c")) fillRect(pixels, x + w - t, mid, t, h / 2, color);
  if (on.includes("d")) fillRect(pixels, x, y + h - t, w, t, color);
  if (on.includes("e")) fillRect(pixels, x, mid, t, h / 2, color);
  if (on.includes("f")) fillRect(pixels, x, y, t, h / 2, color);
  if (on.includes("g")) fillRect(pixels, x, mid - t / 2, w, t, color);
}

/**
 * Deterministic grain, applied on a coarse grid so the PNG stays small.
 * `cell` is the size in pixels of each grain block.
 */
function addGrain(pixels, seed, cell) {
  let state = seed;
  for (let by = 0; by < HEIGHT; by += cell) {
    for (let bx = 0; bx < WIDTH; bx += cell) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const noise = ((state >>> 24) % 7) - 3;
      for (let y = by; y < Math.min(by + cell, HEIGHT); y += 1) {
        for (let x = bx; x < Math.min(bx + cell, WIDTH); x += 1) {
          const i = (y * WIDTH + x) * 3;
          for (let c = 0; c < 3; c += 1) {
            pixels[i + c] = Math.min(255, Math.max(0, pixels[i + c] + noise));
          }
        }
      }
    }
  }
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(pixels) {
  const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    raw[y * (WIDTH * 3 + 1)] = 0; // no filter
    pixels.copy(raw, y * (WIDTH * 3 + 1) + 1, y * WIDTH * 3, (y + 1) * WIDTH * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function buildPlaceholder({ digits, bg, fg }, index) {
  const pixels = createCanvas(bg);
  strokeRect(pixels, 60, 60, WIDTH - 120, HEIGHT - 120, 8, fg);

  const digitW = 190;
  const digitH = 320;
  const gap = 40;
  const totalW = digits.length * digitW + (digits.length - 1) * gap;
  const startX = (WIDTH - totalW) / 2;
  const startY = (HEIGHT - digitH) / 2 - 80;
  [...digits].forEach((char, i) => {
    drawDigit(pixels, char, startX + i * (digitW + gap), startY, digitW, digitH, 34, fg);
  });

  fillRect(pixels, startX, startY + digitH + 90, totalW, 14, GOLD);
  addGrain(pixels, 1000 + index * 7919, 10);
  return encodePng(pixels);
}

mkdirSync(OUT_DIR, { recursive: true });
FILES.forEach((file, index) => {
  writeFileSync(join(OUT_DIR, file.name), buildPlaceholder(file, index));
  process.stdout.write(`wrote public/products/${file.name}\n`);
});
