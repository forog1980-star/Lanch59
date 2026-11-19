import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'icon.svg');
const pngPath = path.join(__dirname, 'icon.png');
const icoPath = path.join(__dirname, 'icon.ico');

if (fs.existsSync(pngPath) && fs.existsSync(icoPath)) {
  console.log('Authentic icon.png and icon.ico already exist in desktop/build/.');
  process.exit(0);
}

if (!fs.existsSync(svgPath)) {
  console.error('Missing source vector icon: desktop/build/icon.svg');
  process.exit(1);
}

async function loadResvg() {
  try {
    return await import('@resvg/resvg-js');
  } catch {
    console.log('Installing @resvg/resvg-js temporarily to rasterize desktop/build/icon.svg...');
    execFileSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['install', '--no-save', '--no-audit', '--no-fund', '--legacy-peer-deps', '@resvg/resvg-js'],
      { stdio: 'inherit', cwd: path.resolve(__dirname, '..', '..') }
    );
    return await import('@resvg/resvg-js');
  }
}

/**
 * Builds a 32-bit BGRA BMP DIB entry (with AND mask) for classic Windows ICO compatibility
 * with both Windows Explorer and NSIS MUI_ICON.
 */
function buildBmpDibEntry(width, height, rgba) {
  const headerSize = 40;
  const xorSize = width * height * 4;
  const andRowBytes = Math.ceil(width / 32) * 4;
  const andSize = andRowBytes * height;
  const buf = Buffer.alloc(headerSize + xorSize + andSize);

  buf.writeUInt32LE(headerSize, 0); // biSize
  buf.writeInt32LE(width, 4); // biWidth
  buf.writeInt32LE(height * 2, 8); // biHeight (XOR + AND masks)
  buf.writeUInt16LE(1, 12); // biPlanes
  buf.writeUInt16LE(32, 14); // biBitCount
  buf.writeUInt32LE(0, 16); // BI_RGB
  buf.writeUInt32LE(xorSize + andSize, 20); // biSizeImage

  // Bottom-up BGRA pixels
  let offset = headerSize;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      buf[offset++] = rgba[srcIdx + 2]; // B
      buf[offset++] = rgba[srcIdx + 1]; // G
      buf[offset++] = rgba[srcIdx]; // R
      buf[offset++] = rgba[srcIdx + 3]; // A
    }
  }

  // AND mask (1 bit where alpha == 0, bottom-up)
  const andBase = headerSize + xorSize;
  for (let y = height - 1; y >= 0; y--) {
    const rowStart = andBase + (height - 1 - y) * andRowBytes;
    for (let x = 0; x < width; x++) {
      const alpha = rgba[(y * width + x) * 4 + 3];
      if (alpha === 0) {
        buf[rowStart + (x >> 3)] |= 1 << (7 - (x & 7));
      }
    }
  }

  return buf;
}

function buildIcoBuffer(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = ICO
  header.writeUInt16LE(images.length, 4);

  const dirEntries = [];
  let dataOffset = 6 + images.length * 16;
  const payloads = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry[0] = img.size >= 256 ? 0 : img.size;
    entry[1] = img.size >= 256 ? 0 : img.size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.data.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    dirEntries.push(entry);
    payloads.push(img.data);
    dataOffset += img.data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...payloads]);
}

const { Resvg } = await loadResvg();
const svgData = fs.readFileSync(svgPath, 'utf8');

if (!fs.existsSync(pngPath)) {
  const rendered512 = new Resvg(svgData, {
    fitTo: { mode: 'width', value: 512 },
    font: { loadSystemFonts: true },
  }).render();
  fs.writeFileSync(pngPath, rendered512.asPng());
  console.log(`Generated ${pngPath} (${fs.statSync(pngPath).size} bytes)`);
}

if (!fs.existsSync(icoPath)) {
  const sizes = [16, 32, 48, 64, 128, 256];
  const icoImages = sizes.map((size) => {
    const rendered = new Resvg(svgData, {
      fitTo: { mode: 'width', value: size },
      font: { loadSystemFonts: true },
    }).render();
    const data =
      size === 256
        ? Buffer.from(rendered.asPng())
        : buildBmpDibEntry(rendered.width, rendered.height, rendered.pixels);
    return { size, data };
  });
  fs.writeFileSync(icoPath, buildIcoBuffer(icoImages));
  console.log(`Generated ${icoPath} (${fs.statSync(icoPath).size} bytes)`);
}
