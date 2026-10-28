import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import Modal from '../components/Modal';
import { gallery } from '../data/gallery';

export default function Gallery() {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<(typeof gallery)[number] | null>(null);
  const visible = expanded ? gallery : gallery.slice(0, 6);

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeading
          eyebrow="02 / Company gallery"
          title={<span id="gallery-title">Behind the label.<br />Inside our world.</span>}
          description={<p>A closer look at the people, spaces and processes<br className="desktop-break" /> behind your next product.</p>}
        />
        <div className="gallery__grid" id="gallery-grid">
          {visible.map(item => (
            <div className="gallery__item" key={item.id}>
              {item.image ? (
                <button
                  className="gallery__image-button"
                  onClick={() => setSelected(item)}
                  aria-label={`Enlarge ${item.title}`}
                >
                  <img
                    src={item.image}
                    srcSet={item.srcSet}
                    sizes="(max-width: 760px) 50vw, (max-width: 1200px) 33vw, 410px"
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    width={item.width || 800}
                    height={item.height || 500}
                  />
                  <ArrowUpRight size={20} />
                </button>
              ) : (
                <div className="gallery__empty" aria-label={`${item.title}: photo space reserved`}>
                  <span className="gallery__index">{item.id}</span>
                  <span className="gallery__empty-word" aria-hidden="true">GOMZI</span>
                  <span className="gallery__corner" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="gallery__footer">
          <span>{expanded ? '15' : '06'} / 15 perspectives</span>
          <button
            className="text-link"
            aria-expanded={expanded}
            aria-controls="gallery-grid"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show fewer spaces' : 'Explore all 15 spaces'}
            {expanded ? <ArrowUp size={17} /> : <ArrowDown size={17} />}
          </button>
        </div>
        <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="gallery-image-title" className="gallery-modal">
          {selected && (
            <>
              <h2 id="gallery-image-title">{selected.title}</h2>
              <img
                src={selected.image}
                alt={selected.alt}
                decoding="async"
                width={selected.width}
                height={selected.height}
              />
            </>
          )}
        </Modal>
      </div>
    </section>
  );
}
