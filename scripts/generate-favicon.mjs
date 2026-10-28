import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function makeFavicons() {
  const input = 'C:/Users/admin/.gemini/antigravity-ide/brain/1166af63-d7db-4ba0-8671-ba843777da9f/.user_uploaded/media_1793171044184.png';
  
  // Crop logo tightly
  const logo = await sharp(input)
    .extract({ left: 15, top: 13, width: 139, height: 158 })
    .toBuffer();
    
  // Composite onto a 192x192 square with dark background (#1f2021) with nice margin
  const scaledLogo = await sharp(logo)
    .resize(130, 148, { fit: 'contain' })
    .toBuffer();
    
  // Rounded corner mask for 192x192
  const maskSvg = Buffer.from(
    '<svg width="192" height="192"><rect x="0" y="0" width="192" height="192" rx="36" ry="36" fill="#fff"/></svg>'
  );
  
  const base192 = await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 31, g: 32, b: 33, alpha: 1 }
    }
  })
  .composite([
    {
      input: scaledLogo,
      gravity: 'centre'
    },
    {
      input: maskSvg,
      blend: 'dest-in'
    }
  ])
  .png()
  .toBuffer();
  
  const pubDir = path.join(rootDir, 'frontend', 'public');
  fs.writeFileSync(path.join(pubDir, 'favicon.png'), base192);
  
  // Also 64x64
  const base64 = await sharp(base192)
    .resize(64, 64)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(pubDir, 'favicon-64.png'), base64);

  // Also 32x32 for legacy favicon.ico
  const base32 = await sharp(base192)
    .resize(32, 32)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(pubDir, 'favicon.ico'), base32);
  
  // Also SVG version
  const base64Png = base192.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="100%" height="100%">
  <image width="192" height="192" href="data:image/png;base64,${base64Png}"/>
</svg>
`;
  fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgContent);
  
  console.log('Favicons generated successfully in', pubDir);
}

makeFavicons().catch(console.error);
