import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const RAW_DIR = './assets-source/gallery-raw';
const DEST_DIR = './frontend/public/assets/gallery';

async function processPhotos() {
  console.log('Optimizing 15 gallery photos...');
  const stats = [];

  for (let i = 1; i <= 15; i++) {
    const num = String(i).padStart(2, '0');
    const rawFile = path.join(RAW_DIR, `gallery-${num}.webp`);
    if (!fs.existsSync(rawFile)) {
      console.warn(`File not found: ${rawFile}`);
      continue;
    }

    const rawStat = fs.statSync(rawFile);
    const rawBuf = fs.readFileSync(rawFile);

    // 1. Generate full-size optimized WebP (max 1600px, quality 85)
    const mainDest = path.join(DEST_DIR, `gallery-${num}.webp`);
    const mainImg = sharp(rawBuf).rotate().resize({
      width: 1600,
      height: 1600,
      fit: 'inside',
      withoutEnlargement: true
    }).webp({ quality: 85, effort: 6 });

    const mainBuf = await mainImg.toBuffer();
    fs.writeFileSync(mainDest, mainBuf);
    const mainMeta = await sharp(mainBuf).metadata();

    // 2. Generate 400px thumbnail variant (max 400px, quality 82)
    const thumbDest = path.join(DEST_DIR, `gallery-${num}-400.webp`);
    const thumbImg = sharp(rawBuf).rotate().resize({
      width: 400,
      height: 400,
      fit: 'inside',
      withoutEnlargement: true
    }).webp({ quality: 82, effort: 5 });

    const thumbBuf = await thumbImg.toBuffer();
    fs.writeFileSync(thumbDest, thumbBuf);
    const thumbMeta = await sharp(thumbBuf).metadata();

    stats.push({
      slot: num,
      rawKB: (rawStat.size / 1024).toFixed(0),
      mainKB: (mainBuf.length / 1024).toFixed(0),
      mainDim: `${mainMeta.width}x${mainMeta.height}`,
      thumbKB: (thumbBuf.length / 1024).toFixed(0),
      thumbDim: `${thumbMeta.width}x${thumbMeta.height}`
    });
  }

  console.table(stats);
  const totalRaw = stats.reduce((acc, s) => acc + Number(s.rawKB), 0);
  const totalMain = stats.reduce((acc, s) => acc + Number(s.mainKB), 0);
  const totalThumb = stats.reduce((acc, s) => acc + Number(s.thumbKB), 0);
  console.log(`Original total: ${(totalRaw / 1024).toFixed(2)} MB`);
  console.log(`Optimized full-size total: ${(totalMain / 1024).toFixed(2)} MB`);
  console.log(`Thumbnail variants total: ${(totalThumb / 1024).toFixed(2)} MB`);
}

processPhotos().catch(err => {
  console.error(err);
  process.exit(1);
});
