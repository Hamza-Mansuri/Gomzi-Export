# Gomzi Export — UI project

A premium, responsive nutraceutical export website for **Gomzi Life Science LLP**, prepared for local design review in Antigravity. No changes have been pushed to the reference GitHub repository and nothing has been deployed.

## Run it locally

Install **Node.js 22.12 or newer**. Open the extracted `gomzi-export` folder in Antigravity, then run these commands from that folder:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, normally **http://localhost:5173**. The complete website works without starting the backend.

Optional backend, in a second terminal:

```bash
npm run dev:backend
```

Its health endpoint is **http://127.0.0.1:4000/api/health**. Copy `backend/.env.example` to `backend/.env` if you need to change its port, host or allowed origins.

## What is included

- Self-hosted Inter, matching the typography in the supplied Flour/Coffee/Tea reference.
- White, warm neutral, forest green and Gomzi lime palette; spacious editorial layouts.
- Responsive hero, About, mission/vision/values, gallery, capacities/facilities, private label services, research/quality, certification references, global map and contact sections.
- Fifteen intentionally empty gallery slots. Six show initially; **Explore all 15 spaces** expands the grid.
- Nine format cards, including **Gummies, Granules and Drops**; working filters and detail dialogs.
- A real world map with **G** markers for UK, African markets, Dubai/UAE, Sri Lanka, Bangladesh and Asian markets, plus the Surat origin. Select a market from the map or list.
- A working inquiry **draft** flow. It prepares a brief and opens the visitor's email app; it does not claim to send or save inquiries.
- Accessible native dialogs, Escape dismissal, focus restoration, labelled form fields, keyboard map controls, mobile navigation and reduced-motion support.
- Locally bundled photographs, font, map and certification artwork. No runtime dependency on stock-image websites or Google Fonts.
- Separate React/TypeScript frontend and Express backend scaffold, lockfile, tests and Vercel static deployment configuration.

## Edit the design and content

| Change | File |
| --- | --- |
| Company details, mission, vision, values, private label services | `frontend/src/data/company.ts` |
| Product descriptions, photos, filters | `frontend/src/data/products.ts` |
| Gallery photos and captions | `frontend/src/data/gallery.ts` |
| Countries / regions and coordinates | `frontend/src/data/markets.ts` |
| Certification references | `frontend/src/data/certifications.ts` |
| Colours, font, spacing | `frontend/src/styles/tokens.css` |
| Header, footer, dialogs | `frontend/src/components/` |
| Individual homepage sections | `frontend/src/sections/` |
| Responsive rules | `frontend/src/styles/responsive.css` |

## Add and optimize company gallery photos

Slots 01 through 10 have been converted to genuine WebP (`gallery-01.webp` through `gallery-10.webp`) with responsive `400w` thumbnail variants. Uncompressed master files are preserved in `assets-source/` outside the public folder.

To process future photos (slots 11–15):
1. Place your raw photo (JPEG, PNG, or WebP) in `assets-source/gallery/` named `gallery-11.jpg`, `gallery-12.jpg`, etc. (or in `frontend/public/assets/gallery/`).
2. Run the optimization pipeline:
   ```bash
   npm run optimize
   ```
3. Update `frontend/src/data/gallery.ts` with the new image URL, responsive `srcSet`, caption, and alt text.
4. Detailed documentation is available in `docs/IMAGE-OPTIMIZATION.md`.

## Hero banner files

- `assets-source/images/hero-banner.png` — master 1536 × 1024 original artwork (preserved outside public).
- `frontend/public/assets/images/hero-banner.webp` — optimised desktop asset (eagerly loaded with `fetchPriority="high"`).
- `frontend/public/assets/images/hero-banner-960.webp` — smaller mobile asset.

The hero headline is live HTML, so it remains sharp and readable on mobile. Products are shown without cropping. This is an original AI-created packaging concept with matte surfaces and soft lighting, not a photo of an existing Gomzi product. See `docs/HERO-ARTWORK.md` for the generation briefs.

## Build and verify

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

The production frontend is written to `frontend/dist/`. It has also been included in this ZIP for convenience. Development files remain the authoritative source.

For Vercel, import the project root, keep the root directory as the repository root and select **Other** if required. The included `vercel.json` runs `npm ci`, runs `npm run build` and serves `frontend/dist`. The backend is a separate Node service and is not deployed by this static configuration.

## Scope and release notes

This delivery focuses on the UI. The frontend builds for production, but backend lead collection, a CRM, authentication, analytics and email delivery are intentionally not connected.

The supplied PDF is branded **WellsPro Intelligent Nutrition**. Its general mission/vision/value and manufacturing material was adapted into Gomzi copy without transferring its founder, establishment date, 45-country claim, 1,000-product claim or manufacturing throughput figures to Gomzi. All eleven supplied certification/membership artworks are included with an explicit reference attribution. They do **not** prove that Gomzi holds those certifications or that any product is FDA approved. Replace them with verified Gomzi-specific documents before public launch.

The map uses the markets requested in the brief. Africa and Asia are regional markers; Dubai is labelled as a city in the UAE. Markers are not office locations, delivery guarantees or claims of product authorisation in a market.

Before public launch, confirm the legal entity, contact details, facility images, supported formats, export markets and certification scope. `robots.txt` and the robots meta tag are deliberately set to **noindex** for this design-review version; update both when the final content is approved.

Sources, licences and image provenance are in `docs/SOURCES.md` and `frontend/public/assets/images/photo-sources.json`.
