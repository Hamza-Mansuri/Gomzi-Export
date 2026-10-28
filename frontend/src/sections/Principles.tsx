import { Eye, Handshake, Target } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { principles } from '../data/company';

const icons = { target: Target, eye: Eye, handshake: Handshake };
export default function Principles() {
  return <section className="section principles" aria-label="Our mission, vision and values"><div className="container"><SectionHeading eyebrow="What moves us forward" title={<>A shared purpose.<br />A stronger partnership.</>} description={<p>Our principles shape how we think, how we work<br className="desktop-break" /> and what we build together.</p>} /><div className="principles__grid">{principles.map(item => { const Icon = icons[item.icon as keyof typeof icons]; return <article className="principle" key={item.name}><div className="principle__top"><Icon size={28} strokeWidth={1.3} /><span>{item.number}</span></div><p className="principle__label">{item.name}</p><h3>{item.title}</h3><p>{item.description}</p></article>; })}</div></div></section>;
}
