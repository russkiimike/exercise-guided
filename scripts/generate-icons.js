// Simple script to create placeholder icons for PWA
// In a real project, you would use a proper icon generator or design tool

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Create a simple SVG icon for each size
iconSizes.forEach(({ size, name }) => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="240" fill="#2d2e67" stroke="#3B82F6" stroke-width="8"/>
  <g transform="translate(256, 256)">
    <rect x="-120" y="-8" width="40" height="16" fill="#3B82F6" rx="4"/>
    <rect x="-80" y="-4" width="160" height="8" fill="#3B82F6" rx="4"/>
    <rect x="80" y="-8" width="40" height="16" fill="#3B82F6" rx="4"/>
    <rect x="-20" y="-12" width="40" height="24" fill="#1d213e" rx="6"/>
    <circle cx="-60" cy="-30" r="3" fill="#3B82F6"/>
    <circle cx="0" cy="-30" r="3" fill="#3B82F6"/>
    <circle cx="60" cy="-30" r="3" fill="#3B82F6"/>
  </g>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, '../public/icons', name.replace('.png', '.svg')), svg);
});

console.log('Icons generated! Note: These are SVG placeholders. For production, convert to PNG using a proper tool.');
