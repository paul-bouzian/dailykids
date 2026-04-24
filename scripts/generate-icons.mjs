import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.SRC_ICON || "/Users/paulbouzian/Downloads/dailykids.png";
const OUT = join(__dirname, "..", "public", "icons");

await mkdir(OUT, { recursive: true });

const BRAND_BLUE = { r: 59, g: 176, b: 232, alpha: 1 };

async function square(size, filename) {
  await sharp(SRC)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(join(OUT, filename));
  console.log("✓", filename);
}

async function maskable(size, filename) {
  const inner = Math.round(size * 0.7);
  const offset = Math.round((size - inner) / 2);
  const base = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BLUE,
    },
  })
    .png()
    .toBuffer();
  const resized = await sharp(SRC)
    .resize(inner, inner, { fit: "cover" })
    .png()
    .toBuffer();
  await sharp(base)
    .composite([{ input: resized, top: offset, left: offset }])
    .png()
    .toFile(join(OUT, filename));
  console.log("✓", filename);
}

await Promise.all([
  square(192, "icon-192.png"),
  square(512, "icon-512.png"),
  square(180, "apple-touch-icon.png"),
  square(32, "favicon-32.png"),
  square(16, "favicon-16.png"),
  maskable(512, "icon-maskable-512.png"),
  maskable(192, "icon-maskable-192.png"),
]);

console.log("Done.");
