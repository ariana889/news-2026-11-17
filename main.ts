import { closeSync, copyFileSync, mkdirSync, openSync, readSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1024 * 1024;
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function fail(message: string) {
  console.error(`make.fun news image: ${message}`);
  process.exit(1);
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, i) => bytes[i] === byte);
}

function header(path: string, length: number): Uint8Array {
  const fd = openSync(path, 'r');
  const buffer = new Uint8Array(length);
  try {
    readSync(fd, buffer, 0, length, 0);
  } finally {
    closeSync(fd);
  }
  return buffer;
}

let size = 0;
try {
  size = statSync(source).size;
} catch {
  fail(`source image not found at ${source}`);
}

if (size > MAX_BYTES) fail(`source image is ${size} bytes, over the ${MAX_BYTES}-byte cap`);

const magic = header(source, 8);
if (!startsWith(magic, PNG) && !startsWith(magic, JPEG)) {
  fail(`${source} is not a PNG or JPEG image`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, join(outputDir, 'entry.png'));
