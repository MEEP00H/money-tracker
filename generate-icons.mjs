import zlib from "zlib";
import fs from "fs";

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ── PNG encoder ───────────────────────────────────────────────────────────
function makePNG(size, draw) {
  // draw(x, y) → [r, g, b]
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter = None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = draw(x, y);
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const idat = zlib.deflateSync(raw);

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = crc32(Buffer.concat([typeBytes, data]));
    const crcBytes = Buffer.alloc(4);
    crcBytes.writeUInt32BE(crcBuf);
    return Buffer.concat([len, typeBytes, data, crcBytes]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB
  // bytes 10-12 = 0 (compression, filter, interlace)

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG sig
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Pixel font for "฿" glyph (7×9 bitmap) ──────────────────────────────
// Hand-crafted approximation of a baht/money symbol
const GLYPH = [
  "0111110",
  "1000001",
  "1000001",
  "0111110",
  "1000001",
  "1000001",
  "0111110",
  "0001000",
  "0001000",
];

// ── Draw function ──────────────────────────────────────────────────────────
function draw(x, y, size) {
  const BG  = [8, 8, 16];        // #080810
  const FG  = [255, 230, 0];     // #FFE600 (accent yellow)
  const BR  = [42, 42, 68];      // #2A2A44 (border)

  const cx = size / 2, cy = size / 2;
  const r  = size / 2;

  // Circle clip (iOS will clip to rounded rect anyway, but circle is safe)
  if ((x - cx) ** 2 + (y - cy) ** 2 > (r - 0.5) ** 2) return BG;

  // Border ring
  if ((x - cx) ** 2 + (y - cy) ** 2 > (r - size * 0.04) ** 2) return BR;

  // Grid dots (background texture)
  const gridSize = Math.round(size * 0.066);
  if (x % gridSize === 0 || y % gridSize === 0) return BR;

  // Glyph rendering — scale to ~40% of icon size, centred
  const gh = GLYPH.length, gw = GLYPH[0].length;
  const scale = Math.floor(size * 0.4 / gh);
  const offX  = Math.floor((size - gw * scale) / 2);
  const offY  = Math.floor((size - gh * scale) / 2);
  const gx = Math.floor((x - offX) / scale);
  const gy = Math.floor((y - offY) / scale);
  if (gx >= 0 && gx < gw && gy >= 0 && gy < gh && GLYPH[gy][gx] === "1") return FG;

  return BG;
}

// ── Generate ───────────────────────────────────────────────────────────────
const sizes = { "icon-192.png": 192, "icon-512.png": 512, "apple-touch-icon.png": 180 };

for (const [name, size] of Object.entries(sizes)) {
  const png = makePNG(size, (x, y) => draw(x, y, size));
  fs.writeFileSync(`public/${name}`, png);
  console.log(`✓ public/${name}  (${size}×${size})`);
}
