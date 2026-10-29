import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const html = fs.readFileSync(path.join(rootDir, 'gomzi-company-profile.html'), 'utf-8');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const styleContent = styleMatch ? styleMatch[1] : '';

const rawPages = html.split('<div class="page ');
console.log(`Found ${rawPages.length - 1} pages.`);

for (let pageNum = 1; pageNum < rawPages.length; pageNum++) {
  let pageBody = '<div class="page ' + rawPages[pageNum];

  const pageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${styleContent}
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }
    .page {
      margin: 0;
      box-shadow: none;
    }
  </style>
</head>
<body>
  ${pageBody}
</body>
</html>`;

  const tmpHtml = path.join(rootDir, `tmp-page-${pageNum}.html`);
  const outPng = path.join(rootDir, `preview-page-${pageNum}.png`);
  fs.writeFileSync(tmpHtml, pageHtml, 'utf-8');

  try {
    // 794x1123 is exact 210mm x 297mm A4 at standard 96 DPI CSS pixels
    const psCmd = `Start-Process -FilePath '${edgePath}' -ArgumentList '--headless=new', '--disable-gpu', '--window-size=794,1123', '--screenshot=\\"${outPng}\\"', '\\"${tmpHtml}\\"' -Wait`;
    execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore' });
    console.log(`Rendered preview: preview-page-${pageNum}.png`);
  } catch (err) {
    console.error(`Error rendering page ${pageNum}:`, err.message);
  } finally {
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
  }
}
