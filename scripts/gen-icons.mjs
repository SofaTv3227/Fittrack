import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const svg = (size, radius) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff6a3d"/>
      <stop offset="100%" stop-color="#ffb648"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="#0b0c0f"/>
  <rect width="512" height="512" rx="${radius}" fill="url(#g)" fill-opacity="0.12"/>
  <g transform="translate(106,96)">
    <path d="M150 0c-10 55-55 70-85 110-33 44-40 100-8 148 26 39 72 58 118 58 66 0 128-46 128-118 0-46-24-82-52-108 4 34-10 56-30 66 8-40-6-84-40-112 4 30-6 54-26 70-22 18-40 40-40 66 0 30 22 52 50 52 20 0 36-12 44-28-2 26-26 46-54 46-38 0-70-30-70-70 0-46 26-74 65-100C182 60 168 26 150 0z" fill="url(#g)"/>
  </g>
</svg>`;

const targets = [
  ['public/icons/icon-192.png', 192, 40],
  ['public/icons/icon-512.png', 512, 96],
  ['public/icons/icon-maskable-512.png', 512, 0],
  ['public/apple-touch-icon.png', 180, 38],
  ['public/favicon-32.png', 32, 7],
];

for (const [path, size, radius] of targets) {
  await sharp(Buffer.from(svg(size, radius))).resize(size, size).png().toFile(path);
  console.log('wrote', path);
}
