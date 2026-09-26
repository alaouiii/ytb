import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawRows = [];
  const cx = width / 2;
  const cy = height / 2;
  const cardW = width * (isMaskable ? 0.65 : 0.75);
  const cardH = height * (isMaskable ? 0.52 : 0.62);
  const rCorner = width * 0.15;

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      // Background: deep dark slate / red gradient
      let r = 9, g = 13, b = 22, a = 255;

      // Inside central pill?
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const inPillBox = dx <= cardW / 2 && dy <= cardH / 2;
      
      let insidePill = false;
      if (inPillBox) {
        const cornerDx = dx - (cardW / 2 - rCorner);
        const cornerDy = dy - (cardH / 2 - rCorner);
        if (cornerDx > 0 && cornerDy > 0) {
          insidePill = cornerDx * cornerDx + cornerDy * cornerDy <= rCorner * rCorner;
        } else {
          insidePill = true;
        }
      }

      if (insidePill) {
        // Red gradient
        const t = y / height;
        r = Math.round(220 * (1 - t * 0.3));
        g = Math.round(38 * (1 - t * 0.3));
        b = Math.round(38 * (1 - t * 0.3));

        // Play triangle centered
        // Triangle points: (cx - s, cy - s), (cx + s, cy), (cx - s, cy + s)
        const triSize = width * 0.14;
        const triLeft = cx - triSize * 0.7;
        const triRight = cx + triSize;
        const triTop = cy - triSize;
        const triBottom = cy + triSize;

        if (x >= triLeft && x <= triRight) {
          const progress = (x - triLeft) / (triRight - triLeft);
          const halfH = (1 - progress) * triSize;
          if (Math.abs(y - cy) <= halfH) {
            r = 255;
            g = 255;
            b = 255;
          }
        }
      }

      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }

  const decompressed = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(decompressed);

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, false));
console.log('Successfully generated all compliant PWA PNG icons in /public!');
