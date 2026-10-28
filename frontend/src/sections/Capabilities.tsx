import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import SectionHeading, { Eyebrow } from '../components/SectionHeading';
import Modal from '../components/Modal';
import { formats, formatFilters } from '../data/products';
import type { ProductFormat } from '../data/products';

export default function Capabilities({ onInquiry }: { onInquiry: (format?: string) => void }) {
  const [filter, setFilter] = useState<string>('All formats');
  const [selected, setSelected] = useState<ProductFormat | null>(null);
  const filtered = formats.filter(format => filter === 'All formats' || format.group === filter);
  return <section id="capabilities" className="section capabilities" aria-labelledby="capabilities-title"><div className="container">
    <SectionHeading eyebrow="03 / Capacities & facilities" title={<span id="capabilities-title">One partner.<br />A world of possibilities.</span>} description={<p>The right format makes all the difference.<br />Explore possibilities for your next nutrition product.</p>} />
    <div className="format-filters" role="group" aria-label="Filter product formats">{formatFilters.map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)} className={filter === item ? 'is-active' : ''}>{item}{filter === item && <span>{item === 'All formats' ? '09' : String(formats.filter(f => f.group === item).length).padStart(2, '0')}</span>}</button>)}</div>
    <div className="format-grid" aria-live="polite">{filtered.map(format => <button className="format-card" key={format.id} onClick={() => setSelected(format)} aria-label={`Explore ${format.name}`}><div className={`format-card__image format-card__image--${format.id}`}><img src={format.image} alt={format.alt} width="800" height="600" loading="lazy" decoding="async" style={{ objectPosition: format.position }} /><span className="format-card__number">{format.id}</span><span className="format-card__explore"><ArrowUpRight size={20} /></span></div><div className="format-card__copy"><h3>{format.name}</h3><p>{format.subtitle}</p></div></button>)}</div>
    <p className="imagery-note">Representative format photography. Final formulations and specifications are agreed for each project.</p>
    <Modal open={!!selected} onClose={() => setSelected(null)} labelledBy="format-title" className="format-modal">{selected && <><img className="format-modal__image" src={selected.image} alt={selected.alt} decoding="async" /><div className="format-modal__copy"><Eyebrow>Explore the possibilities</Eyebrow><h2 id="format-title">{selected.name}</h2><p>{selected.description}</p><h3>Ideas for your brief</h3><ul>{selected.examples.map(example => <li key={example}><Check size={16} />{example}</li>)}</ul><button className="button" onClick={() => { const name = selected.name; setSelected(null); onInquiry(name); }}>Discuss this format<ArrowUpRight size={18} /></button></div></>}</Modal>
  </div></section>;
}
