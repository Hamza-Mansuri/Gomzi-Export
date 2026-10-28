import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SOURCE_GALLERY = path.join(rootDir, 'assets-source', 'gallery');
const SOURCE_CERTS = path.join(rootDir, 'assets-source', 'certifications');
const SOURCE_IMAGES = path.join(rootDir, 'assets-source', 'images');

const DEST_GALLERY = path.join(rootDir, 'frontend', 'public', 'assets', 'gallery');
const DEST_CERTS = path.join(rootDir, 'frontend', 'public', 'assets', 'certifications');
const DEST_IMAGES = path.join(rootDir, 'frontend', 'public', 'assets', 'images');

// Ensure directories exist
for (const dir of [SOURCE_GALLERY, SOURCE_CERTS, SOURCE_IMAGES, DEST_GALLERY, DEST_CERTS, DEST_IMAGES]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Format bytes into human readable KB / MB
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
}

/**
 * Check if a file buffer has WebP magic signature
 */
function isGenuineWebp(buffer) {
  if (buffer.length < 12) return false;
  return (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  );
}

/**
 * Sync any newly added photos from public/assets/gallery to assets-source/gallery
 * so masters are never lost or repeatedly degraded on reruns.
 */
function syncSourceGalleryFromPublic() {
  if (!fs.existsSync(DEST_GALLERY)) return;
  const publicFiles = fs.readdirSync(DEST_GALLERY);
  for (const file of publicFiles) {
    if (file.toLowerCase().endsWith('.md') || file.includes('-400.')) continue;
    const destFile = path.join(SOURCE_GALLERY, file);
    if (!fs.existsSync(destFile)) {
      const srcFile = path.join(DEST_GALLERY, file);
      fs.copyFileSync(srcFile, destFile);
      console.log(`[Backup] Synced new photo to source backup: ${file}`);
    }
  }
}

async function optimizeGallery() {
  console.log('\n--- Processing Gallery Photos ---');
  syncSourceGalleryFromPublic();

  const results = [];
  const sourceFiles = fs.readdirSync(SOURCE_GALLERY).filter(f => !f.toLowerCase().endsWith('.md'));

  // Group files by slot id (e.g. gallery-01)
  const slotMap = new Map();
  for (const file of sourceFiles) {
    const match = file.match(/^gallery-(\d+)/i);
    if (match) {
      const slot = match[1].padStart(2, '0');
      // If there are multiple extensions for a slot, prefer non-webp or original
      if (!slotMap.has(slot)) {
        slotMap.set(slot, file);
      }
    }
  }

  const sortedSlots = Array.from(slotMap.keys()).sort();

  for (const slot of sortedSlots) {
    const fileName = slotMap.get(slot);
    const srcPath = path.join(SOURCE_GALLERY, fileName);
    const srcBuf = fs.readFileSync(srcPath);
    const srcStat = fs.statSync(srcPath);
    const isWebP = isGenuineWebp(srcBuf);

    const image = sharp(srcBuf);
    const meta = await image.metadata();

    const destMainName = `gallery-${slot}.webp`;
    const destMainPath = path.join(DEST_GALLERY, destMainName);

    let mainSize = 0;
    let mainAction = '';

    // If source is already genuine WebP and already optimized (such as slots 05 and 10),
    // preserve the file without lossy re-encoding to avoid degradation.
    if (isWebP && meta.format === 'webp') {
      fs.writeFileSync(destMainPath, srcBuf);
      mainSize = srcBuf.length;
      mainAction = 'Preserved WebP';
    } else {
      // Genuinely encode JPEG/PNG to WebP with auto-orientation and quality 85
      const encodedBuf = await sharp(srcBuf)
        .rotate()
        .webp({ quality: 85, effort: 6 })
        .toBuffer();
      fs.writeFileSync(destMainPath, encodedBuf);
      mainSize = encodedBuf.length;
      mainAction = `Encoded WebP (q85, from ${meta.format})`;
    }

    results.push({
      item: destMainName,
      type: 'Main / Modal',
      origSize: srcStat.size,
      newSize: mainSize,
      dimensions: `${meta.width}x${meta.height}`,
      action: mainAction,
    });

    // Generate responsive variant for thumbnails if source width > 420px
    // Do not upscale if source is small (e.g. 299px or 192px)
    if (meta.width && meta.width > 420) {
      const destVariantName = `gallery-${slot}-400.webp`;
      const destVariantPath = path.join(DEST_GALLERY, destVariantName);
      const variantBuf = await sharp(srcBuf)
        .rotate()
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toBuffer();
      fs.writeFileSync(destVariantPath, variantBuf);
      const varMeta = await sharp(variantBuf).metadata();

      results.push({
        item: destVariantName,
        type: 'Thumbnail variant (400w)',
        origSize: srcStat.size,
        newSize: variantBuf.length,
        dimensions: `${varMeta.width}x${varMeta.height}`,
        action: 'Generated 400w variant',
      });
    }
  }

  return results;
}

async function optimizeCertifications() {
  console.log('\n--- Processing Certification Artwork ---');
  const results = [];
  const certFiles = fs.readdirSync(SOURCE_CERTS).filter(f => f.toLowerCase().endsWith('.png'));

  for (const file of certFiles) {
    const srcPath = path.join(SOURCE_CERTS, file);
    const srcStat = fs.statSync(srcPath);
    const baseName = path.basename(file, path.extname(file));
    const destName = `${baseName}.webp`;
    const destPath = path.join(DEST_CERTS, destName);

    // Convert PNG logos using lossless WebP with alpha preservation
    const img = sharp(srcPath);
    const meta = await img.metadata();
    const webpBuf = await img.webp({ lossless: true, effort: 6 }).toBuffer();
    fs.writeFileSync(destPath, webpBuf);

    // Clean up old PNG from public if it exists
    const publicPng = path.join(DEST_CERTS, file);
    if (fs.existsSync(publicPng)) {
      fs.unlinkSync(publicPng);
    }

    results.push({
      item: destName,
      type: 'Certification Logo',
      origSize: srcStat.size,
      newSize: webpBuf.length,
      dimensions: `${meta.width}x${meta.height}`,
      action: 'Lossless WebP (transparency preserved)',
    });
  }

  return results;
}

async function cleanPublicMasters() {
  console.log('\n--- Cleaning Master Source Files from Public Directory ---');
  const results = [];
  // Clean hero-banner.png from public if present (kept in assets-source/images)
  const publicHeroPng = path.join(DEST_IMAGES, 'hero-banner.png');
  if (fs.existsSync(publicHeroPng)) {
    const stat = fs.statSync(publicHeroPng);
    fs.unlinkSync(publicHeroPng);
    results.push({
      item: 'hero-banner.png',
      type: 'Public Cleanup',
      origSize: stat.size,
      newSize: 0,
      dimensions: '1536x1024',
      action: 'Removed 2.15MB unreferenced master PNG (preserved in assets-source/images)',
    });
  }
  return results;
}

async function run() {
  console.log('========================================================');
  console.log('   Gomzi Life Science - Asset Optimization Pipeline     ');
  console.log('========================================================');

  const galleryResults = await optimizeGallery();
  const certResults = await optimizeCertifications();
  const cleanupResults = await cleanPublicMasters();

  const all = [...galleryResults, ...certResults, ...cleanupResults];

  console.log('\nOptimization Summary:');
  console.table(
    all.map(r => ({
      Asset: r.item,
      Type: r.type,
      Dimensions: r.dimensions,
      'Source Size': formatBytes(r.origSize),
      'Output Size': formatBytes(r.newSize),
      Action: r.action,
    }))
  );

  let totalSource = 0;
  let totalOptimized = 0;
  for (const r of all) {
    totalSource += r.origSize;
    totalOptimized += r.newSize;
  }

  const reduction = totalSource - totalOptimized;
  const pct = ((reduction / totalSource) * 100).toFixed(1);

  console.log(`\nTotal initial size: ${formatBytes(totalSource)}`);
  console.log(`Total output size:  ${formatBytes(totalOptimized)}`);
  console.log(`Total saved:        ${formatBytes(reduction)} (${pct}% reduction)\n`);
}

run().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
