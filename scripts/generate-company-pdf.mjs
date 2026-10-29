import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to encode image file to base64 Data URI
function toBase64Uri(fullPath) {
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return '';
  }
  const ext = path.extname(fullPath).toLowerCase().replace('.', '');
  const mime = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const data = fs.readFileSync(fullPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

// Extract exact world map path from world-map.svg
const worldSvgPath = path.join(rootDir, 'frontend', 'public', 'assets', 'images', 'world-map.svg');
const worldSvgContent = fs.readFileSync(worldSvgPath, 'utf-8');
const quoteChar = String.fromCharCode(34);
const startD = worldSvgContent.indexOf('d=' + quoteChar);
const endD = worldSvgContent.indexOf(quoteChar, startD + 3);
const worldPath = startD !== -1 && endD !== -1 ? worldSvgContent.slice(startD + 3, endD) : '';

// Projection and routes for EXACTLY the 6 focus markets requested by user:
// 1. United Kingdom
// 2. African markets
// 3. Dubai, UAE
// 4. Sri Lanka
// 5. Bangladesh
// 6. Asian markets
const origin = { lon: 72.83, lat: 21.17, name: 'Surat (HQ & Plant)' };
const markets = [
  { 
    id: 'uk', 
    name: 'United Kingdom', 
    lon: -0.12, 
    lat: 51.5,
    pill: { x: 425, y: 70, w: 126, h: 25 }
  },
  { 
    id: 'africa', 
    name: 'African markets', 
    lon: 8.68, 
    lat: 9.08,
    pill: { x: 435, y: 236, w: 128, h: 25 }
  },
  { 
    id: 'dubai', 
    name: 'Dubai, UAE', 
    lon: 55.27, 
    lat: 25.2,
    pill: { x: 578, y: 162, w: 100, h: 25 }
  },
  { 
    id: 'sri-lanka', 
    name: 'Sri Lanka', 
    lon: 80.77, 
    lat: 7.87,
    pill: { x: 746, y: 280, w: 92, h: 25 }
  },
  { 
    id: 'bangladesh', 
    name: 'Bangladesh', 
    lon: 90.36, 
    lat: 23.68,
    pill: { x: 822, y: 162, w: 102, h: 25 }
  },
  { 
    id: 'asia', 
    name: 'Asian markets', 
    lon: 108.28, 
    lat: 14.06,
    pill: { x: 890, y: 220, w: 116, h: 25 }
  },
];

function project(lon, lat) {
  return { x: ((lon + 180) / 360) * 1000, y: ((85 - lat) / 145) * 450 };
}

function getRoutePath(start, end, id) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;

  let cx = mx;
  let cy = my - Math.max(16, Math.min(75, dist * 0.35));

  if (id === 'sri-lanka') {
    cx = start.x - 14;
    cy = my + 6;
  } else if (id === 'dubai') {
    cx = mx;
    cy = my - 18;
  } else if (id === 'bangladesh') {
    cx = mx;
    cy = my - 18;
  } else if (id === 'asia') {
    cx = mx;
    cy = my - 34;
  } else if (id === 'africa') {
    cx = mx;
    cy = my - 54;
  } else if (id === 'uk') {
    cx = mx;
    cy = my - 72;
  }

  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

const start = project(origin.lon, origin.lat);
const mapRoutes = markets.map(m => {
  const end = project(m.lon, m.lat);
  return {
    ...m,
    end,
    d: getRoutePath(start, end, m.id)
  };
});

// Load core images
console.log('Loading high-resolution asset images...');
const logoImg = toBase64Uri(path.join(rootDir, 'frontend', 'public', 'assets', 'images', 'logo.webp'));
const heroImg = toBase64Uri(path.join(rootDir, 'frontend', 'public', 'assets', 'images', 'hero-banner.webp'));
const lineupImg = toBase64Uri(path.join(rootDir, 'frontend', 'public', 'assets', 'images', 'product-lineup.webp')) || heroImg;
const resLabImg = toBase64Uri(path.join(rootDir, 'frontend', 'public', 'assets', 'images', 'research-laboratory.webp'));

// Large high-res format image thumbnails for Page 4 (Capacities & Facilities)
console.log('Preparing prominent high-res format images for Facilities (600x600 HD)...');
async function getHighResFormat(filePath) {
  const fullP = path.join(rootDir, filePath);
  if (!fs.existsSync(fullP)) return '';
  const buf = await sharp(fullP)
    .resize(600, 600, { fit: 'cover', position: 'center' })
    .webp({ quality: 92 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

const fmtPowders = await getHighResFormat('frontend/public/assets/images/format-powders.webp');
const fmtTablets = await getHighResFormat('frontend/public/assets/images/format-tablets.webp');
const fmtCapsules = await getHighResFormat('frontend/public/assets/images/format-capsules.webp');
const fmtSyrups = await getHighResFormat('frontend/public/assets/images/format-syrups.webp');
const fmtSachets = await getHighResFormat('frontend/public/assets/images/format-sachets.webp');
const fmtEffervescent = await getHighResFormat('frontend/public/assets/images/format-effervescent.webp');

// Optimize 15 gallery photos for razor-sharp 300+ DPI print layout
console.log('Optimizing 15 gallery photos for clean print layout...');
const galleryImgs = [];
for (let i = 1; i <= 15; i++) {
  const id = String(i).padStart(2, '0');
  const src = path.join(rootDir, 'frontend', 'public', 'assets', 'gallery', `gallery-${id}.webp`);
  let uri = '';
  if (fs.existsSync(src)) {
    const optBuf = await sharp(src)
      .resize(800, 533, { fit: 'cover', position: 'center' })
      .webp({ quality: 84, effort: 5 })
      .toBuffer();
    uri = `data:image/webp;base64,${optBuf.toString('base64')}`;
  }
  galleryImgs.push({ id, uri });
}

// Certifications
const certIds = ['who', 'haccp', 'iso-22000', 'gmp', 'fda', 'halal', 'fieo', 'fssai', 'pharmexcil', 'kosher', 'sgcci', 'shefexil'];
const certNames = {
  who: 'WHO-GMP',
  haccp: 'HACCP',
  'iso-22000': 'ISO 22000:2018',
  gmp: 'GMP Quality',
  fda: 'US FDA',
  halal: 'HALAL',
  fieo: 'FIEO',
  fssai: 'FSSAI',
  pharmexcil: 'Pharmexcil',
  kosher: 'KOSHER',
  sgcci: 'SGCCI',
  shefexil: 'SHEFEXIL'
};
const certImgs = certIds.map(id => ({
  id,
  name: certNames[id],
  uri: toBase64Uri(path.join(rootDir, 'frontend', 'public', 'assets', 'certifications', `${id}.webp`))
}));

console.log('Generating crisp WHITE LIGHT theme brochure with #99c229 banners/buttons & white text...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gomzi Life Science LLP - Corporate Profile & Product Catalogue</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* PURE WHITE LIGHT THEME + #99c229 BRAND COLOR ONLY (NO DARK GREENS) */
    :root {
      --brand: #99c229;          /* Exact Official Theme Lime: #99c229 */
      --brand-hover: #88ad24;    /* Slightly deeper lime for crisp contrast */
      --brand-soft: #eef6d8;     /* Ultra-light delicate lime background */
      --brand-card: #f8faf4;     /* Crisp light tinted card surface */
      --white: #ffffff;          /* Pure Crisp White Background */
      --line: #e3edd6;           /* Clean Soft Border Line */
      --ink: #181c14;            /* Sharp High-Legibility Charcoal Black Text */
      --ink-muted: #525a4e;      /* Clean Muted Charcoal for Subtitles */
      --font-main: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-script: 'Caveat', cursive, sans-serif;
    }

    body {
      font-family: var(--font-main);
      color: var(--ink);
      background: #f1f4ec;
      -webkit-font-smoothing: antialiased;
      line-height: 1.48;
    }

    /* Page container: Exact 210mm x 297mm A4 sheet */
    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      min-height: 297mm;
      overflow: hidden;
      position: relative;
      background: #ffffff;
      page-break-after: always;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Standard running bottom footer bar - sits flush at bottom */
    .std-footer {
      height: 16mm;
      min-height: 16mm;
      padding: 0 16mm 4mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      z-index: 20;
      background: #ffffff;
    }

    .page-badge-num {
      background: var(--brand);
      color: #ffffff;
      font-weight: 900;
      font-size: 11.5pt;
      padding: 3.5px 16px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.05em;
      box-shadow: 0 2px 6px rgba(153, 194, 41, 0.35);
    }

    .footer-logo {
      height: 9.5mm;
      max-width: 48mm;
      object-fit: contain;
    }

    /* Botanical SVG decorations matching website motif */
    .botanical-accent {
      position: absolute;
      top: 3mm;
      right: 3mm;
      width: 36mm;
      height: 36mm;
      pointer-events: none;
      z-index: 4;
      opacity: 0.95;
    }

    /* ================================================================
       PAGE 1: COVER PAGE (WHITE LIGHT THEME WITH #99c229 BANNERS)
       ================================================================ */
    .p1-cover {
      background: #ffffff;
      display: flex;
      flex-direction: column;
      padding: 0;
      position: relative;
    }

    .p1-top-ribbon {
      width: 100%;
      height: 16mm;
      background: #ffffff;
      position: relative;
      display: flex;
      align-items: center;
      padding-left: 20mm;
      border-bottom: 3px solid var(--brand);
    }
    .p1-top-ribbon::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 15mm;
      background: var(--brand);
      clip-path: polygon(0 0, 100% 0, 65% 100%, 0% 100%);
    }
    .p1-top-ribbon span {
      font-family: var(--font-main);
      font-style: italic;
      font-size: 11.5pt;
      font-weight: 700;
      color: var(--brand);
      letter-spacing: 0.02em;
    }

    .p1-header {
      padding: 7mm 20mm 3mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .p1-logo {
      height: 19mm;
      object-fit: contain;
      margin-bottom: 2mm;
    }
    .p1-logo-tagline {
      font-size: 8.5pt;
      font-weight: 800;
      letter-spacing: 0.26em;
      color: var(--brand);
      text-transform: uppercase;
      margin-bottom: 4mm;
    }
    .p1-lead-name {
      font-size: 14.5pt;
      color: var(--brand);
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 2.5mm;
    }
    
    /* BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT */
    .p1-mfg-box {
      background: var(--brand);
      color: #ffffff;
      padding: 3.8mm 16mm;
      border-radius: 6px;
      margin-bottom: 4.5mm;
      box-shadow: 0 4px 14px rgba(153, 194, 41, 0.35);
    }
    .p1-mfg-box h1 {
      font-size: 28pt;
      font-weight: 900;
      letter-spacing: 0.06em;
      line-height: 1.1;
      text-transform: uppercase;
      color: #ffffff;
    }
    .p1-mfg-box span {
      font-size: 13.8pt;
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.04em;
      color: #ffffff;
    }
    .p1-mfg-box strong {
      font-style: normal;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-decoration: underline;
    }

    .p1-stats-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18mm;
      margin-bottom: 4.5mm;
      width: 100%;
    }
    .p1-stat-item {
      text-align: center;
      min-width: 48mm;
      white-space: nowrap;
    }
    .p1-stat-val {
      font-size: 32pt;
      font-weight: 900;
      color: var(--brand);
      line-height: 1;
      margin-bottom: 1.5mm;
      white-space: nowrap;
    }
    .p1-stat-lbl {
      font-size: 11pt;
      font-weight: 800;
      font-style: italic;
      color: var(--ink);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .p1-stat-divider {
      width: 2px;
      height: 13mm;
      background: var(--brand);
      opacity: 0.4;
    }

    /* Angled hero picture frame */
    .p1-hero-container {
      flex: 1;
      position: relative;
      margin: 0 12mm 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .p1-hero-frame {
      width: 100%;
      height: 124mm;
      position: relative;
      clip-path: polygon(14% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 18%);
      background: var(--brand);
      padding: 3.5px;
      box-shadow: 0 10px 24px rgba(153, 194, 41, 0.25);
    }
    .p1-hero-inner {
      width: 100%;
      height: 100%;
      clip-path: polygon(14% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 18%);
      background: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .p1-hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 38%;
      display: block;
    }
    .p1-hero-overlay-tag {
      position: absolute;
      top: 6mm;
      right: 6mm;
      background: var(--brand);
      color: #ffffff;
      padding: 3.5mm 6mm;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 8.5pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
    .p1-hero-overlay-tag span:first-child {
      color: #ffffff;
      font-size: 10pt;
    }

    /* BANNER: #99c229 BACKGROUND WITH WHITE TEXT */
    .p1-bottom-ribbon {
      background: var(--brand);
      color: #ffffff;
      padding: 6mm 16mm;
      text-align: center;
      margin-top: auto;
      border-top: 2px solid #ffffff;
    }
    .p1-bottom-ribbon h3 {
      font-size: 14pt;
      font-weight: 900;
      letter-spacing: 0.06em;
      margin-bottom: 1.5mm;
      color: #ffffff;
    }
    .p1-bottom-ribbon p {
      font-size: 10.5pt;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #ffffff;
      text-transform: uppercase;
    }

    /* ================================================================
       PAGE 2: ABOUT US (CLEAN LIGHT THEME)
       ================================================================ */
    .p2-about {
      padding: 12mm 16mm 0;
      background: #ffffff;
    }

    .title-know-about {
      margin-bottom: 3.5mm;
    }
    .title-know-about .script-top {
      font-family: var(--font-script);
      font-size: 27pt;
      color: var(--brand);
      display: block;
      line-height: 1;
      margin-bottom: -1mm;
    }
    .title-know-about h2 {
      font-size: 33pt;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .p2-intro-text {
      font-size: 9.8pt;
      color: var(--ink);
      line-height: 1.68;
      margin-bottom: 5mm;
      text-align: justify;
    }
    .p2-intro-text strong {
      color: var(--brand);
    }
    .p2-intro-text p + p {
      margin-top: 3mm;
    }

    .p2-pillars-card {
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-top: 4px solid var(--brand);
      border-radius: 8px;
      padding: 6mm 7.5mm;
      margin-bottom: 5mm;
      box-shadow: 0 3px 10px rgba(153, 194, 41, 0.08);
    }
    .p2-pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6.5mm;
    }
    .p2-pillar-col h3 {
      font-size: 13.5pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 2mm;
      letter-spacing: 0.04em;
      border-bottom: 2.5px solid var(--brand);
      padding-bottom: 1.2mm;
      display: inline-block;
    }
    .p2-pillar-col p {
      font-size: 8.6pt;
      line-height: 1.6;
      color: var(--ink);
      text-align: justify;
    }

    .p2-badges-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 1.5mm 6mm;
      margin-bottom: 5mm;
    }
    .p2-badge-wrap {
      text-align: center;
      width: 52mm;
    }
    .p2-badge-wrap h4 {
      font-size: 12.5pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: var(--brand);
      margin-bottom: 3mm;
    }
    /* BADGE: #99c229 WITH WHITE ICON */
    .p2-badge-circle {
      width: 38mm;
      height: 38mm;
      border-radius: 50%;
      background: var(--brand);
      margin: 0 auto 3mm;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(153, 194, 41, 0.3);
      border: 3.5px solid #ffffff;
      color: #ffffff;
    }
    .p2-badge-circle svg {
      width: 21mm;
      height: 21mm;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .p2-badge-sub {
      font-size: 8.2pt;
      font-weight: 800;
      color: var(--ink);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .p2-infra-strip {
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-left: 5px solid var(--brand);
      border-radius: 8px;
      padding: 4.5mm 7mm;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5.5mm;
      margin-bottom: 2mm;
    }
    .p2-infra-col h5 {
      font-size: 9pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 1.2mm;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .p2-infra-col p {
      font-size: 7.8pt;
      color: var(--ink-muted);
      line-height: 1.48;
    }

    /* ================================================================
       PAGE 3: 100% THIRD PARTY MANUFACTURING
       ================================================================ */
    .p3-manufacturing {
      padding: 12mm 16mm 0;
      background: #ffffff;
    }

    .title-3rd-party {
      text-align: right;
      margin-bottom: 2mm;
    }
    .title-3rd-party .script-top {
      font-family: var(--font-script);
      font-size: 24pt;
      color: var(--brand);
      display: inline-block;
      margin-right: 2.5mm;
    }
    .title-3rd-party h2 {
      display: inline-block;
      font-size: 27pt;
      font-weight: 900;
      color: var(--brand);
    }

    .p3-subhead {
      font-size: 11pt;
      font-weight: 900;
      letter-spacing: 0.06em;
      color: var(--brand);
      text-transform: uppercase;
      margin-bottom: 3.5mm;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .p3-subhead::before {
      content: '';
      width: 7px;
      height: 7px;
      background: var(--brand);
      display: inline-block;
    }

    .p3-desc {
      font-size: 9.6pt;
      line-height: 1.65;
      color: var(--ink);
      text-align: justify;
      margin-bottom: 3.5mm;
    }
    .p3-desc p + p {
      margin-top: 2.5mm;
    }

    .p3-product-showcase {
      margin: 2mm 0 3mm;
      text-align: center;
      position: relative;
    }
    .p3-product-img {
      width: 100%;
      height: 94mm;
      object-fit: contain;
      filter: drop-shadow(0 6px 16px rgba(153, 194, 41, 0.18));
    }

    .p3-callout-grid {
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-top: 4px solid var(--brand);
      border-radius: 8px;
      padding: 4.8mm 6.5mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5mm;
      margin-bottom: 3mm;
    }
    .p3-callout-item h4 {
      font-size: 9.8pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 1.2mm;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .p3-callout-item p {
      font-size: 8.2pt;
      line-height: 1.5;
      color: var(--ink);
      text-align: justify;
    }

    .p3-timeline-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3mm;
      margin-bottom: 2mm;
    }
    .p3-step-card {
      background: var(--brand-card);
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2.5mm 3mm;
      text-align: center;
    }
    .p3-step-num {
      font-size: 8pt;
      font-weight: 900;
      color: #ffffff;
      background: var(--brand);
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      margin-bottom: 1mm;
    }
    .p3-step-title {
      font-size: 7.8pt;
      font-weight: 800;
      color: var(--ink);
      line-height: 1.2;
    }

    /* ================================================================
       PAGE 4: CAPACITIES AND FACILITIES (PROMINENT LARGE PRODUCT IMAGES)
       ================================================================ */
    .p4-facilities {
      padding: 10mm 16mm 0;
      background: #ffffff;
    }

    .title-capacities {
      margin-bottom: 2.5mm;
    }
    .title-capacities span {
      font-size: 13pt;
      color: var(--ink-muted);
      display: block;
      font-weight: 600;
    }
    .title-capacities h2 {
      font-size: 30pt;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .p4-chevrons-list {
      display: flex;
      flex-direction: column;
      gap: 3.2mm;
      margin-bottom: 3.5mm;
    }

    /* Chevron Card with PROMINENT Large Product Thumbnails */
    .p4-chev-card {
      height: 25.5mm;
      background: #ffffff;
      border: 1.5px solid var(--line);
      border-radius: 40px;
      display: flex;
      align-items: center;
      padding: 0 4mm;
      box-shadow: 0 3px 12px rgba(153, 194, 41, 0.1);
      position: relative;
    }
    .p4-chev-card.left-aligned {
      flex-direction: row;
    }
    .p4-chev-card.right-aligned {
      flex-direction: row-reverse;
    }

    /* BUTTON/BADGE: #99c229 WITH WHITE TEXT */
    .p4-chev-num {
      width: 17mm;
      height: 17mm;
      border-radius: 50%;
      background: var(--brand);
      color: #ffffff;
      font-weight: 900;
      font-size: 13pt;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 7px rgba(153, 194, 41, 0.3);
      border: 2.2px solid #ffffff;
    }

    .p4-chev-body {
      flex: 1;
      padding: 0 6mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .p4-chev-card.right-aligned .p4-chev-body {
      text-align: right;
    }
    .p4-chev-title {
      font-size: 13.5pt;
      font-weight: 900;
      color: var(--ink);
      letter-spacing: 0.04em;
    }
    .p4-chev-cap {
      font-size: 9.8pt;
      font-weight: 800;
      color: var(--brand);
    }

    .p4-chev-arrows {
      font-size: 17pt;
      color: var(--brand);
      letter-spacing: -0.08em;
      margin: 0 4mm;
      font-weight: 900;
    }

    /* PROMINENT HD PRODUCT IMAGE BADGE - 30mm DIAMETER */
    .p4-chev-icon-badge {
      width: 30mm;
      height: 30mm;
      border-radius: 50%;
      background: #ffffff;
      border: 3px solid var(--brand);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(153, 194, 41, 0.25);
    }
    .p4-chev-icon-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.1);
    }

    /* BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT */
    .p4-private-ribbon {
      background: var(--brand);
      color: #ffffff;
      padding: 3mm 14mm;
      border-radius: 5px;
      text-align: center;
      font-size: 13.5pt;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-bottom: 3.5mm;
      box-shadow: 0 3px 10px rgba(153, 194, 41, 0.3);
    }

    .p4-pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 7mm;
      row-gap: 2.8mm;
      margin-bottom: 2mm;
    }
    .p4-pill-item {
      background: var(--brand-card);
      border: 1px solid var(--line);
      border-left: 4px solid var(--brand);
      border-radius: 6px;
      padding: 2.8mm 4.5mm;
    }
    .p4-pill-item h4 {
      font-size: 9.8pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 0.8mm;
    }
    .p4-pill-item p {
      font-size: 8.2pt;
      color: var(--ink-muted);
      line-height: 1.45;
    }

    /* ================================================================
       PAGE 5: COMPANY PHOTO GALLERY (WHITE LIGHT THEME)
       ================================================================ */
    .p5-gallery {
      padding: 13mm 16mm 0;
      background: #ffffff;
    }

    .title-gallery {
      margin-bottom: 4mm;
    }
    .title-gallery h2 {
      display: inline-block;
      font-size: 31pt;
      font-weight: 900;
      color: var(--brand);
      margin-right: 3mm;
    }
    .title-gallery span {
      font-family: var(--font-script);
      font-size: 25pt;
      color: var(--brand);
    }

    .p5-gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(5, 46.5mm);
      gap: 4mm;
      margin-bottom: 2mm;
    }
    .p5-photo-card {
      background: #ffffff;
      border: 1.5px solid var(--line);
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      position: relative;
    }
    .p5-photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ================================================================
       PAGE 6: QUALITY ASSURANCE & R&D & WHY GOMZI
       ================================================================ */
    .p6-quality {
      padding: 13mm 16mm 0;
      background: #ffffff;
    }

    .title-qa {
      margin-bottom: 3.5mm;
    }
    .title-qa span {
      font-size: 14pt;
      color: var(--ink-muted);
      display: block;
      font-weight: 600;
    }
    .title-qa h2 {
      font-size: 32pt;
      font-weight: 900;
      color: var(--brand);
      line-height: 1;
    }

    .p6-qa-split {
      display: flex;
      gap: 7mm;
      margin-bottom: 5mm;
      align-items: center;
    }
    .p6-qa-text {
      flex: 1;
      font-size: 9.8pt;
      line-height: 1.72;
      color: var(--ink);
      text-align: justify;
    }
    .p6-qa-text p + p {
      margin-top: 3.2mm;
    }

    .p6-lab-thumb-wrap {
      width: 58mm;
      height: 64mm;
      border-radius: 50% 50% 14px 14px;
      overflow: hidden;
      flex-shrink: 0;
      border: 4px solid var(--brand);
      box-shadow: 0 6px 18px rgba(153, 194, 41, 0.25);
    }
    .p6-lab-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT */
    .p6-rnd-card {
      background: var(--brand);
      color: #ffffff;
      border-radius: 8px;
      padding: 6mm 8mm;
      margin-bottom: 5mm;
      box-shadow: 0 4px 14px rgba(153, 194, 41, 0.3);
    }
    .p6-rnd-card h3 {
      font-size: 15pt;
      font-weight: 900;
      margin-bottom: 1.8mm;
      letter-spacing: 0.04em;
      color: #ffffff;
    }
    .p6-rnd-card p {
      font-size: 9.5pt;
      line-height: 1.68;
      color: #ffffff;
      text-align: justify;
    }

    .p6-why-box {
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-top: 4px solid var(--brand);
      border-radius: 8px;
      padding: 6mm 8mm;
      margin-bottom: 2mm;
    }
    .p6-why-header {
      display: flex;
      align-items: center;
      gap: 4mm;
      margin-bottom: 4mm;
      border-bottom: 1.5px solid var(--line);
      padding-bottom: 2mm;
    }
    .p6-why-header h3 {
      font-size: 18pt;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: 0.06em;
    }
    .p6-why-header img {
      height: 7.5mm;
      object-fit: contain;
    }

    .p6-why-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 8mm;
      row-gap: 3mm;
    }
    .p6-why-item {
      font-size: 9pt;
      color: var(--ink);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 2.5mm;
      line-height: 1.45;
      background: #ffffff;
      padding: 2mm 3.5mm;
      border-radius: 4px;
      border: 1px solid var(--line);
    }
    .p6-why-num {
      color: #ffffff;
      background: var(--brand);
      min-width: 5.5mm;
      height: 5.5mm;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 7.5pt;
    }

    /* ================================================================
       PAGE 7: PRODUCT CATEGORY (WHITE LIGHT THEME WITH #99c229 ACCENTS)
       ================================================================ */
    .p7-category {
      padding: 13mm 16mm 0;
      background: #ffffff;
    }

    .title-category {
      margin-bottom: 4mm;
    }
    .title-category span {
      font-size: 14pt;
      color: var(--ink-muted);
      display: block;
      font-weight: 600;
    }
    .title-category h2 {
      font-size: 32pt;
      font-weight: 900;
      color: var(--brand);
      line-height: 1;
    }

    /* POWDERS */
    .p7-powders-block {
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-left: 5px solid var(--brand);
      border-radius: 8px;
      padding: 5.5mm 7mm;
      margin-bottom: 4mm;
    }
    .p7-powders-head {
      display: flex;
      align-items: center;
      gap: 2.5mm;
      margin-bottom: 2mm;
    }
    .p7-powders-head h3 {
      font-size: 13pt;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: 0.05em;
    }
    .p7-powders-text {
      font-size: 8.6pt;
      line-height: 1.62;
      color: var(--ink);
      text-align: justify;
    }

    .p7-grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm;
      margin-bottom: 4mm;
    }
    .p7-cat-box {
      background: #ffffff;
      border: 1.5px solid var(--line);
      border-radius: 6px;
      padding: 4.5mm 5.5mm;
      box-shadow: 0 2px 6px rgba(153, 194, 41, 0.06);
    }
    .p7-cat-box.accent-bg {
      background: var(--brand-card);
      border-top: 3.5px solid var(--brand);
    }
    .p7-cat-title {
      font-size: 10.5pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 1.8mm;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 2mm;
    }
    .p7-cat-desc {
      font-size: 8.5pt;
      line-height: 1.58;
      color: var(--ink);
      text-align: justify;
    }

    .p7-full-box {
      background: #ffffff;
      border: 1.5px solid var(--line);
      border-left: 5px solid var(--brand);
      border-radius: 6px;
      padding: 4.5mm 5.5mm;
      margin-bottom: 4mm;
    }

    /* ================================================================
       PAGE 8: GLOBAL PRESENCE (WHITE LIGHT THEME WITH #99c229 BANNERS)
       ================================================================ */
    .p8-global {
      padding: 0;
      background: #ffffff;
    }

    .p8-header-top {
      padding: 7mm 16mm 2.5mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .p8-top-logo {
      height: 11mm;
      object-fit: contain;
    }

    /* BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT */
    .p8-title-banner {
      background: var(--brand);
      color: #ffffff;
      padding: 4mm 16mm;
      margin-bottom: 3.5mm;
      box-shadow: 0 3px 10px rgba(153, 194, 41, 0.3);
    }
    .p8-title-banner h2 {
      font-size: 26pt;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ffffff;
    }

    .p8-metrics-bar {
      padding: 0 16mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3.5mm;
    }
    .p8-metric-duo {
      display: flex;
      gap: 14mm;
      align-items: center;
    }
    .p8-metric-val {
      font-size: 28pt;
      font-weight: 900;
      color: var(--brand);
      line-height: 1;
      white-space: nowrap;
    }
    .p8-metric-lbl {
      font-size: 9.8pt;
      font-weight: 800;
      font-style: italic;
      color: var(--ink);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .p8-mfg-lead {
      text-align: right;
    }
    .p8-mfg-lead span {
      font-size: 11pt;
      color: var(--ink-muted);
      display: block;
      font-weight: 600;
    }
    /* BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT */
    .p8-mfg-badge {
      background: var(--brand);
      color: #ffffff;
      padding: 2.2mm 7mm;
      border-radius: 4px;
      font-size: 11.5pt;
      font-weight: 900;
      letter-spacing: 0.05em;
      display: inline-block;
      margin-top: 1mm;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(153, 194, 41, 0.35);
    }

    /* ONLY THE 6 COUNTRIES / MARKETS SHOWN IN MAP - 2 ROWS OF 3 */
    .p8-focus-corridors {
      padding: 0 16mm;
      margin-bottom: 4mm;
    }
    .p8-corridor-title {
      font-size: 8.5pt;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 2mm;
    }
    .p8-corridor-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5mm 5mm;
    }
    .corridor-pill {
      background: var(--brand-card);
      border: 1.5px solid var(--brand);
      border-radius: 20px;
      padding: 2.2mm 5mm;
      font-size: 9pt;
      font-weight: 800;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 7px;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(153, 194, 41, 0.12);
    }
    .corridor-pill .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--brand);
      display: inline-block;
      flex-shrink: 0;
    }

    /* CRISP WHITE LIGHT MAP ZONE - NO DARK GREEN! */
    .p8-map-zone {
      flex: 1;
      background: #fbfdf9;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 3mm 10mm 4mm;
      border-top: 3px solid var(--brand);
    }
    .p8-map-svg {
      width: 100%;
      height: 140mm;
      display: block;
    }

    /* Bottom Trade Highlights - WHITE LIGHT THEME WITH #99c229 BORDERS & HEADERS */
    .p8-trade-highlights {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5mm;
      margin-top: 2mm;
      padding-top: 3mm;
      border-top: 1.5px solid var(--line);
    }
    .p8-trade-card {
      background: #ffffff;
      border: 1.5px solid var(--brand);
      border-radius: 6px;
      padding: 3.5mm 4.5mm;
      color: var(--ink);
      box-shadow: 0 2px 6px rgba(153, 194, 41, 0.1);
    }
    .p8-trade-card h4 {
      font-size: 9.2pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 1.5mm;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .p8-trade-card p {
      font-size: 7.8pt;
      line-height: 1.5;
      color: var(--ink-muted);
    }

    /* ================================================================
       PAGE 9: PRODUCT CERTIFICATION & CONTACT INFORMATION (WHITE LIGHT)
       ================================================================ */
    .p9-contact {
      padding: 13mm 16mm 0;
      background: #ffffff;
    }

    .title-cert {
      margin-bottom: 2mm;
    }
    .title-cert span {
      font-size: 14pt;
      color: var(--ink-muted);
      display: block;
      font-weight: 600;
    }
    .title-cert h2 {
      font-size: 32pt;
      font-weight: 900;
      color: var(--brand);
      line-height: 1;
    }
    .p9-cert-subtitle {
      font-size: 9.8pt;
      color: var(--ink-muted);
      margin-bottom: 5mm;
      font-style: italic;
    }

    .p9-certs-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4mm;
      margin-bottom: 6mm;
      padding: 4mm 5mm;
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-radius: 8px;
    }
    .p9-cert-card {
      background: #ffffff;
      border: 1.2px solid var(--line);
      border-radius: 6px;
      padding: 3mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 27mm;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .p9-cert-img {
      max-height: 16.5mm;
      max-width: 90%;
      object-fit: contain;
    }
    .p9-cert-name {
      font-size: 6.8pt;
      font-weight: 900;
      color: var(--brand);
      margin-top: 1.5mm;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .p9-contact-card {
      background: var(--brand-card);
      border: 1.5px solid var(--line);
      border-top: 4px solid var(--brand);
      border-radius: 8px;
      padding: 8mm 9mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9mm;
      margin-bottom: 6mm;
      box-shadow: 0 3px 10px rgba(153, 194, 41, 0.08);
    }
    .p9-contact-col h4 {
      font-size: 10.5pt;
      font-weight: 900;
      color: var(--brand);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 2.5mm;
      border-bottom: 1.5px solid var(--brand);
      padding-bottom: 1.2mm;
    }
    .p9-contact-col p {
      font-size: 9pt;
      line-height: 1.62;
      color: var(--ink);
    }
    .p9-contact-col strong {
      color: var(--brand);
    }

    .p9-contact-detail-row {
      margin-top: 3mm;
      display: flex;
      flex-direction: column;
      gap: 1.6mm;
      font-size: 9pt;
    }
    .p9-contact-detail-row a {
      color: var(--brand);
      text-decoration: none;
      font-weight: 800;
    }

    .p9-bottom-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8mm;
      align-items: center;
      padding: 2mm 3mm 4mm;
      margin-bottom: 2mm;
    }
    .p9-web-links h4 {
      font-size: 10.5pt;
      font-weight: 900;
      color: var(--brand);
      margin-bottom: 2mm;
    }
    /* BUTTON: #99c229 WITH WHITE TEXT */
    .p9-btn-link {
      display: inline-block;
      background: var(--brand);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 9.5pt;
      padding: 2.5mm 6mm;
      border-radius: 20px;
      margin-bottom: 2mm;
      box-shadow: 0 2px 6px rgba(153, 194, 41, 0.35);
      margin-right: 2mm;
    }

    .p9-thank-you {
      font-size: 9pt;
      color: var(--ink-muted);
      line-height: 1.55;
      text-align: right;
    }
    .p9-thank-you strong {
      color: var(--brand);
      font-size: 10.5pt;
      display: block;
      margin-bottom: 1.5mm;
    }

  </style>
</head>
<body>

  <!-- ================================================================
       PAGE 1: COVER
       ================================================================ -->
  <div class="page p1-cover">
    <div class="p1-top-ribbon">
      <span>A Manufacturer &amp; Exporter of Huge Range of Nutraceutical Products.</span>
    </div>

    <div class="p1-header">
      <img class="p1-logo" src="${logoImg}" alt="Gomzi Life Science LLP" />
      <div class="p1-logo-tagline">INTELLIGENT NUTRITION &amp; CONTRACT MANUFACTURING</div>
      
      <div class="p1-lead-name">Leading name in contract</div>
      <div class="p1-mfg-box">
        <h1>MANUFACTURING</h1>
        <span>facility and <strong>GLOBALLY EXPORT</strong></span>
      </div>

      <div class="p1-stats-row">
        <div class="p1-stat-item">
          <div class="p1-stat-val">45+</div>
          <div class="p1-stat-lbl">COUNTRIES</div>
        </div>
        <div class="p1-stat-divider"></div>
        <div class="p1-stat-item">
          <div class="p1-stat-val" style="white-space: nowrap;">1,000+</div>
          <div class="p1-stat-lbl">PRODUCTS</div>
        </div>
      </div>
    </div>

    <div class="p1-hero-container">
      <div class="p1-hero-frame">
        <div class="p1-hero-inner">
          <img class="p1-hero-img" src="${heroImg}" alt="Gomzi Facility &amp; Products" />
          <div class="p1-hero-overlay-tag">
            <span>●</span>
            <span>Surat · Gujarat · India</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p1-bottom-ribbon">
      <h3>AN-ISO 22000:2018</h3>
      <p>WHO/GMP, FDA, HACCP, HALAL, FSSAI CERTIFIED COMPANY</p>
    </div>
  </div>

  <!-- ================================================================
       PAGE 2: ABOUT US
       ================================================================ -->
  <div class="page p2-about">
    <svg class="botanical-accent" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 10C70 15 50 35 45 60C65 55 85 35 90 10Z" fill="#99c229" opacity="0.85"/>
      <circle cx="35" cy="40" r="6" fill="#99c229" opacity="0.9"/>
      <circle cx="25" cy="52" r="5" fill="#88ad24" opacity="0.9"/>
      <circle cx="42" cy="56" r="4.5" fill="#cce68c" opacity="0.85"/>
      <path d="M90 10Q55 45 30 75" stroke="#99c229" stroke-width="1.8"/>
    </svg>

    <div class="title-know-about">
      <span class="script-top">Know,</span>
      <h2>About Us</h2>
    </div>

    <div class="p2-intro-text">
      <p><strong>Gomzi Life Science LLP</strong> is an ISO 22000:2018 &amp; WHO-GMP, FDA, HACCP, HALAL, FSSAI Certified company with the vision to provide the best possible range of international quality products at competitive prices through integration, research and innovation.</p>
      <p>Gomzi Life Science LLP is located in Surat in India, engaged in supplying Nutraceutical finished products in accordance to customized requirement of clients in India as well as exporting to 45+ countries of the world. Gomzi Life Science LLP is an export oriented nutraceutical company serving vast range of Powder, Tablet, Capsule, Syrup, Softgel and Effervescent in Nutraceuticals or Dietary supplements. In each category, we continuously enhance the performance and quality of life for our customers.</p>
    </div>

    <div class="p2-pillars-card">
      <div class="p2-pillars-grid">
        <div class="p2-pillar-col">
          <h3>MISSION</h3>
          <p>To be a world class organization committed to excellence and delivering products and services of unmatched quality and integrity. To offer innovative and high quality of nutritional and pharmaceutical product by continuous refinement in all stages of product development at affordable price that gain trust of clients and customers.</p>
        </div>
        <div class="p2-pillar-col">
          <h3>VISION</h3>
          <p>Vision of our company is “To become globally admired Nutraceutical organization by providing affordable, competence, quality products for larger global population. We want to mark our presence in the world by creating a portfolio of efficacious products”.</p>
        </div>
        <div class="p2-pillar-col">
          <h3>VALUE</h3>
          <p>The company is driven by its vision to play an important role in the Third Party and Contract Manufacturing Services in global market and lead the way to happiness through world-class products and services without direct marketing of products, we serve our contract manufacturing facilities to client's requirements.</p>
        </div>
      </div>
    </div>

    <div class="p2-badges-row">
      <div class="p2-badge-wrap">
        <h4>MISSION</h4>
        <div class="p2-badge-circle">
          <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
        </div>
        <div class="p2-badge-sub">Excellence &amp; Integrity</div>
      </div>
      <div class="p2-badge-wrap">
        <h4>VISION</h4>
        <div class="p2-badge-circle">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        </div>
        <div class="p2-badge-sub">Global Admiration</div>
      </div>
      <div class="p2-badge-wrap">
        <h4>VALUE</h4>
        <div class="p2-badge-circle">
          <svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
        </div>
        <div class="p2-badge-sub">Dedicated Partnership</div>
      </div>
    </div>

    <div class="p2-infra-strip">
      <div class="p2-infra-col">
        <h5>🏭 Cleanroom Infrastructure</h5>
        <p>Built strictly to ISO Class 8 standards with terminal HEPA filtration, differential airlocks and zoned positive pressure.</p>
      </div>
      <div class="p2-infra-col">
        <h5>🔬 In-House Testing Lab</h5>
        <p>Complete instrumentation for raw material assays, HPLC purity profiling, dissolution testing, and micro analysis.</p>
      </div>
      <div class="p2-infra-col">
        <h5>🌐 Regulatory Readiness</h5>
        <p>WHO-GMP, FDA, Halal, FSSAI approved with complete registration dossiers (CTD/ACTD) and export certificates.</p>
      </div>
    </div>

    <div class="std-footer">
      <span class="page-badge-num">02</span>
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
    </div>
  </div>

  <!-- ================================================================
       PAGE 3: 100% THIRD PARTY MANUFACTURING
       ================================================================ -->
  <div class="page p3-manufacturing">
    <div class="title-3rd-party">
      <span class="script-top">We Do 100%</span>
      <h2>Third Party Manufacturing</h2>
    </div>

    <div class="p3-subhead">CUSTOMIZED BRANDING / PRIVATE LABELLING</div>

    <div class="p3-desc">
      <p>Gomzi Life Science LLP is known for its ability to provide customized compositions and specifications in terms of product ingredients as well as brand name or labelling in accordance to client's requirement.</p>
      <p>Customers who are new in market or want to develop their own brand name, label, design, composition, we assist in building and setting the entire product without any botheration to the client as per their requirement. We also offer the service to those customer who want to full scale product manufacturing under their requirements in partnership. We have a facility to fulfil the graphics, design, label printing for customer's private product via third party manufacturing.</p>
      <p>We strive to ship every order as quickly as possible in line with our excellent Quality and International Good Manufacturing Practices.</p>
    </div>

    <div class="p3-product-showcase">
      <img class="p3-product-img" src="${lineupImg}" alt="Nutraceutical Product Showcase" />
    </div>

    <div class="p3-callout-grid">
      <div class="p3-callout-item">
        <h4>✔ Turnkey Formulation</h4>
        <p>Custom active ingredients, taste profiling, solubility optimization, and stability profiling tailored precisely to your brand.</p>
      </div>
      <div class="p3-callout-item">
        <h4>✔ Private Label Packaging</h4>
        <p>End-to-end graphic packaging design, regulatory text compliance, tamper-evident induction seals, and export-grade cartons.</p>
      </div>
      <div class="p3-callout-item">
        <h4>✔ Quality Assured Manufacturing</h4>
        <p>Every single batch produced under WHO-GMP, ISO 22000, and FDA controls, backed by Certificate of Analysis (COA).</p>
      </div>
      <div class="p3-callout-item">
        <h4>✔ High Capacity &amp; Fast Dispatch</h4>
        <p>High-speed automated packaging lines ensure large-scale volume capabilities, short lead times, and on-time global export delivery.</p>
      </div>
    </div>

    <div class="p3-timeline-bar">
      <div class="p3-step-card">
        <span class="p3-step-num">STEP 1</span>
        <div class="p3-step-title">Formulation &amp; Pilot Samples</div>
      </div>
      <div class="p3-step-card">
        <span class="p3-step-num">STEP 2</span>
        <div class="p3-step-title">Packaging &amp; Label Design</div>
      </div>
      <div class="p3-step-card">
        <span class="p3-step-num">STEP 3</span>
        <div class="p3-step-title">cGMP High-Speed Production</div>
      </div>
      <div class="p3-step-card">
        <span class="p3-step-num">STEP 4</span>
        <div class="p3-step-title">QA Release &amp; Global Shipping</div>
      </div>
    </div>

    <div class="std-footer">
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
      <span class="page-badge-num">03</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 4: CAPACITIES AND FACILITIES (PROMINENT LARGE PRODUCT IMAGES)
       ================================================================ -->
  <div class="page p4-facilities">
    <div class="title-capacities">
      <span>Capacities and</span>
      <h2>FACILITIES</h2>
    </div>

    <div class="p4-chevrons-list">
      <!-- 01 Powder -->
      <div class="p4-chev-card left-aligned">
        <div class="p4-chev-num">01</div>
        <div class="p4-chev-body">
          <div class="p4-chev-title">POWDER</div>
          <div class="p4-chev-cap">20,000 Packs of Powder Per Day</div>
        </div>
        <div class="p4-chev-arrows">&gt;&gt;&gt;</div>
        <div class="p4-chev-icon-badge">
          <img class="p4-chev-icon-img" src="${fmtPowders}" alt="Powder Product" />
        </div>
      </div>

      <!-- 02 Tablet -->
      <div class="p4-chev-card right-aligned">
        <div class="p4-chev-num">02</div>
        <div class="p4-chev-body">
          <div class="p4-chev-title">TABLET</div>
          <div class="p4-chev-cap">10,00,000 Tablet Mfg. Capacity Per Day</div>
        </div>
        <div class="p4-chev-arrows">&lt;&lt;&lt;</div>
        <div class="p4-chev-icon-badge">
          <img class="p4-chev-icon-img" src="${fmtTablets}" alt="Tablet Product" />
        </div>
      </div>

      <!-- 03 Capsule -->
      <div class="p4-chev-card left-aligned">
        <div class="p4-chev-num">03</div>
        <div class="p4-chev-body">
          <div class="p4-chev-title">CAPSULE</div>
          <div class="p4-chev-cap">5,00,000 Capsule Mfg. Capacity Per Day</div>
        </div>
        <div class="p4-chev-arrows">&gt;&gt;&gt;</div>
        <div class="p4-chev-icon-badge">
          <img class="p4-chev-icon-img" src="${fmtCapsules}" alt="Capsule Product" />
        </div>
      </div>

      <!-- 04 Syrup -->
      <div class="p4-chev-card right-aligned">
        <div class="p4-chev-num">04</div>
        <div class="p4-chev-body">
          <div class="p4-chev-title">SYRUP</div>
          <div class="p4-chev-cap">30,000 Bottle Liquid Mfg. Capacity Per Day</div>
        </div>
        <div class="p4-chev-arrows">&lt;&lt;&lt;</div>
        <div class="p4-chev-icon-badge">
          <img class="p4-chev-icon-img" src="${fmtSyrups}" alt="Syrup Product" />
        </div>
      </div>

      <!-- 05 Sachet -->
      <div class="p4-chev-card left-aligned">
        <div class="p4-chev-num">05</div>
        <div class="p4-chev-body">
          <div class="p4-chev-title">SACHET</div>
          <div class="p4-chev-cap">50,00,00 Sachet Mfg. Capacity Per Day</div>
        </div>
        <div class="p4-chev-arrows">&gt;&gt;&gt;</div>
        <div class="p4-chev-icon-badge">
          <img class="p4-chev-icon-img" src="${fmtSachets}" alt="Sachet Product" />
        </div>
      </div>

      <!-- 06 Effervescent -->
      <div class="p4-chev-card right-aligned">
        <div class="p4-chev-num">06</div>
        <div class="p4-chev-body">
          <div class="p4-chev-title">EFFERVESCENT TABLET</div>
          <div class="p4-chev-cap">10,00,00 Tube Mfg. Capacity Per Day</div>
        </div>
        <div class="p4-chev-arrows">&lt;&lt;&lt;</div>
        <div class="p4-chev-icon-badge">
          <img class="p4-chev-icon-img" src="${fmtEffervescent}" alt="Effervescent Product" />
        </div>
      </div>
    </div>

    <!-- BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT -->
    <div class="p4-private-ribbon">PRIVATE LABEL CONTRACT MANUFACTURING</div>

    <div class="p4-pillars-grid">
      <div class="p4-pill-item">
        <h4>1. PRODUCT DEVELOPMENT</h4>
        <p>The specialist for premium quality, superior bioavailability, and current nutritional food trends.</p>
      </div>
      <div class="p4-pill-item">
        <h4>4. CONSULTANCY</h4>
        <p>Decades of expert formulation experience in nutraceutical, sports nutrition, and dietary food production.</p>
      </div>
      <div class="p4-pill-item">
        <h4>2. PACKAGING</h4>
        <p>A perfect marriage of barrier protection, international compliance, and attractive aesthetic design.</p>
      </div>
      <div class="p4-pill-item">
        <h4>5. MARKET ANALYTICS</h4>
        <p>Knowing today what the market trend, active ingredients, and consumer preferences will be tomorrow.</p>
      </div>
      <div class="p4-pill-item">
        <h4>3. QUALITY MANAGEMENT</h4>
        <p>Zero compromises on raw material purity, potency, microbiological safety, and active ingredient assays.</p>
      </div>
      <div class="p4-pill-item">
        <h4>6. SUSTAINABILITY</h4>
        <p>Responsible manufacturing practices for people, healthcare safety, and eco-friendly packaging materials.</p>
      </div>
    </div>

    <div class="std-footer">
      <span class="page-badge-num">04</span>
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
    </div>
  </div>

  <!-- ================================================================
       PAGE 5: COMPANY PHOTO GALLERY (WHITE LIGHT THEME)
       ================================================================ -->
  <div class="page p5-gallery">
    <svg class="botanical-accent" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M85 15C65 20 45 40 40 65C60 60 80 40 85 15Z" fill="#99c229" opacity="0.85"/>
      <path d="M85 15C60 30 50 55 45 85C70 75 80 45 85 15Z" fill="#88ad24" opacity="0.85"/>
    </svg>

    <div class="title-gallery">
      <h2>Company</h2>
      <span>Photo gallery</span>
    </div>

    <div class="p5-gallery-grid">
      ${galleryImgs.map(img => `
        <div class="p5-photo-card">
          <img class="p5-photo-img" src="${img.uri}" alt="Gomzi Facility Photo ${img.id}" />
        </div>
      `).join('')}
    </div>

    <div class="std-footer">
      <span class="page-badge-num">05</span>
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
    </div>
  </div>

  <!-- ================================================================
       PAGE 6: QUALITY ASSURANCE & R&D & WHY GOMZI
       ================================================================ -->
  <div class="page p6-quality">
    <div class="title-qa">
      <span>Quality</span>
      <h2>ASSURANCE</h2>
    </div>

    <div class="p6-qa-split">
      <div class="p6-qa-text">
        <p>At Gomzi Life Science LLP we have a dedicated and committed quality assurance team which strives for continuous improvements in our quality and have been constantly working to enhance the existing quality of products, services by optimizing production processes, introducing new methods and process.</p>
        <p>Our quality assurance team focuses on process of improvements. The goal of the team is to reduce variance in processes in order to predict the quality of an output. Our QA team has separate members for audit who focus on working with the each client to ensure that all the client needs are met and fulfilled. Additionally, the team also has a separate documentation system whose duty is to provide a library of all documents and also make sure that all the documents are correct and complete.</p>
      </div>
      <div class="p6-lab-thumb-wrap">
        <img class="p6-lab-thumb-img" src="${resLabImg}" alt="Laboratory Analysis" />
      </div>
    </div>

    <!-- BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT -->
    <div class="p6-rnd-card">
      <h3>Research and DEVELOPMENT</h3>
      <p>Our core strength lies in our research and development oriented approach to introduce innovative products with the help of dedicated professionals engaged in discovering new ideas, formulations, design, quality assurance methods, and state-of-the-art stability chambers.</p>
    </div>

    <div class="p6-why-box">
      <div class="p6-why-header">
        <h3>WHY</h3>
        <img src="${logoImg}" alt="Gomzi" />
      </div>

      <div class="p6-why-grid">
        <div class="p6-why-item"><span class="p6-why-num">1</span> One Stop Solution For All Third Party Manufacturing Needs</div>
        <div class="p6-why-item"><span class="p6-why-num">6</span> Packaging Designed as Per Latest Global &amp; FSSAI Guidelines</div>
        <div class="p6-why-item"><span class="p6-why-num">2</span> In-House Formulation &amp; Graphic Design Facilities</div>
        <div class="p6-why-item"><span class="p6-why-num">7</span> WHO/GMP, ISO 22000, US FDA &amp; FSSAI Approved Plant</div>
        <div class="p6-why-item"><span class="p6-why-num">3</span> Time Bound Delivery Schedules &amp; Fast Dispatch Turnaround</div>
        <div class="p6-why-item"><span class="p6-why-num">8</span> In-House Specialized R&amp;D Formulation Development Lab</div>
        <div class="p6-why-item"><span class="p6-why-num">4</span> Strict Quality, Purity &amp; Highly Efficacious Formulations</div>
        <div class="p6-why-item"><span class="p6-why-num">9</span> Advanced In-House Instrumental &amp; Analytical Testing Lab</div>
        <div class="p6-why-item"><span class="p6-why-num">5</span> Dynamic Team Of Marketing &amp; Technical Professionals</div>
        <div class="p6-why-item"><span class="p6-why-num">10</span> Modern Science Infrastructure &amp; High-Speed Automation</div>
      </div>
    </div>

    <div class="std-footer">
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
      <span class="page-badge-num">06</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 7: PRODUCT CATEGORY (WHITE LIGHT THEME WITH #99c229 ACCENTS)
       ================================================================ -->
  <div class="page p7-category">
    <svg class="botanical-accent" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M85 15C65 20 45 40 40 65C60 60 80 40 85 15Z" fill="#99c229" opacity="0.85"/>
      <circle cx="35" cy="40" r="5" fill="#99c229" opacity="0.9"/>
      <circle cx="28" cy="52" r="4" fill="#88ad24" opacity="0.9"/>
      <circle cx="45" cy="55" r="4.5" fill="#cce68c" opacity="0.85"/>
    </svg>

    <div class="title-category">
      <span>Product</span>
      <h2>CATEGORY</h2>
    </div>

    <!-- POWDERS -->
    <div class="p7-powders-block">
      <div class="p7-powders-head">
        <h3>POWDERS</h3>
      </div>
      <div class="p7-powders-text">
        General Protein Powder, Hepatic Protein Powder, Renal Protein Powder, Heart Care Protein Powder, Egg Albumin Powder, Chicken Protein Powder, Woman Protein Powder, Kids Protein Powder, High Protein Diet, Cancer Protein Powder, Cardiac Protein Powder, Diabetic Protein Powder, Weight Management Protein Powder, Weight Loss Protein Powder, Protein Granule, Soya Protein Isolate, Pea Protein Powder, Hemp Protein Powder, Vitamin Premix &amp; Mineral Mixture, Instant Energy Drink Powder, Dietary Fibers, Red Fruit Smoothies, Green Vegetable Smoothies, Beet Root Powder, Plant and Herbs Protein Powder, Personalized Whey Protein Powder, Plant Based Biotin, Collagen Peptides, Collagen Builder, Height Grow Protein Powder, Woman’s Weight Gainer, Milk Protein Powder, Joint Care Protein Powder.
      </div>
    </div>

    <!-- SACHET & MALNUTRITION -->
    <div class="p7-grid-2col">
      <div class="p7-cat-box accent-bg">
        <div class="p7-cat-title">SACHET</div>
        <div class="p7-cat-desc">
          L-Arginine sachet, L-Glutamine Sachet, Vitamin D3 Pellets/Granules, Pre &amp; Pro Biotic Sachet, Energy Drink Powder Sachet, Protein Concentrate Sachet, Stevia Sachet, ORS Hydration Sachet.
        </div>
      </div>
      <div class="p7-cat-box accent-bg">
        <div class="p7-cat-title">MALNUTRITION PRODUCTS</div>
        <div class="p7-cat-desc">
          F-75 Therapeutic Sachet, F-100 Sachet, Nutritional Micronutrient Sprinkles, Ready-to-Use Therapeutic Food (RUTF), RUSF, Fortified Corn Soya Blends, Plumpy Nut Equivalents.
        </div>
      </div>
    </div>

    <!-- SYRUP -->
    <div class="p7-full-box">
      <div class="p7-cat-title">SYRUP &amp; LIQUID ORALS</div>
      <div class="p7-cat-desc">
        Multivitamin Syrup, Calcium Suspensions, Carbonyl Iron Syrup, Digestive Enzyme Syrup, Vitamin D3 Oral Drops, Zinc Bisglycinate and Ferrous Bisglycinate Syrup, Pediatric Nutritional Drops, Liver Tonic Syrup, Appetite Stimulant Liquid.
      </div>
    </div>

    <!-- TABLETS/CAPSULES -->
    <div class="p7-full-box">
      <div class="p7-cat-title">NUTRACEUTICAL &amp; DIETARY TABLETS / CAPSULES</div>
      <div class="p7-cat-desc">
        Multivitamin with Minerals Tablets, Calcium with Vitamin D3 Tablets, Chelated Iron with Folic Acid Tablets, Joint Care Glucosamine &amp; Chondroitin Tablets, Co-enzyme Q10 Tablets, Methylcobalamin Vitamin B12, Alpha Lipoic Acid Tablets, Biotin Hair Care Tablets, Alpha Keto Analogue Tablets, Silymarin with Antioxidants, L-Glutathione Skin Brightening Tablets, Omega-3 Fish Oil Capsules.
      </div>
    </div>

    <!-- SOFTGEL & GYM -->
    <div class="p7-grid-2col">
      <div class="p7-cat-box">
        <div class="p7-cat-title">SOFTGEL CAPSULES</div>
        <div class="p7-cat-desc">
          Multivitamins &amp; Minerals Antioxidants, Iron Supplement, Triple Strength Fish Oil Softgel, Krill Oil, Cod Liver Oil, Flaxseed Oil, Hemp Seed Oil, Omega 3-6-9 Fatty Acids, Algae Oil DHA, Bio-D3 Cholecalciferol, Natural Progesterone, Methylcobalamin Softgel.
        </div>
      </div>
      <div class="p7-cat-box">
        <div class="p7-cat-title">GYM &amp; SPORTS SUPPLEMENTS</div>
        <div class="p7-cat-desc">
          Lean Weight Gainer, Mega Mass Gainer, 100% Whey Protein Concentrate 80%, Whey Protein Isolate 90%, Hydrolyzed Whey Iso Gold, Organic Plant Protein, Micellar Casein, Fast Carbo, Pre-Workout Nitric Oxide Booster, Micronized Creatine, BCAA 2:1:1, L-Glutamine, Thermogenic Fat Burners.
        </div>
      </div>
    </div>

    <!-- EFFERVESCENT TABLET -->
    <div class="p7-full-box">
      <div class="p7-cat-title">EFFERVESCENT TABLETS</div>
      <div class="p7-cat-desc">
        Apple Cider Vinegar with Mother, High Potency Biotin, Calcium + Magnesium + Zinc + Vitamin D3, Fast Hydration Electrolytes, Reduced L-Glutathione with Vitamin C, Iron + Folic Acid, Daily Multivitamins with Essential Multiminerals, N-Acetylcysteine (NAC 600mg), Probiotics Effervescent, Super Green Detox Fizz.
      </div>
    </div>

    <div class="std-footer">
      <span class="page-badge-num">07</span>
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
    </div>
  </div>

  <!-- ================================================================
       PAGE 8: GLOBAL PRESENCE (WHITE LIGHT THEME + #99c229 BANNERS)
       ================================================================ -->
  <div class="page p8-global">
    <div>
      <div class="p8-header-top">
        <img class="p8-top-logo" src="${logoImg}" alt="Gomzi" />
      </div>

      <!-- BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT -->
      <div class="p8-title-banner">
        <h2>GLOBAL PRESENCE</h2>
      </div>

      <div class="p8-metrics-bar">
        <div class="p8-metric-duo">
          <div>
            <div class="p8-metric-val">45+</div>
            <div class="p8-metric-lbl">COUNTRIES</div>
          </div>
          <div>
            <div class="p8-metric-val" style="white-space: nowrap;">1,000+</div>
            <div class="p8-metric-lbl">PRODUCTS</div>
          </div>
        </div>

        <div class="p8-mfg-lead">
          <span>Leading name in contract</span>
          <!-- BANNER BUTTON: #99c229 BACKGROUND WITH WHITE TEXT -->
          <div class="p8-mfg-badge">MANUFACTURING facility and GLOBALLY EXPORT</div>
        </div>
      </div>

      <!-- ONLY THE 6 COUNTRIES / MARKETS SHOWN IN MAP - 2 ROWS OF 3 -->
      <div class="p8-focus-corridors">
        <div class="p8-corridor-title">KEY EXPORT CORRIDORS &amp; GLOBAL MARKETS:</div>
        <div class="p8-corridor-grid">
          <div class="corridor-pill"><span class="dot"></span> United Kingdom</div>
          <div class="corridor-pill"><span class="dot"></span> African markets</div>
          <div class="corridor-pill"><span class="dot"></span> Dubai, UAE</div>
          <div class="corridor-pill"><span class="dot"></span> Sri Lanka</div>
          <div class="corridor-pill"><span class="dot"></span> Bangladesh</div>
          <div class="corridor-pill"><span class="dot"></span> Asian markets</div>
        </div>
      </div>
    </div>

    <!-- CRISP WHITE LIGHT MAP ZONE - NO DARK GREEN -->
    <div class="p8-map-zone">
      <svg class="p8-map-svg" viewBox="0 0 1000 450" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pill-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#99c229" flood-opacity="0.3" />
          </filter>
        </defs>

        <!-- Base Landmasses in clean light sage on white canvas -->
        <path d="${worldPath}" fill="#eef5e4" stroke="#99c229" stroke-width="0.75" />

        <!-- Flight path routes (6 Focus Markets ONLY) in #99c229 -->
        ${mapRoutes.map(r => `
          <path d="${r.d}" fill="none" stroke="#99c229" stroke-width="2.6" stroke-dasharray="5,4" opacity="0.95" />
          
          <!-- Route destination pinpoint on the map -->
          <circle cx="${r.end.x.toFixed(1)}" cy="${r.end.y.toFixed(1)}" r="6" fill="#99c229" stroke="#ffffff" stroke-width="2.2" />
          
          <!-- Leader connection line to badge -->
          <line x1="${r.end.x.toFixed(1)}" y1="${r.end.y.toFixed(1)}" x2="${r.pill.x.toFixed(1)}" y2="${r.pill.y.toFixed(1)}" stroke="#99c229" stroke-width="1.3" stroke-dasharray="2,2" opacity="0.85" />
          
          <!-- BUTTON BADGE: #99c229 WITH WHITE TEXT -->
          <g filter="url(#pill-shadow)">
            <rect x="${(r.pill.x - r.pill.w / 2).toFixed(1)}" y="${(r.pill.y - r.pill.h / 2).toFixed(1)}" width="${r.pill.w}" height="${r.pill.h}" rx="12.5" fill="#99c229" stroke="#ffffff" stroke-width="2" />
            <circle cx="${(r.pill.x - r.pill.w / 2 + 10).toFixed(1)}" cy="${r.pill.y.toFixed(1)}" r="3" fill="#ffffff" />
            <text x="${(r.pill.x + 3.5).toFixed(1)}" y="${(r.pill.y + 4.5).toFixed(1)}" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="900" font-family="'Inter', 'Plus Jakarta Sans', sans-serif" letter-spacing="0.02em">${r.name}</text>
          </g>
        `).join('')}

        <!-- Origin: Surat (HQ & Plant) Central Hub in #99c229 and White -->
        <circle cx="${start.x.toFixed(1)}" cy="${start.y.toFixed(1)}" r="8" fill="#99c229" stroke="#ffffff" stroke-width="2.5" />
        <circle cx="${start.x.toFixed(1)}" cy="${start.y.toFixed(1)}" r="18" fill="none" stroke="#99c229" stroke-width="2" opacity="0.65" />
        
        <!-- Surat Leader Line into open Central Asia -->
        <line x1="${start.x.toFixed(1)}" y1="${(start.y - 8).toFixed(1)}" x2="${start.x.toFixed(1)}" y2="138" stroke="#99c229" stroke-width="2" stroke-dasharray="3,2" />
        
        <!-- Surat Highlight Badge: #99c229 with White Text -->
        <g filter="url(#pill-shadow)">
          <rect x="${(start.x - 88).toFixed(1)}" y="114" width="176" height="26" rx="13" fill="#99c229" stroke="#ffffff" stroke-width="2.5" />
          <text x="${start.x.toFixed(1)}" y="132" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="900" font-family="'Inter', 'Plus Jakarta Sans', sans-serif" letter-spacing="0.03em">★ Surat (HQ &amp; Plant)</text>
        </g>
      </svg>

      <!-- Global Logistics & Trade Capabilities Strip - WHITE LIGHT THEME WITH #99c229 BORDERS & HEADERS -->
      <div class="p8-trade-highlights">
        <div class="p8-trade-card">
          <h4>✈ Strategic Coastal Hub</h4>
          <p>Facility in Surat near Hazira &amp; Mundra ports; fast customs clearance for sea container and air cargo dispatches.</p>
        </div>
        <div class="p8-trade-card">
          <h4>📦 Tropicalized Packaging</h4>
          <p>Climate-adapted multi-layer induction barrier foils and moisture-resistant packaging engineered for global transit.</p>
        </div>
        <div class="p8-trade-card">
          <h4>📑 Full Dossier Support</h4>
          <p>Complete CTD/eCTD dossiers, Certificates of Pharmaceutical Product (COPP), COA, Free Sale Certificates &amp; embassy attestations.</p>
        </div>
      </div>
    </div>

    <div class="std-footer" style="padding-top: 2.5mm; background: #ffffff;">
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
      <span class="page-badge-num">08</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 9: PRODUCT CERTIFICATION & CONTACT INFORMATION (WHITE LIGHT)
       ================================================================ -->
  <div class="page p9-contact">
    <div class="title-cert">
      <span>Product</span>
      <h2>CERTIFICATION</h2>
    </div>
    <div class="p9-cert-subtitle">
      Our company complying the world class quality control measures and certified with the concerned authorities.
    </div>

    <div class="p9-certs-grid">
      ${certImgs.map(c => `
        <div class="p9-cert-card">
          <img class="p9-cert-img" src="${c.uri}" alt="${c.name}" />
          <div class="p9-cert-name">${c.name}</div>
        </div>
      `).join('')}
    </div>

    <div class="p9-contact-card">
      <div class="p9-contact-col">
        <h4>REGISTERED OFFICE &amp; PLANT</h4>
        <p><strong>Gomzi Life Science LLP</strong></p>
        <p>443, 444, 445, 1st Floor, RJD Textile Park,</p>
        <p>At. Ichchhapor, Hazira Road,</p>
        <p>Surat - 394510, Gujarat, India.</p>

        <h4 style="margin-top: 4.5mm;">CORPORATE OFFICE</h4>
        <p>Gaurav Path, Palanpor,</p>
        <p>Surat - 395009, Gujarat, India.</p>
      </div>

      <div class="p9-contact-col">
        <h4>IMPORT / EXPORT INQUIRY</h4>
        <div class="p9-contact-detail-row">
          <span>📞 Phone / WhatsApp:</span>
          <strong>+91 83200 77993</strong>
          <span>✉ Email:</span>
          <a href="mailto:export@gomzilifesciences.in">export@gomzilifesciences.in</a>
        </div>

        <h4 style="margin-top: 4.5mm;">DOMESTIC INQUIRY</h4>
        <div class="p9-contact-detail-row">
          <span>📞 Phone / WhatsApp:</span>
          <strong>+91 83200 77993</strong>
          <span>✉ Email:</span>
          <a href="mailto:info@gomzilifesciences.in">info@gomzilifesciences.in</a>
        </div>
      </div>
    </div>

    <div class="p9-bottom-block">
      <div class="p9-web-links">
        <h4>Click to Website</h4>
        <div>
          <!-- BUTTONS: #99c229 WITH WHITE TEXT -->
          <a class="p9-btn-link" href="https://www.gomzilifesciences.in" target="_blank">🌐 www.gomzilifesciences.in</a>
          <a class="p9-btn-link" href="https://www.gomzilifesciences.in/nutrition" target="_blank">🌿 india.gomzilifesciences.in</a>
        </div>
      </div>

      <div class="p9-thank-you">
        <strong>Thank you for choosing Gomzi Life Science LLP!</strong>
        <p>We sincerely appreciate your business and hope to build long-term international partnerships.</p>
      </div>
    </div>

    <div class="std-footer">
      <img class="footer-logo" src="${logoImg}" alt="Gomzi" />
      <span class="page-badge-num">09</span>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(rootDir, 'gomzi-company-profile.html');
const pdfFilePath = path.join(rootDir, 'Gomzi-Life-Science-Company-Profile.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`Saved HTML blueprint to: ${htmlFilePath}`);

console.log('Rendering PDF via Microsoft Edge / Chrome headless...');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExe = fs.existsSync(edgePath) ? edgePath : chromePath;

console.log(`Using browser: ${browserExe}`);

const psCmd = `Start-Process -FilePath '${browserExe}' -ArgumentList '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=\\"${pdfFilePath}\\"', '\\"${htmlFilePath}\\"' -Wait`;

try {
  execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });

  if (fs.existsSync(pdfFilePath)) {
    const stat = fs.statSync(pdfFilePath);
    console.log(`\n======================================================`);
    console.log(`  PDF Generated Successfully: ${pdfFilePath}`);
    console.log(`  File size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
    const publicPdfPath = path.join(rootDir, 'frontend', 'public', 'Gomzi-Life-Science-Company-Profile.pdf');
    fs.copyFileSync(pdfFilePath, publicPdfPath);
    console.log(`  Public Web Copy: ${publicPdfPath}`);
    console.log(`======================================================\n`);
  } else {
    throw new Error('PDF file was not created');
  }
} catch (err) {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
}
