import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAW_DIR = './assets-source/gallery-raw';
const DEST_DIR = './frontend/public/assets/gallery';

const focalConfig = {
  '01': 0.48, // supervisor, jar, auger
  '02': 0.50, // landscape
  '03': 0.50, // landscape
  '04': 0.56, // whey on jar in hand + line
  '05': 0.42, // powder dispensing nozzle + jar
  '06': 0.50, // 3 operators
  '07': 0.50, // sifter + blender
  '08': 0.45, // boardroom table & lighting
  '09': 0.50, // auger filling container
  '10': 0.50, // landscape
  '11': 0.50, // landscape
  '12': 0.50, // landscape
  '13': 0.50, // landscape
  '14': 0.50, // meeting table
  '15': 0.50, // 3 technicians
};

async function buildGallery() {
  console.log('Generating customized 3:2 framed WebP gallery photos...');
  const stats = [];

  for (let i = 1; i <= 15; i++) {
    const num = String(i).padStart(2, '0');
    const src = path.join(RAW_DIR, `gallery-${num}.webp`);
    const meta = await sharp(src).rotate().metadata();
    const w = meta.width;
    const h = meta.height;
    const targetRatio = 1.5; // 3:2 landscape box

    let cropW, cropH, cropLeft, cropTop;
    const currentRatio = w / h;

    if (currentRatio < targetRatio) {
      cropW = w;
      cropH = Math.round(w / targetRatio);
      if (cropH > h) cropH = h;
      
      const centerY = focalConfig[num] || 0.5;
      const targetTop = Math.round((h * centerY) - (cropH / 2));
      cropTop = Math.max(0, Math.min(h - cropH, targetTop));
      cropLeft = 0;
    } else {
      cropH = h;
      cropW = Math.round(h * targetRatio);
      if (cropW > w) cropW = w;
      cropTop = 0;
      cropLeft = Math.round((w - cropW) / 2);
    }

    // 1. High-res WebP for modal and desktop (1536x1024, quality 85)
    const mainDest = path.join(DEST_DIR, `gallery-${num}.webp`);
    const mainBuf = await sharp(src)
      .rotate()
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .resize({ width: 1536, height: 1024, fit: 'fill' })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();
    fs.writeFileSync(mainDest, mainBuf);

    // 2. Responsive 400w thumbnail (400x267, quality 82)
    const thumbDest = path.join(DEST_DIR, `gallery-${num}-400.webp`);
    const thumbBuf = await sharp(src)
      .rotate()
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .resize({ width: 400, height: 267, fit: 'fill' })
      .webp({ quality: 82, effort: 5 })
      .toBuffer();
    fs.writeFileSync(thumbDest, thumbBuf);

    stats.push({
      slot: num,
      mainKB: (mainBuf.length / 1024).toFixed(0),
      thumbKB: (thumbBuf.length / 1024).toFixed(0)
    });
  }

  console.table(stats);
  console.log('All 15 gallery photos framed and saved to public/assets/gallery!');
}

buildGallery().catch(err => {
  console.error(err);
  process.exit(1);
});
