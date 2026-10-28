export const markets = [
  { id: 'uk', name: 'United Kingdom', shortName: 'UK', region: 'Europe', lon: -0.12, lat: 51.5, description: 'Partnership conversations for the United Kingdom market.' },
  { id: 'africa', name: 'African markets', shortName: 'Africa', region: 'Africa', lon: 8.68, lat: 9.08, description: 'Connecting with nutrition brands across African markets. The marker is a regional reference.' },
  { id: 'dubai', name: 'Dubai, UAE', shortName: 'Dubai', region: 'Middle East', lon: 55.27, lat: 25.2, description: 'A point of connection for the UAE and wider Middle East.' },
  { id: 'sri-lanka', name: 'Sri Lanka', shortName: 'Sri Lanka', region: 'South Asia', lon: 80.77, lat: 7.87, description: 'Exploring nutrition partnerships with Sri Lankan brands.' },
  { id: 'bangladesh', name: 'Bangladesh', shortName: 'Bangladesh', region: 'South Asia', lon: 90.36, lat: 23.68, description: 'Building conversations with brands in Bangladesh.' },
  { id: 'asia', name: 'Asian markets', shortName: 'Asia', region: 'Asia', lon: 108.28, lat: 14.06, description: 'A broader outlook across Asia. The marker is a regional reference.' },
];

export const origin = { lon: 72.83, lat: 21.17, name: 'Surat, India' };

export function project(lon: number, lat: number) {
  return { x: (lon + 180) / 360 * 1000, y: (85 - lat) / 145 * 450 };
}

/**
 * Generate a smooth curved Bézier SVG path from origin to destination,
 * scaling curve height to distance for natural flight-path aesthetics.
 */
export function getRoutePath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  id: string
): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;

  let cx = mx;
  let cy = my - Math.max(16, Math.min(75, dist * 0.35));

  if (id === 'sri-lanka') {
    // Graceful curve into Arabian Sea along India's peninsular coast to Sri Lanka
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
