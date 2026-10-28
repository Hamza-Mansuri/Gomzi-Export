# Delivery verification

Verified locally on 27 October 2026.

- TypeScript check and Vite production build: passed.
- Node API tests: six passing test results, no failures. Covers health, headers, nine-format catalogue, explicit unconfigured-inquiry response, malformed requests, 404 and allowed/blocked CORS origins.
- Desktop browser review: hero, product cards, detail dialog, format-prefilled inquiry draft, gallery expansion to all fifteen slots and interactive map reviewed.
- Filter check: Liquid formats shows exactly Syrups and Drops.
- Dialog check: native modal opens, focuses the close control and closes with Escape; page scrolling is restored.
- Gallery check: expands from six to fifteen empty slots and collapses back.
- Map check: six selectable requested market markers and one Surat origin, all using G; selecting Bangladesh updates the selected market.
- Responsive layout checks use same-origin browser iframes, rather than device emulation. They check actual CSS layout at the widths below. Inner content widths exclude the browser's 15-pixel scrollbar.

| Frame width | Inner content width | Document scroll width | Hero buttons overlap |
| --- | --- | --- | --- |
| 320 | 305 | 305 | No |
| 390 | 375 | 375 | No |
| 768 | 753 | 753 | No |
| 1024 | 1009 | 1009 | No |
| 1440 | 1425 | 1425 | No |

All widths showed all nine format cards and eleven reference marks in the document. This does not replace physical iOS/Android device testing.

All bundled WebP assets were decoded for integrity; static image references and the eleven extracted reference marks were checked. The PNG hero is 1536 × 1024 pixels. Stock photography is representative, and the company gallery is intentionally empty.

The frontend is ready for local UI review and production compilation. Backend lead persistence and delivery are not implemented or claimed to be active. Certification references and final company content require approval before a public release.
