import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Globe2, MapPin, Pause, Play } from 'lucide-react';
import { Eyebrow } from '../components/SectionHeading';
import { getRoutePath, markets, origin, project } from '../data/markets';
import { worldPath } from '../data/worldPath';

export default function GlobalPresence({ onInquiry }: { onInquiry: () => void }) {
  const [active, setActive] = useState('uk');
  const [hovered, setHovered] = useState<string | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [inView, setInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [motionPaused, setMotionPaused] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const selected = markets.find(market => market.id === active)!;
  const start = useMemo(() => project(origin.lon, origin.lat), []);

  const routes = useMemo(() => {
    return markets.map((market, index) => {
      const endpoint = project(market.lon, market.lat);
      const d = getRoutePath(start, endpoint, market.id);
      return {
        ...market,
        endpoint,
        d,
        delay: index * 170, // 150-200ms stagger
      };
    });
  }, [start]);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    // Trigger entrance animation when ~30% of map enters viewport
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setHasEntered(true);
          setInView(true);
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.1) {
          setInView(false);
        }
      },
      { threshold: [0, 0.1, 0.3, 0.5] }
    );

    observer.observe(el);

    const handleVisibility = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const isPaused = motionPaused || !inView || !isPageVisible;
  const emphasizedId = hovered || active;

  return (
    <section id="global" className="section global" aria-labelledby="global-title">
      <div className="container">
        <div className="global__top">
          <div>
            <Eyebrow>06 / Global presence</Eyebrow>
            <h2 id="global-title">
              Rooted in India.<br />
              <span>Open to the world.</span>
            </h2>
          </div>
          <p>
            Different markets. Shared ambition.<br />
            Connecting nutrition brands with<br className="desktop-break" /> possibilities beyond borders.
          </p>
        </div>

        <div className="global__layout">
          <div className="global__details">
            <span className="global__small-label">
              <Globe2 size={16} />OUR INTERNATIONAL OUTLOOK
            </span>
            <div className="market-buttons" role="group" aria-label="Explore a market">
              {markets.map(market => (
                <button
                  key={market.id}
                  className={active === market.id ? 'is-active' : ''}
                  aria-pressed={active === market.id}
                  onClick={() => setActive(market.id)}
                  onMouseEnter={() => setHovered(market.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(market.id)}
                  onBlur={() => setHovered(null)}
                >
                  <span>{market.name}</span>
                  <ArrowUpRight size={17} />
                </button>
              ))}
            </div>
            <div className="market-detail" aria-live="polite">
              <span>{selected.region}</span>
              <p>{selected.description}</p>
            </div>
            <button className="text-link" onClick={onInquiry}>
              Let’s explore your market<ArrowUpRight size={17} />
            </button>
          </div>

          <div
            ref={mapRef}
            className={`world-map${hasEntered ? ' is-in-view' : ''}${isPaused ? ' is-paused' : ''}`}
          >
            <svg
              viewBox="0 0 1000 450"
              role="group"
              aria-label="World map showing Gomzi in Surat, India connected to the United Kingdom, Africa, Dubai, Sri Lanka, Bangladesh, and Asia"
            >
              {/* World Map Landmasses */}
              <path d={worldPath} fill="currentColor" stroke="var(--sage)" strokeWidth="0.7" />

              {/* Animated Outgoing Export Connection Routes (behind markers) */}
              <g className="map-routes" pointerEvents="none" aria-hidden="true">
                {routes.map(route => {
                  const isEmphasized = route.id === emphasizedId;
                  const isCurrentActive = route.id === active;
                  return (
                    <g
                      key={route.id}
                      className={`map-route-group${isEmphasized ? ' is-emphasized' : ''}${isCurrentActive ? ' is-active' : ''}`}
                    >
                      {/* Faint static base track */}
                      <path className="map-route-base" d={route.d} />
                      {/* Progressive entrance drawing line outward from Surat */}
                      <path
                        className="map-route-draw"
                        d={route.d}
                        pathLength={1}
                        style={{
                          animationDelay: `${route.delay}ms`,
                        }}
                      />
                      {/* Subtle continuous flowing dash / highlight travelling outward */}
                      <path
                        className="map-route-flow"
                        d={route.d}
                        pathLength={1}
                        style={{
                          animationDelay: `${route.delay + 1200}ms`,
                        }}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Origin Marker: Surat, India */}
              <g className="map-origin" transform={`translate(${start.x},${start.y})`}>
                <circle className="map-origin__pulse" r="11" />
                <circle r="22" className="map-origin__halo" />
                <circle r="11" />
                <text textAnchor="middle" y="4">G</text>
                <title>Gomzi · Surat, India</title>
              </g>

              {/* Destination Markers */}
              {markets.map(market => {
                const point = project(market.lon, market.lat);
                const isSelected = active === market.id;
                const isHovered = hovered === market.id;
                return (
                  <g
                    key={market.id}
                    className={`map-marker${isSelected ? ' is-active' : ''}${isHovered ? ' is-hovered' : ''}`}
                    transform={`translate(${point.x},${point.y})`}
                    aria-label={market.name}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => setActive(market.id)}
                    onMouseEnter={() => setHovered(market.id)}
                    onMouseLeave={() => setHovered(null)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActive(market.id);
                      }
                    }}
                  >
                    <title>{market.name}</title>
                    <circle className="map-marker__hit" r="23" />
                    <circle className="map-marker__halo" r="21" />
                    <path
                      className="map-marker__pin"
                      d="M0 19C-4 13-14 7-14-2a14 14 0 0 1 28 0C14 7 4 13 0 19Z"
                    />
                    <text textAnchor="middle" y="2.5">G</text>
                  </g>
                );
              })}
            </svg>

            <div className="map-selected">
              <span className="map-g" aria-hidden="true">G</span>
              <div>
                <span>EXPLORING POSSIBILITIES IN</span>
                <strong>{selected.name}</strong>
              </div>
            </div>

            <div className="map-legend">
              <button
                type="button"
                className="map-motion-toggle"
                onClick={() => setMotionPaused(prev => !prev)}
                aria-label={isPaused ? 'Play connection animations' : 'Pause connection animations'}
                aria-pressed={isPaused}
              >
                {isPaused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
                <span>{isPaused ? 'Play motion' : 'Pause motion'}</span>
              </button>
              <span className="map-legend__divider" aria-hidden="true">·</span>
              <MapPin size={14} aria-hidden="true" />
              <span>Our home: Surat, India</span>
              <span aria-hidden="true">·</span>
              <span>G = Gomzi market marker</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
