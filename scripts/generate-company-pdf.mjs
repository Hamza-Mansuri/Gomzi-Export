import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to encode image file to base64 Data URI
function toBase64Uri(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return '';
  }
  const ext = path.extname(fullPath).toLowerCase().replace('.', '');
  const mime = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const data = fs.readFileSync(fullPath).toString('base64');
  return `data:${mime};base64,${data}`;
}

// Import SVG path from worldPath.ts
const worldPathFile = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'data', 'worldPath.ts'), 'utf-8');
const worldPathMatch = worldPathFile.match(/export const worldPath = '([^']+)';/);
const worldPath = worldPathMatch ? worldPathMatch[1] : '';

// Projection and routes for map
const origin = { lon: 72.83, lat: 21.17, name: 'Surat, India' };
const markets = [
  { id: 'uk', name: 'United Kingdom', region: 'Europe', lon: -0.12, lat: 51.5 },
  { id: 'africa', name: 'African markets', region: 'Africa', lon: 8.68, lat: 9.08 },
  { id: 'dubai', name: 'Dubai, UAE', region: 'Middle East', lon: 55.27, lat: 25.2 },
  { id: 'sri-lanka', name: 'Sri Lanka', region: 'South Asia', lon: 80.77, lat: 7.87 },
  { id: 'bangladesh', name: 'Bangladesh', region: 'South Asia', lon: 90.36, lat: 23.68 },
  { id: 'asia', name: 'Asian markets', region: 'Asia Pacific', lon: 108.28, lat: 14.06 },
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

// Load images as Base64
console.log('Loading high-resolution asset images...');
const logoImg = toBase64Uri('frontend/public/assets/images/logo.webp');
const heroImg = toBase64Uri('frontend/public/assets/images/hero-banner.webp');
const resLabImg = toBase64Uri('frontend/public/assets/images/research-laboratory.webp');
const aboutLabImg = toBase64Uri('frontend/public/assets/images/about-laboratory.webp');

// Format images
const fmtPowders = toBase64Uri('frontend/public/assets/images/format-powders.webp');
const fmtTablets = toBase64Uri('frontend/public/assets/images/format-tablets.webp');
const fmtCapsules = toBase64Uri('frontend/public/assets/images/format-capsules.webp');
const fmtSachets = toBase64Uri('frontend/public/assets/images/format-sachets.webp');
const fmtSyrups = toBase64Uri('frontend/public/assets/images/format-syrups.webp');
const fmtEffervescent = toBase64Uri('frontend/public/assets/images/format-effervescent.webp');
const fmtGummies = toBase64Uri('frontend/public/assets/images/format-gummies.webp');
const fmtDrops = toBase64Uri('frontend/public/assets/images/format-drops.webp');
const fmtGranules = toBase64Uri('frontend/public/assets/images/format-granules.webp');

// Gallery photos 01-10
const galleryImgs = [];
for (let i = 1; i <= 10; i++) {
  const id = String(i).padStart(2, '0');
  galleryImgs.push({
    id,
    uri: toBase64Uri(`frontend/public/assets/gallery/gallery-${id}.webp`)
  });
}

// Certifications
const certIds = ['who', 'haccp', 'iso-22000', 'gmp', 'fda', 'halal', 'fieo', 'fssai', 'pharmexcil', 'kosher', 'sgcci'];
const certNames = {
  who: 'WHO',
  haccp: 'HACCP',
  'iso-22000': 'ISO 22000:2018',
  gmp: 'GMP',
  fda: 'FDA',
  halal: 'HALAL',
  fieo: 'FIEO',
  fssai: 'FSSAI',
  pharmexcil: 'Pharmexcil',
  kosher: 'KOSHER',
  sgcci: 'SGCCI'
};
const certImgs = certIds.map(id => ({
  id,
  name: certNames[id],
  uri: toBase64Uri(`frontend/public/assets/certifications/${id}.webp`)
}));

console.log('Generating premium corporate PDF HTML...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gomzi Life Science LLP - Corporate Profile & Product Catalogue</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --green: #24452e;
      --green-dark: #172d1e;
      --green-light: #325e3f;
      --lime: #8cc63f;
      --lime-soft: #c8e39d;
      --accent: #5e8c2c;
      --ink: #1e241c;
      --muted: #5e6857;
      --paper: #f8f9f5;
      --sage: #edf1e6;
      --sage-light: #f4f6ef;
      --line: #d8ded0;
      --white: #ffffff;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      font-family: var(--font);
      color: var(--ink);
      background: #eef2ea;
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
    }

    /* Page container */
    .page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      overflow: hidden;
      position: relative;
      background: var(--white);
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }

    /* Running header & footer */
    .page-header {
      padding: 10mm 14mm 4mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--line);
      background: var(--white);
      z-index: 10;
    }
    .page-header__left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--green);
    }
    .page-header__dot {
      width: 5px;
      height: 5px;
      background: var(--lime);
      display: inline-block;
    }
    .page-header__logo {
      height: 7mm;
      object-fit: contain;
    }

    .page-footer {
      margin-top: auto;
      padding: 4mm 14mm 8mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--line);
      font-size: 7.5pt;
      color: var(--muted);
      background: var(--white);
      z-index: 10;
    }
    .page-footer strong {
      color: var(--green);
    }
    .page-footer__num {
      font-weight: 700;
      color: var(--green);
      font-size: 8pt;
    }

    .page-content {
      flex: 1;
      padding: 6mm 14mm 6mm;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Typography */
    h1, h2, h3, h4 {
      color: var(--green-dark);
      font-weight: 700;
      line-height: 1.15;
      letter-spacing: -0.03em;
    }
    h2 {
      font-size: 20pt;
      margin-bottom: 3mm;
    }
    h3 {
      font-size: 13pt;
      margin-bottom: 2mm;
    }
    p {
      font-size: 9pt;
      color: var(--muted);
      line-height: 1.55;
    }
    .lead {
      font-size: 10.5pt;
      color: var(--ink);
      font-weight: 500;
      line-height: 1.5;
      margin-bottom: 3mm;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 2mm;
    }
    .eyebrow::before {
      content: '';
      width: 5px;
      height: 5px;
      background: var(--lime);
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6mm;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4.5mm;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4mm;
    }

    .card {
      background: var(--paper);
      border: 1px solid var(--line);
      padding: 4mm 5mm;
      position: relative;
    }

    /* ================================================================
       PAGE 1: COVER
       ================================================================ */
    .cover-page {
      background: #fafbf8;
      padding: 0;
      justify-content: space-between;
    }
    .cover-top-ribbon {
      background: var(--green);
      color: var(--white);
      padding: 4.5mm 16mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.14em;
    }
    .cover-top-ribbon span:last-child {
      color: var(--lime);
    }

    .cover-hero-section {
      padding: 10mm 16mm 0;
    }
    .cover-logo-wrapper {
      margin-bottom: 6mm;
    }
    .cover-logo {
      height: 14mm;
      object-fit: contain;
    }
    .cover-tagline {
      display: inline-block;
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 2mm;
    }
    .cover-title {
      font-size: 34pt;
      font-weight: 800;
      line-height: 0.98;
      letter-spacing: -0.05em;
      color: var(--green-dark);
      margin-bottom: 4mm;
    }
    .cover-title span {
      color: var(--accent);
    }
    .cover-subtitle {
      font-size: 11pt;
      max-width: 145mm;
      color: var(--muted);
      line-height: 1.5;
      margin-bottom: 5mm;
    }

    .cover-stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4mm;
      margin-bottom: 5mm;
    }
    .cover-stat-box {
      background: var(--white);
      border: 1px solid var(--line);
      padding: 3mm 4mm;
      border-left: 3px solid var(--lime);
    }
    .cover-stat-val {
      font-size: 15pt;
      font-weight: 800;
      color: var(--green);
      line-height: 1;
      margin-bottom: 1mm;
    }
    .cover-stat-lbl {
      font-size: 7.5pt;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cover-visual {
      width: 100%;
      height: 85mm;
      overflow: hidden;
      position: relative;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      background: #eef2e7;
    }
    .cover-visual img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
    }
    .cover-visual-badge {
      position: absolute;
      bottom: 4mm;
      right: 6mm;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
      padding: 2.5mm 5mm;
      font-size: 7.5pt;
      font-weight: 600;
      color: var(--green);
      border: 1px solid var(--line);
    }

    .cover-bottom-bar {
      background: var(--green-dark);
      color: var(--white);
      padding: 5mm 16mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cover-accredit {
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #dbe8d2;
    }
    .cover-accredit strong {
      color: var(--lime);
    }
    .cover-location {
      font-size: 7.5pt;
      color: #b7c7ad;
    }

    /* ================================================================
       PAGE 2: ABOUT US
       ================================================================ */
    .about-top-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 6mm;
      margin-bottom: 5mm;
    }
    .about-visual-box {
      position: relative;
      background: var(--sage);
      border: 1px solid var(--line);
      height: 62mm;
      overflow: hidden;
    }
    .about-visual-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 60% center;
    }
    .about-caption-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(36, 69, 46, 0.92);
      color: var(--white);
      padding: 3mm 4mm;
      font-size: 8pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .about-caption-box strong {
      color: var(--lime);
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4mm;
      margin-top: 4mm;
    }
    .pillar-card {
      background: var(--paper);
      border: 1px solid var(--line);
      padding: 4mm 4.5mm;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .pillar-num {
      font-size: 7pt;
      font-weight: 800;
      color: var(--accent);
      letter-spacing: 0.1em;
      margin-bottom: 1.5mm;
    }
    .pillar-title {
      font-size: 11pt;
      font-weight: 700;
      color: var(--green);
      margin-bottom: 2mm;
      line-height: 1.2;
    }
    .pillar-desc {
      font-size: 8pt;
      color: var(--muted);
      line-height: 1.5;
    }

    .key-facts-strip {
      margin-top: 5mm;
      background: var(--sage);
      border: 1px solid var(--line);
      padding: 3.5mm 6mm;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4mm;
      text-align: center;
    }
    .key-fact-item strong {
      display: block;
      font-size: 12pt;
      color: var(--green);
      font-weight: 800;
    }
    .key-fact-item span {
      font-size: 7pt;
      color: var(--muted);
      text-transform: uppercase;
      font-weight: 600;
    }

    /* ================================================================
       PAGE 3: 100% PRIVATE LABELLING & CONTRACT MFG
       ================================================================ */
    .workflow-timeline {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4mm 5mm;
      margin: 5mm 0;
    }
    .workflow-step {
      background: var(--paper);
      border: 1px solid var(--line);
      padding: 3.5mm 4mm;
      position: relative;
    }
    .workflow-step-badge {
      display: inline-block;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      background: var(--green);
      color: var(--white);
      font-size: 8pt;
      font-weight: 700;
      margin-bottom: 2mm;
    }
    .workflow-step h4 {
      font-size: 9.5pt;
      margin-bottom: 1.5mm;
      color: var(--green-dark);
    }
    .workflow-step p {
      font-size: 7.8pt;
      line-height: 1.45;
    }

    .pl-banner {
      background: var(--green);
      color: var(--white);
      padding: 5mm 6mm;
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 6mm;
      align-items: center;
      margin-top: 4mm;
    }
    .pl-banner h3 {
      color: var(--white);
      font-size: 13pt;
      margin-bottom: 2mm;
    }
    .pl-banner p {
      color: #cde0c4;
      font-size: 8.5pt;
      line-height: 1.5;
    }
    .pl-banner-checklist {
      list-style: none;
      display: grid;
      gap: 2mm;
      font-size: 8pt;
      color: #e2edd9;
    }
    .pl-banner-checklist li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pl-banner-checklist li::before {
      content: '✓';
      color: var(--lime);
      font-weight: 800;
    }

    /* ================================================================
       PAGE 4 & 5: CAPACITIES & DOSAGE FORMATS
       ================================================================ */
    .formats-grid-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4.5mm;
      margin-top: 3mm;
    }
    .format-entry {
      background: var(--paper);
      border: 1px solid var(--line);
      display: grid;
      grid-template-columns: 36mm 1fr;
      overflow: hidden;
      height: 38mm;
    }
    .format-entry__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: var(--sage);
    }
    .format-entry__body {
      padding: 3mm 3.5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .format-entry__header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .format-entry__header h4 {
      font-size: 10pt;
      color: var(--green);
    }
    .format-entry__num {
      font-size: 7.5pt;
      font-weight: 800;
      color: var(--accent);
    }
    .format-entry__subtitle {
      font-size: 7.5pt;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 1.5mm;
    }
    .format-entry__desc {
      font-size: 7.5pt;
      line-height: 1.4;
      color: var(--ink);
      margin-bottom: 1.5mm;
    }
    .format-entry__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5mm;
    }
    .format-tag {
      font-size: 6.5pt;
      font-weight: 600;
      background: var(--sage);
      border: 1px solid var(--line);
      padding: 0.8mm 2mm;
      color: var(--green);
    }

    /* Capabilities pills */
    .caps-pillars {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3.5mm;
      margin-top: 4mm;
    }
    .caps-pill {
      background: var(--white);
      border: 1px solid var(--line);
      border-left: 3px solid var(--green);
      padding: 3mm 3.5mm;
    }
    .caps-pill strong {
      display: block;
      font-size: 8.5pt;
      color: var(--green);
      margin-bottom: 1mm;
    }
    .caps-pill span {
      font-size: 7.2pt;
      color: var(--muted);
      line-height: 1.4;
      display: block;
    }

    /* ================================================================
       PAGE 6: PHOTO GALLERY
       ================================================================ */
    .gallery-grid-pdf {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3.5mm;
      margin-top: 3mm;
    }
    .gallery-card-pdf {
      background: var(--paper);
      border: 1px solid var(--line);
      display: grid;
      grid-template-columns: 38mm 1fr;
      height: 33mm;
      overflow: hidden;
    }
    .gallery-card-pdf__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: var(--sage);
    }
    .gallery-card-pdf__info {
      padding: 2.5mm 3.5mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .gallery-card-pdf__num {
      font-size: 7pt;
      font-weight: 800;
      color: var(--accent);
      margin-bottom: 0.8mm;
    }
    .gallery-card-pdf__title {
      font-size: 9.5pt;
      font-weight: 700;
      color: var(--green-dark);
      margin-bottom: 1mm;
      line-height: 1.2;
    }
    .gallery-card-pdf__desc {
      font-size: 7.2pt;
      color: var(--muted);
      line-height: 1.35;
    }

    /* ================================================================
       PAGE 7: QUALITY & R&D
       ================================================================ */
    .qa-layout {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 6mm;
      margin-bottom: 5mm;
    }
    .qa-points-list {
      display: grid;
      gap: 3mm;
    }
    .qa-point-item {
      background: var(--paper);
      border: 1px solid var(--line);
      padding: 3mm 4mm;
      border-left: 3px solid var(--accent);
    }
    .qa-point-item h4 {
      font-size: 9pt;
      color: var(--green);
      margin-bottom: 1mm;
    }
    .qa-point-item p {
      font-size: 7.5pt;
      line-height: 1.45;
    }

    .why-gomzi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5mm 5mm;
      background: var(--sage-light);
      border: 1px solid var(--line);
      padding: 4.5mm 6mm;
      margin-top: 4mm;
    }
    .why-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 8pt;
      color: var(--ink);
    }
    .why-num {
      font-weight: 800;
      color: var(--green);
      font-size: 7.5pt;
      min-width: 18px;
    }

    /* ================================================================
       PAGE 8: GLOBAL PRESENCE & MAP
       ================================================================ */
    .map-container-pdf {
      background: var(--sage);
      border: 1px solid var(--line);
      padding: 4mm;
      margin: 3mm 0 4mm;
      position: relative;
    }
    .map-svg-pdf {
      width: 100%;
      height: 70mm;
      display: block;
    }
    .map-corridors-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3.5mm;
    }
    .corridor-box {
      background: var(--paper);
      border: 1px solid var(--line);
      padding: 3mm 3.5mm;
    }
    .corridor-box strong {
      display: block;
      font-size: 8.5pt;
      color: var(--green);
      margin-bottom: 0.8mm;
    }
    .corridor-box span {
      display: block;
      font-size: 7.2pt;
      color: var(--muted);
      line-height: 1.4;
    }

    /* ================================================================
       PAGE 9: CERTIFICATIONS & CONTACT
       ================================================================ */
    .certs-grid-pdf {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3mm;
      margin: 3mm 0 6mm;
    }
    .cert-box-pdf {
      background: var(--white);
      border: 1px solid var(--line);
      padding: 3mm 2mm;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 24mm;
    }
    .cert-box-pdf img {
      max-height: 14mm;
      max-width: 28mm;
      object-fit: contain;
      margin-bottom: 1.5mm;
    }
    .cert-box-pdf span {
      font-size: 7pt;
      font-weight: 700;
      color: var(--green);
    }

    .contact-card-pdf {
      background: var(--green-dark);
      color: var(--white);
      padding: 6mm 8mm;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 8mm;
    }
    .contact-card-pdf h3 {
      color: var(--white);
      font-size: 13pt;
      margin-bottom: 2mm;
    }
    .contact-card-pdf p {
      color: #c9dbbe;
      font-size: 8pt;
      line-height: 1.6;
    }
    .contact-card-pdf address {
      font-style: normal;
      font-size: 8pt;
      color: #e5f0dc;
      line-height: 1.6;
      margin-top: 2mm;
    }
    .contact-detail-row {
      display: grid;
      gap: 2mm;
      margin-top: 3mm;
      font-size: 8pt;
    }
    .contact-detail-row div {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 1mm;
    }
    .contact-detail-row span {
      color: #b7cba9;
    }
    .contact-detail-row strong {
      color: var(--white);
    }

    .notice-box {
      margin-top: 3mm;
      font-size: 6.8pt;
      color: #8b9684;
      line-height: 1.45;
      text-align: justify;
    }
  </style>
</head>
<body>

  <!-- ================================================================
       PAGE 1: COVER PAGE
       ================================================================ -->
  <div class="page cover-page">
    <div class="cover-top-ribbon">
      <span>A MANUFACTURER & EXPORTER OF NUTRACEUTICAL PRODUCTS</span>
      <span>ESTABLISHED IN SURAT, GUJARAT, INDIA</span>
    </div>

    <div class="cover-hero-section">
      <div class="cover-logo-wrapper">
        <img class="cover-logo" src="${logoImg}" alt="Gomzi Life Science LLP" />
      </div>
      <span class="cover-tagline">Leading Name in Contract Manufacturing & Global Exports</span>
      <h1 class="cover-title">NUTRITION.<br />WITHOUT <span>BORDERS.</span></h1>
      <p class="cover-subtitle">
        Your formula. Your identity. Your global ambition. Gomzi Life Science LLP is a premier nutraceutical manufacturing and private labelling partner delivering international-grade products to discerning brand owners across worldwide markets.
      </p>

      <div class="cover-stats-row">
        <div class="cover-stat-box">
          <div class="cover-stat-val">9+ FORMATS</div>
          <div class="cover-stat-lbl">Powders, Tablets, Sachets & More</div>
        </div>
        <div class="cover-stat-box">
          <div class="cover-stat-val">6+ CORRIDORS</div>
          <div class="cover-stat-lbl">Active Global Export Corridors</div>
        </div>
        <div class="cover-stat-box">
          <div class="cover-stat-val">100% BESPOKE</div>
          <div class="cover-stat-lbl">Turnkey Private Labelling</div>
        </div>
      </div>
    </div>

    <div class="cover-visual">
      <img src="${heroImg}" alt="Gomzi Life Science Nutraceutical Packaging Concept" />
      <div class="cover-visual-badge">GOMZI LIFE SCIENCE · PRIVATE LABEL EXCELLENCE</div>
    </div>

    <div class="cover-bottom-bar">
      <div class="cover-accredit">
        AN-ISO 22000:2018 · WHO-GMP · FDA · HACCP · HALAL · FSSAI · KOSHER <strong>CERTIFIED REFERENCE STANDARDS</strong>
      </div>
      <div class="cover-location">
        Surat, Gujarat, India
      </div>
    </div>
  </div>

  <!-- ================================================================
       PAGE 2: ABOUT US & CORPORATE OVERVIEW
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>01 / Corporate Overview · Know About Us</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">A Considered Partnership</div>
      <h2>A Thoughtful Partner. At Every Step.</h2>

      <div class="about-top-grid">
        <div>
          <p class="lead">
            Great nutrition begins with a clear purpose. Great brands begin with the right manufacturing partner.
          </p>
          <p style="margin-bottom: 2.5mm;">
            Based in the industrial manufacturing hub of Surat, India, <strong>Gomzi Life Science LLP</strong> brings together advanced nutraceutical manufacturing, cutting-edge formulation development, and bespoke private labelling to help entrepreneurs, established enterprises, and global distributors build market-leading nutrition brands.
          </p>
          <p>
            From everyday sports performance and preventative wellness to specialized clinical dietary supplements, we place your vision at the center. Every formulation parameter, ingredient grade, batch size, and packaging configuration is calibrated around one uncompromising goal: producing finished products that feel unmistakably yours and command trust in international markets.
          </p>
        </div>
        <div class="about-visual-box">
          <img src="${resLabImg}" alt="Gomzi Research Laboratory" />
          <div class="about-caption-box">
            <span>Good Science. <strong>Even Better Partnerships.</strong></span>
            <span style="font-size: 7pt; color: #a4bfa0;">SURAT LAB</span>
          </div>
        </div>
      </div>

      <div class="eyebrow" style="margin-top: 2mm;">Guiding Principles</div>
      <div class="pillars-grid">
        <div class="pillar-card">
          <div class="pillar-num">01 / MISSION</div>
          <div class="pillar-title">Excellence in every single detail.</div>
          <div class="pillar-desc">
            To deliver nutritional products and contract services with uncompromising quality, rigorous compliance, and transparent integrity. We believe in continuous refinement from raw assay to finished formulation.
          </div>
        </div>
        <div class="pillar-card">
          <div class="pillar-num">02 / VISION</div>
          <div class="pillar-title">A healthier world, built together.</div>
          <div class="pillar-desc">
            To become a globally admired nutraceutical partner, bringing efficacious, premium, and affordable nutrition formulations to a wider global population through enduring commercial relationships.
          </div>
        </div>
        <div class="pillar-card">
          <div class="pillar-num">03 / VALUE</div>
          <div class="pillar-title">Your trust. Our responsibility.</div>
          <div class="pillar-desc">
            To place client collaboration at the very heart of contract manufacturing. We listen attentively to your market requirements, act with ethical clarity, and protect your brand equity with consistent quality.
          </div>
        </div>
      </div>

      <div class="key-facts-strip">
        <div class="key-fact-item">
          <strong>Surat, India</strong>
          <span>Strategic Hub</span>
        </div>
        <div class="key-fact-item">
          <strong>100%</strong>
          <span>Contract Based</span>
        </div>
        <div class="key-fact-item">
          <strong>Custom</strong>
          <span>Formulations</span>
        </div>
        <div class="key-fact-item">
          <strong>End-to-End</strong>
          <span>Turnkey Execution</span>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>info@gomzilifesciences.in</span>
      <span class="page-footer__num">02</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 3: 100% PRIVATE LABELLING & CONTRACT MANUFACTURING
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>02 / Bespoke Manufacturing · Private Labelling</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Turnkey Brand Enablement</div>
      <h2>From Concept to Your Finished Label.</h2>
      <p class="lead">
        We specialize in 100% third-party and contract manufacturing, empowering clients to market proprietary formulations without managing complex factory infrastructure.
      </p>

      <div class="workflow-timeline">
        <div class="workflow-step">
          <span class="workflow-step-badge">1</span>
          <h4>Formulation R&D</h4>
          <p>Active ingredient ratio balancing, flavour profiling, solubility optimization, and custom nutritional profile development tailored to your target consumer demographic.</p>
        </div>
        <div class="workflow-step">
          <span class="workflow-step-badge">2</span>
          <h4>Quality Sourcing</h4>
          <p>Certified raw material procurement with strict Certificate of Analysis (CoA) validation, active assay verification, and heavy metal screening for total peace of mind.</p>
        </div>
        <div class="workflow-step">
          <span class="workflow-step-badge">3</span>
          <h4>Packaging Architecture</h4>
          <p>Container selection (HDPE jars, blister packs, composite sachets, amber droppers), graphic label compliance, tamper-evident seals, and protective export barrier design.</p>
        </div>
        <div class="workflow-step">
          <span class="workflow-step-badge">4</span>
          <h4>Pilot Batch Testing</h4>
          <p>Pilot blend trials, organoleptic assessments, dissolution/disintegration testing, and real-time stability verification before full commercial run sign-off.</p>
        </div>
        <div class="workflow-step">
          <span class="workflow-step-badge">5</span>
          <h4>Cleanroom Production</h4>
          <p>High-speed automated blending, tableting, encapsulation, and filling in controlled cleanrooms adhering to stringent international hygiene protocols.</p>
        </div>
        <div class="workflow-step">
          <span class="workflow-step-badge">6</span>
          <h4>Global Export Logistics</h4>
          <p>Batch test certification, export documentation (Free Sale, Certificate of Origin, Legalization), palletization, and dispatch to maritime ports and air hubs.</p>
        </div>
      </div>

      <div class="pl-banner">
        <div>
          <h3>Your Brand Equity, Defended by Process Excellence</h3>
          <p>
            Whether you are an established international sports brand seeking diversified supply lines or a modern direct-to-consumer founder entering the wellness sphere, our contract infrastructure provides low capital friction, flexible batch planning, and guaranteed formula confidentiality.
          </p>
        </div>
        <ul class="pl-banner-checklist">
          <li>Custom Flavours & Natural Sweeteners</li>
          <li>Strict Non-Disclosure & Recipe Security</li>
          <li>Full In-House Graphic & Label Support</li>
          <li>Competitive Best-in-Class Unit Economics</li>
        </ul>
      </div>

      <div style="margin-top: 4mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;">
        <div class="card" style="border-left: 3px solid var(--lime);">
          <strong style="color: var(--green); font-size: 8.5pt;">Flexible Minimum Order Quantities</strong>
          <p style="font-size: 7.5pt; margin-top: 1mm;">Structured order volumes enable emerging brands to test market traction while offering scaled capacity for high-volume multinational container shipments.</p>
        </div>
        <div class="card" style="border-left: 3px solid var(--lime);">
          <strong style="color: var(--green); font-size: 8.5pt;">Regulatory Dossier Support</strong>
          <p style="font-size: 7.5pt; margin-top: 1mm;">Full documentary backing including ingredient breakdown, nutritional statements, allergen declarations, and stability reports for rapid import customs clearance.</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>Turnkey Contract Manufacturing</span>
      <span class="page-footer__num">03</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 4: CAPACITIES & DOSAGE FORMATS (PART 1)
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>03 / Capacities & Facilities · Supported Formats (Part 1)</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Comprehensive Dosage Capabilities</div>
      <h2>Supported Formats: Solid & Powder Systems</h2>
      <p class="lead">
        We engineer formulations across nine specialized delivery systems, ensuring optimal bioavailability, shelf stability, and superior consumer taste profiles.
      </p>

      <div class="formats-grid-cards">
        <!-- 01 Powders -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtPowders}" alt="Powders" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Powders & Blends</h4>
                <span class="format-entry__num">01</span>
              </div>
              <div class="format-entry__subtitle">Everyday & Performance Nutrition</div>
              <p class="format-entry__desc">High-uniformity blending for whey/plant protein, electrolytes, hydration salts, superfoods, and dietary fibers with instantized dispersion.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Whey Protein</span>
              <span class="format-tag">Electrolytes</span>
              <span class="format-tag">Pre-Workouts</span>
              <span class="format-tag">Collagen</span>
            </div>
          </div>
        </div>

        <!-- 02 Tablets -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtTablets}" alt="Tablets" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Tablets</h4>
                <span class="format-entry__num">02</span>
              </div>
              <div class="format-entry__subtitle">Convenient Daily Formulations</div>
              <p class="format-entry__desc">High-precision rotary tablet compression with options for film-coating, enteric coating, chewable textures, and sustained-release matrices.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Multivitamins</span>
              <span class="format-tag">Minerals</span>
              <span class="format-tag">Botanicals</span>
              <span class="format-tag">Coated</span>
            </div>
          </div>
        </div>

        <!-- 03 Capsules -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtCapsules}" alt="Capsules" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Hard & Soft Capsules</h4>
                <span class="format-entry__num">03</span>
              </div>
              <div class="format-entry__subtitle">Simple. Precise. Adaptable.</div>
              <p class="format-entry__desc">Automated capsule filling supporting vegetarian HPMC or gelatin shells in sizes #00, #0, #1, and #2, as well as oil-filled softgel options.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">HPMC Veg</span>
              <span class="format-tag">Gelatin</span>
              <span class="format-tag">Herbal Extracts</span>
              <span class="format-tag">Fish Oils</span>
            </div>
          </div>
        </div>

        <!-- 05 Sachets -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtSachets}" alt="Sachets" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Single-Serve Sachets</h4>
                <span class="format-entry__num">04</span>
              </div>
              <div class="format-entry__subtitle">Thoughtfully Portioned Nutrition</div>
              <p class="format-entry__desc">Multi-layer barrier foil packaging ensuring total moisture/oxygen protection for sensitive pre/probiotics, hydration powders, and single-serve drinks.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Stick Packs</span>
              <span class="format-tag">Probiotics</span>
              <span class="format-tag">Hydration</span>
              <span class="format-tag">Sample Packs</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top: 4mm; background: var(--sage); border-left: 3px solid var(--green);">
        <strong style="color: var(--green); font-size: 8.5pt;">Precision Quality Control on Solid Formats</strong>
        <p style="font-size: 7.5pt; margin-top: 1mm;">
          Every batch of tablets and capsules undergoes stringent hardness, friability, disintegration time, and active assay testing to ensure full pharmaceutical uniformity across millions of units.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>Dosage Formats: Solid Systems</span>
      <span class="page-footer__num">04</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 5: CAPACITIES & DOSAGE FORMATS (PART 2)
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>03 / Capacities & Facilities · Supported Formats (Part 2)</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Liquid, Chewable & Effervescent Delivery</div>
      <h2>Supported Formats: Specialty Systems</h2>
      <p class="lead">
        Modern consumers demand engaging nutritional rituals. Our liquid and effervescent processing capabilities provide refreshing, highly absorbable alternatives.
      </p>

      <div class="formats-grid-cards">
        <!-- 04 Syrups -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtSyrups}" alt="Syrups" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Syrups & Suspensions</h4>
                <span class="format-entry__num">05</span>
              </div>
              <div class="format-entry__subtitle">Nutrition in Liquid Format</div>
              <p class="format-entry__desc">Homogenized liquid blending with premium flavour balancing for multivitamin tonics, iron syrups, herbal elixirs, and pediatric nutrition.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Multivitamins</span>
              <span class="format-tag">Iron Tonics</span>
              <span class="format-tag">Enzyme Syrups</span>
              <span class="format-tag">Sugar-Free</span>
            </div>
          </div>
        </div>

        <!-- 06 Effervescents -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtEffervescent}" alt="Effervescents" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Effervescent Tablets</h4>
                <span class="format-entry__num">06</span>
              </div>
              <div class="format-entry__subtitle">Refreshing Dissolving Wellness</div>
              <p class="format-entry__desc">Dehumidified cleanroom compression preventing premature moisture reaction. Packaged in moisture-sealed tubes with desiccant caps.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Vitamin C + Zn</span>
              <span class="format-tag">Glutathione</span>
              <span class="format-tag">Electrolytes</span>
              <span class="format-tag">Tube Pack</span>
            </div>
          </div>
        </div>

        <!-- 07 Gummies -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtGummies}" alt="Gummies" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Functional Gummies</h4>
                <span class="format-entry__num">07</span>
              </div>
              <div class="format-entry__subtitle">An Enjoyable Daily Wellness Ritual</div>
              <p class="format-entry__desc">Pectin-based vegan and gelatin gummy manufacturing with custom moulds, natural fruit juices, and heat-resistant packaging.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Pectin Vegan</span>
              <span class="format-tag">Biotin</span>
              <span class="format-tag">Melatonin</span>
              <span class="format-tag">Apple Cider</span>
            </div>
          </div>
        </div>

        <!-- 09 Drops -->
        <div class="format-entry">
          <img class="format-entry__img" src="${fmtDrops}" alt="Drops" />
          <div class="format-entry__body">
            <div>
              <div class="format-entry__header">
                <h4>Precision Liquid Drops</h4>
                <span class="format-entry__num">08</span>
              </div>
              <div class="format-entry__subtitle">Small Format. High Potency.</div>
              <p class="format-entry__desc">Micro-dosed liquid actives in amber glass dropper bottles, ideal for fat-soluble vitamins (D3/K2), botanical extracts, and sublingual solutions.</p>
            </div>
            <div class="format-entry__tags">
              <span class="format-tag">Vitamin D3</span>
              <span class="format-tag">Herbal Tinctures</span>
              <span class="format-tag">Sublingual</span>
              <span class="format-tag">Glass Dropper</span>
            </div>
          </div>
        </div>
      </div>

      <div class="eyebrow" style="margin-top: 4mm;">Value-Added Manufacturing Services</div>
      <div class="caps-pillars">
        <div class="caps-pill">
          <strong>1. Formulation R&D</strong>
          <span>Micro-nutrient stability, bioavailability, and customized recipe design.</span>
        </div>
        <div class="caps-pill">
          <strong>2. Packaging Design</strong>
          <span>Bottles, blisters, tubs, cartons, and moisture-barrier materials.</span>
        </div>
        <div class="caps-pill">
          <strong>3. Quality Assurance</strong>
          <span>Comprehensive assay testing, microbial clearance, and CoA generation.</span>
        </div>
        <div class="caps-pill">
          <strong>4. Regulatory Consultancy</strong>
          <span>Export dossier support and labeling compliance for overseas jurisdictions.</span>
        </div>
        <div class="caps-pill">
          <strong>5. Market Analytics</strong>
          <span>Ingredient trend intelligence and high-growth formulation positioning.</span>
        </div>
        <div class="caps-pill">
          <strong>6. Responsible Sourcing</strong>
          <span>Clean-label ingredients, ethically sourced botanicals, and zero fillers.</span>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>Dosage Formats: Specialty Systems</span>
      <span class="page-footer__num">05</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 6: PHOTO GALLERY (REAL FACILITY)
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>04 / Facility Gallery · Inside Our Operations</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Authentic Manufacturing Infrastructure</div>
      <h2>Behind the Label. Inside Our Facility.</h2>
      <p class="lead">
        A photographic look at the advanced equipment, cleanroom environments, analytical testing suites, and dedicated personnel powering your products.
      </p>

      <div class="gallery-grid-pdf">
        <!-- 01 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[0].uri}" alt="Quality Assurance" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">01 / QUALITY CONTROL</span>
            <h4 class="gallery-card-pdf__title">Quality Assurance Inspection</h4>
            <p class="gallery-card-pdf__desc">Technician in cleanroom PPE conducting in-line equipment inspections and batch logging.</p>
          </div>
        </div>

        <!-- 02 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[1].uri}" alt="Cleanroom Processing" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">02 / STERILE OPERATIONS</span>
            <h4 class="gallery-card-pdf__title">Cleanroom Processing Facility</h4>
            <p class="gallery-card-pdf__desc">Specialized operator monitoring stainless steel processing tanks and automated valves.</p>
          </div>
        </div>

        <!-- 03 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[2].uri}" alt="Bottling Line" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">03 / PACKAGING LINE</span>
            <h4 class="gallery-card-pdf__title">Automated Bottling Line</h4>
            <p class="gallery-card-pdf__desc">High-speed automated conveyor conveying white HDPE bottles through clean bottling rails.</p>
          </div>
        </div>

        <!-- 04 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[3].uri}" alt="Bulk Processing" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">04 / BULK PRODUCTION</span>
            <h4 class="gallery-card-pdf__title">Bulk Processing Vessels</h4>
            <p class="gallery-card-pdf__desc">Cleanroom operators inspecting industrial stainless formulation vessels and transfer lines.</p>
          </div>
        </div>

        <!-- 05 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[4].uri}" alt="Precision Powder" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">05 / ANALYTICAL LAB</span>
            <h4 class="gallery-card-pdf__title">Precision Powder Formulation</h4>
            <p class="gallery-card-pdf__desc">R&D chemist weighing active nutritional powders on an analytical digital micro-balance.</p>
          </div>
        </div>

        <!-- 06 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[5].uri}" alt="Liquid Blending" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">06 / FORMULATION</span>
            <h4 class="gallery-card-pdf__title">Liquid Formulation Blending</h4>
            <p class="gallery-card-pdf__desc">Operators introducing liquid actives into stainless mixing units for uniform dispersion.</p>
          </div>
        </div>

        <!-- 07 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[6].uri}" alt="Bioreactor" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">07 / ADVANCED VESSELS</span>
            <h4 class="gallery-card-pdf__title">Stainless Pressure Bioreactor</h4>
            <p class="gallery-card-pdf__desc">Cleanroom technician recording digital tablet telemetry beside pressure reaction vessels.</p>
          </div>
        </div>

        <!-- 08 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[7].uri}" alt="Analytical Lab" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">08 / R&D CORRIDOR</span>
            <h4 class="gallery-card-pdf__title">Analytical Testing Laboratory</h4>
            <p class="gallery-card-pdf__desc">Modern laboratory corridor equipped with spectrophotometers and analytical testing equipment.</p>
          </div>
        </div>

        <!-- 09 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[8].uri}" alt="Capped Bottles" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">09 / FINISHING</span>
            <h4 class="gallery-card-pdf__title">Capped Bottle Packaging Line</h4>
            <p class="gallery-card-pdf__desc">Continuously running conveyor transporting capped dietary supplement bottles to induction sealers.</p>
          </div>
        </div>

        <!-- 10 -->
        <div class="gallery-card-pdf">
          <img class="gallery-card-pdf__img" src="${galleryImgs[9].uri}" alt="Auger Filling" />
          <div class="gallery-card-pdf__info">
            <span class="gallery-card-pdf__num">10 / POWDER FILLING</span>
            <h4 class="gallery-card-pdf__title">Auger Powder Filling</h4>
            <p class="gallery-card-pdf__desc">Precision auger filling nozzle dispensing bulk protein powder into large format white tubs.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>Authentic Facility Photo Gallery</span>
      <span class="page-footer__num">06</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 7: QUALITY ASSURANCE & R&D
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>05 / Research & Quality · Scientific Integrity</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Scientific Rigour & Verification</div>
      <h2>Care in the Process. Confidence in the Product.</h2>
      <p class="lead">
        What goes into a nutritional product matters just as much as the brand label upon it. Our multi-tiered quality assurance protocols protect brand integrity at every stage.
      </p>

      <div class="qa-layout">
        <div class="about-visual-box" style="height: 64mm;">
          <img src="${aboutLabImg}" alt="Laboratory Sample Inspection" />
          <div class="about-caption-box">
            <span>IT STARTS WITH A QUESTION. <strong>It Grows with Good Science.</strong></span>
          </div>
        </div>

        <div class="qa-points-list">
          <div class="qa-point-item">
            <h4>01 / Raw Material Quarantine & Assay</h4>
            <p>Every incoming botanical, amino acid, and vitamin lot is quarantined until identity, purity, potency, moisture, and microbial compliance are chemically certified.</p>
          </div>
          <div class="qa-point-item">
            <h4>02 / Environmental Cleanroom Controls</h4>
            <p>HEPA-filtered air handling, positive air pressure differentials, temperature, and relative humidity regulation ensure zero cross-contamination.</p>
          </div>
          <div class="qa-point-item">
            <h4>03 / In-Process Variance Mitigation</h4>
            <p>Dedicated QA auditors conduct regular weight variation, disintegration, blend uniformity, and torque checks throughout active production shifts.</p>
          </div>
          <div class="qa-point-item">
            <h4>04 / Full Batch Traceability & CoA</h4>
            <p>Every commercial batch is linked to complete batch production records (BPR), retention samples, and comprehensive Certificates of Analysis.</p>
          </div>
        </div>
      </div>

      <div class="eyebrow" style="margin-top: 1mm;">The Gomzi Advantage</div>
      <div class="why-gomzi-grid">
        <div class="why-item">
          <span class="why-num">01.</span>
          <span>100% turnkey third-party & private label manufacturing partner.</span>
        </div>
        <div class="why-item">
          <span class="why-num">02.</span>
          <span>In-house formulation R&D for bespoke recipe creation.</span>
        </div>
        <div class="why-item">
          <span class="why-num">03.</span>
          <span>Strict compliance with international GMP and ISO protocols.</span>
        </div>
        <div class="why-item">
          <span class="why-num">04.</span>
          <span>Comprehensive assay, heavy metal & microbial testing.</span>
        </div>
        <div class="why-item">
          <span class="why-num">05.</span>
          <span>Time-bound production scheduling & rapid turnaround.</span>
        </div>
        <div class="why-item">
          <span class="why-num">06.</span>
          <span>Modern high-speed tablet, capsule, and powder lines.</span>
        </div>
        <div class="why-item">
          <span class="why-num">07.</span>
          <span>Full packaging, labeling, and graphic support.</span>
        </div>
        <div class="why-item">
          <span class="why-num">08.</span>
          <span>Complete export documentation for global port clearance.</span>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>Quality Assurance & Scientific Rigour</span>
      <span class="page-footer__num">07</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 8: GLOBAL PRESENCE & EXPORT NETWORK
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>06 / Global Presence · International Corridors</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Expanding Worldwide Footprint</div>
      <h2>Rooted in India. Open to the World.</h2>
      <p class="lead">
        Strategically located near India’s major western deep-water ports, Gomzi Life Science LLP bridges manufacturing excellence with robust global export logistics.
      </p>

      <div class="map-container-pdf">
        <svg class="map-svg-pdf" viewBox="0 0 1000 450">
          <!-- Continents -->
          <path d="${worldPath}" fill="#c7d4bc" stroke="#edf1e6" stroke-width="0.8" />

          <!-- Outgoing Curved Routes -->
          ${mapRoutes.map(r => `
            <path d="${r.d}" fill="none" stroke="#24452e" stroke-width="1.8" stroke-dasharray="4 4" opacity="0.85" />
          `).join('')}

          <!-- Surat Origin Marker -->
          <g transform="translate(${start.x}, ${start.y})">
            <circle r="18" fill="rgba(140, 198, 63, 0.4)" stroke="#8cc63f" stroke-width="1.5" />
            <circle r="10" fill="#24452e" />
            <text text-anchor="middle" y="3.5" fill="#ffffff" font-size="9" font-weight="800">G</text>
          </g>

          <!-- Destination Markers -->
          ${mapRoutes.map(m => `
            <g transform="translate(${m.end.x}, ${m.end.y})">
              <circle r="12" fill="rgba(36, 69, 46, 0.2)" />
              <path d="M0 13 C-3 9 -9 5 -9 -1 a9 9 0 0 1 18 0 C9 5 3 9 0 13 Z" fill="#8cc63f" stroke="#24452e" stroke-width="1" />
              <text text-anchor="middle" y="2" fill="#24452e" font-size="8" font-weight="700">G</text>
              <text text-anchor="middle" y="21" fill="#1e241c" font-size="7" font-weight="700">${m.name}</text>
            </g>
          `).join('')}
        </svg>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2mm; font-size: 7.5pt; color: var(--green);">
          <span><strong>Origin Hub:</strong> Surat, Gujarat, India (Hazira & Nhava Sheva port connectivity)</span>
          <span style="color: var(--muted);">6 Major International Export Corridors</span>
        </div>
      </div>

      <div class="eyebrow">Active Export Destinations</div>
      <div class="map-corridors-grid">
        <div class="corridor-box">
          <strong>United Kingdom & Europe</strong>
          <span>Private label contract manufacturing for sports, daily nutrition and lifestyle wellness brands in the UK.</span>
        </div>
        <div class="corridor-box">
          <strong>African Markets</strong>
          <span>Supplying high-demand protein powders, essential vitamin supplements and therapeutic formulations.</span>
        </div>
        <div class="corridor-box">
          <strong>Dubai, UAE & Middle East</strong>
          <span>Strategic hub connections for premium nutraceuticals, halal-compliant capsules, and health drinks.</span>
        </div>
        <div class="corridor-box">
          <strong>Sri Lanka</strong>
          <span>Bilateral nutritional trade partnerships delivering tablets, syrups, and packaged sachet blends.</span>
        </div>
        <div class="corridor-box">
          <strong>Bangladesh</strong>
          <span>Contract formulations for dietary supplements, health drinks, and everyday family wellness ranges.</span>
        </div>
        <div class="corridor-box">
          <strong>Asia Pacific Markets</strong>
          <span>Broad commercial reach across Southeast Asia with specialized gummy, sachet, and effervescent formats.</span>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>International Logistics & Trade Corridors</span>
      <span class="page-footer__num">08</span>
    </div>
  </div>

  <!-- ================================================================
       PAGE 9: CERTIFICATIONS & CONTACT
       ================================================================ -->
  <div class="page">
    <div class="page-header">
      <div class="page-header__left">
        <span class="page-header__dot"></span>
        <span>07 / Product Certification & Corporate Directory</span>
      </div>
      <img class="page-header__logo" src="${logoImg}" alt="Gomzi" />
    </div>

    <div class="page-content">
      <div class="eyebrow">Recognized Industry Benchmarks</div>
      <h2>Quality Deserves Clear Documentation.</h2>
      <p class="lead">
        Operating in accordance with world-class regulatory standards. Our facility benchmarks and certified quality protocols assure seamless market entry across international borders.
      </p>

      <div class="certs-grid-pdf">
        ${certImgs.map(c => `
          <div class="cert-box-pdf">
            <img src="${c.uri}" alt="${c.name}" />
            <span>${c.name}</span>
          </div>
        `).join('')}
        <div class="cert-box-pdf" style="background: var(--sage); border-color: var(--line);">
          <strong style="color: var(--green); font-size: 8.5pt;">GLOBAL</strong>
          <span style="color: var(--accent); font-size: 6.8pt;">COMPLIANCE</span>
        </div>
      </div>

      <div class="contact-card-pdf">
        <div>
          <h3>Let’s Create What Comes Next.</h3>
          <p>
            Your ambition deserves a manufacturing partner that combines scientific rigor with entrepreneurial agility. Reach out to our international trade division today to discuss formulation ideas, packaging briefs, or sample requests.
          </p>
          <address>
            <strong>Gomzi Life Science LLP</strong><br />
            443, 444, 445, 1st Floor, RJD Textile Park,<br />
            At. Ichchhapor, Hazira Road,<br />
            Surat, Gujarat 394510, India
          </address>
        </div>

        <div>
          <h4 style="color: var(--lime); font-size: 9.5pt; margin-bottom: 2mm;">DIRECT INQUIRY CHANNELS</h4>
          <div class="contact-detail-row">
            <div>
              <span>Official Email</span>
              <strong>info@gomzilifesciences.in</strong>
            </div>
            <div>
              <span>Phone / WhatsApp</span>
              <strong>+91 83200 77993</strong>
            </div>
            <div>
              <span>Official Website</span>
              <strong>www.gomzilifesciences.in</strong>
            </div>
            <div>
              <span>Corporate Hub</span>
              <strong>Surat, Gujarat, India</strong>
            </div>
          </div>
          <div style="margin-top: 4mm; padding: 2.5mm 3.5mm; background: rgba(255,255,255,0.08); font-size: 7.2pt; color: #d4e3cb;">
            ⚡ Fast Turnaround: Dedicated technical managers respond to all commercial formulation briefs within 24 business hours.
          </div>
        </div>
      </div>

      <div class="notice-box">
        <strong>Notice & Attribution:</strong> Certification artwork reproduced as reference standards. Final product registrations, specific import permits, product approvals, and commercial contracts are executed directly under Gomzi Life Science LLP agreements. All formulations and specifications are agreed individually for each brand project. © ${new Date().getFullYear()} Gomzi Life Science LLP. All rights reserved.
      </div>
    </div>

    <div class="page-footer">
      <span>Gomzi Life Science LLP · Corporate Profile</span>
      <span>Accreditations & Corporate Directory</span>
      <span class="page-footer__num">09</span>
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
