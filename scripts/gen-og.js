const fs = require('fs');
const sharp = require('sharp');

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fafafa"/>
  <rect x="0" y="0" width="1200" height="4" fill="#171717"/>
  <text x="600" y="260" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="64" font-weight="800" fill="#171717">HireACreator.ai</text>
  <text x="600" y="330" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="28" fill="#737373">The creator marketplace where you keep 100%</text>
  <text x="600" y="400" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="20" font-weight="600" fill="#171717">0% creator fees &#x2022; Escrow payments &#x2022; AI agent API</text>
  <rect x="0" y="626" width="1200" height="4" fill="#171717"/>
</svg>`;

sharp(Buffer.from(svg)).resize(1200, 630).png().toFile('public/og-image.png')
  .then(() => console.log('Created public/og-image.png'))
  .catch(e => console.error(e.message));
