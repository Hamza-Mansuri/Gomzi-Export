# Image Optimization & Asset Pipeline Guide

This project includes a fully automated, Windows-compatible image optimization pipeline powered by [Sharp](https://sharp.pixelplumbing.com/).

## Overview

- **Pipeline Command**: `npm run optimize`
- **Script Location**: `scripts/optimize-images.mjs`
- **Master Originals Directory**: `assets-source/` (outside `frontend/public/` so master uncompressed assets are never lost, deployed unnecessarily, or degraded).
- **Public Assets Directory**: `frontend/public/assets/` (deployed with the Vite production build).

---

## What the Pipeline Does

### 1. Gallery Photographs (`frontend/public/assets/gallery/`)
- **Genuine WebP Encoding**: Validates and converts source photos (JPEG, PNG) to genuine WebP format (`RIFF....WEBP`).
- **Quality & Preservation**: Encodes photographs at WebP quality 85 with `effort: 6` to preserve fine detail (hairnets, textures, equipment labels, instrument displays).
- **Idempotence & Generational Protection**: Pre-existing properly-optimised WebP files (such as `gallery-05` and `gallery-10`) are preserved without lossy re-encoding, avoiding generational degradation.
- **Auto-Orientation**: Applies EXIF metadata orientation correction (`.rotate()`) automatically.
- **Proportions & Dimensions**: Preserves native aspect ratios; never upscales lower-resolution sources.
- **Responsive Variants**: For source photos wider than 420px, generates a 400w thumbnail variant (`gallery-XX-400.webp`) used in `srcSet` for mobile and high-DPI displays.

### 2. Certification Artwork (`frontend/public/assets/certifications/`)
- Converts all 11 certification marks (`who`, `fda`, `gmp`, `fssai`, `halal`, `kosher`, `iso-22000`, `haccp`, `fieo`, `pharmexcil`, `sgcci`) to **lossless WebP** (`lossless: true`).
- Preserves full alpha channel transparency and pixel-perfect line sharpness.
- Removes raw PNGs from the public folder, reducing certification bundle size by ~32%.
- Vector maps (`world-map.svg`) and icons are retained as vectors.

### 3. Public Master Cleanup
- Removes unreferenced source files such as the 2.15MB `hero-banner.png` from `frontend/public/` (safely archived in `assets-source/images/hero-banner.png`), preventing heavy bloat in production bundles.

---

## Adding Future Gallery Photos (Slots 11–15)

1. **Add Master Photo**:
   Drop the photo (JPEG, PNG, or WebP) into `assets-source/gallery/` named `gallery-11.jpg` (or `gallery-12.jpg`, etc.).
   *(If placed in `frontend/public/assets/gallery/`, the script will automatically detect and sync a backup copy to `assets-source/gallery/`).*

2. **Run Pipeline**:
   ```bash
   npm run optimize
   ```

3. **Update Data (`frontend/src/data/gallery.ts`)**:
   Add or update the item entry:
   ```ts
   {
     id: '11',
     title: 'Packaging & automated boxing',
     image: '/assets/gallery/gallery-11.webp',
     srcSet: '/assets/gallery/gallery-11-400.webp 400w, /assets/gallery/gallery-11.webp 800w',
     alt: 'Descriptive text describing the photo contents',
     width: 800,
     height: 500,
   }
   ```

4. **Build & Verify**:
   ```bash
   npm run build
   ```

---

## Responsive Image Loading Best Practices

- **Hero Image**: Eagerly loaded with `fetchPriority="high"` and `decoding="async"`. Uses `<picture>` with a 960px breakpoint variant for mobile screens.
- **Gallery Grid**: Lazy loaded with `loading="lazy"` and `decoding="async"`. Employs `srcSet` and `sizes="(max-width: 760px) 50vw, (max-width: 1200px) 33vw, 410px"`.
- **Enlargement Modal**: Opens the high-resolution master WebP (`selected.image`) inside an accessible dialog with `object-fit: contain; max-height: 65dvh;` to prevent stretching.
- **Zero Layout Shift (CLS)**: Gallery items and modal reserve layout dimensions via explicit CSS `aspect-ratio` and HTML dimensions.
