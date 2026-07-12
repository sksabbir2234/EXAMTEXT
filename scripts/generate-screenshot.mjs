import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/screenshots', { recursive: true });

const svg = `
<svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="390" height="844" fill="url(#bg)"/>
  <text x="195" y="380" font-family="Arial" font-size="48" font-weight="bold"
    fill="white" text-anchor="middle">ExamText</text>
  <text x="195" y="440" font-family="Arial" font-size="20"
    fill="rgba(255,255,255,0.8)" text-anchor="middle">পরীক্ষার পোর্টাল</text>
  <text x="195" y="500" font-family="Arial" font-size="16"
    fill="rgba(255,255,255,0.6)" text-anchor="middle">BCS · NTRCA · CSE</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/screenshots/mobile-home.png');

console.log('Screenshot generated: public/screenshots/mobile-home.png');
