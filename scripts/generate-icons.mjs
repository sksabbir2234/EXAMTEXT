import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create base SVG icon (indigo gradient + white "ET")
const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5c7cfa"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <text x="256" y="256" font-family="Inter, Arial, sans-serif" font-size="240" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="central">ET</text>
</svg>`;

const svgBuffer = Buffer.from(baseSvg);

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}

console.log('All icons generated!');
