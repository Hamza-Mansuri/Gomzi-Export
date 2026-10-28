# Company Gallery Assets

Slots 01 through 10 have been converted to genuine WebP (`gallery-01.webp` through `gallery-10.webp`) with responsive 400w thumbnail variants (`gallery-XX-400.webp`) for high-performance mobile loading.

Master original photos are safely preserved in `assets-source/gallery/` outside the public build directory to prevent lossy degradation on future runs.

## Adding future gallery photos (Slots 11–15)

1. Place your raw photo (JPEG, PNG, or WebP) into `assets-source/gallery/` named `gallery-11.jpg`, `gallery-12.jpg`, etc. (or drop them into `frontend/public/assets/gallery/`).
2. Run the optimization pipeline from the project root:
   ```bash
   npm run optimize
   ```
   The script will:
   - Perform genuine WebP encoding with auto-orientation and quality 85.
   - Generate responsive thumbnail variants (e.g. `gallery-11-400.webp`).
   - Preserve existing already-optimised WebP files without generational degradation.
   - Output files to `frontend/public/assets/gallery/`.
3. Open `frontend/src/data/gallery.ts` and set:
   ```ts
   {
     id: '11',
     title: 'Packaging area',
     image: '/assets/gallery/gallery-11.webp',
     srcSet: '/assets/gallery/gallery-11-400.webp 400w, /assets/gallery/gallery-11.webp 800w',
     alt: 'Descriptive alt text of actual photo contents',
     width: 800,
     height: 500,
   }
   ```
4. Rebuild and verify:
   ```bash
   npm run build
   ```
