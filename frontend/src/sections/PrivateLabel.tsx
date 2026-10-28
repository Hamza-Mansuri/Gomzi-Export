import { ArrowUpRight, Box, ChartNoAxesCombined, ClipboardCheck, FlaskConical, Handshake, Leaf } from 'lucide-react';
import { Eyebrow } from '../components/SectionHeading';
import { services } from '../data/company';

const icons = [FlaskConical, Box, ClipboardCheck, Handshake, ChartNoAxesCombined, Leaf];
export default function PrivateLabel({ onInquiry }: { onInquiry: () => void }) {
  return <section id="private-label" className="private-label" aria-labelledby="private-label-title"><div className="container private-label__layout"><div className="private-label__copy"><Eyebrow light>Your brand. Thoughtfully built.</Eyebrow><h2 id="private-label-title">Your idea.<br />Your label.<br /><span>Our expertise.</span></h2><p>More than a finished product. A considered journey from your first idea to something you can call your own.</p><button className="text-link text-link--light" onClick={onInquiry}>Let’s bring your brand to life<ArrowUpRight size={18} /></button></div><div className="service-grid">{services.map((service, index) => { const Icon = icons[index]; return <article className="service" key={service.title}><Icon size={25} strokeWidth={1.3} /><h3>{service.title}</h3><p>{service.description}</p></article>; })}</div></div></section>;
}
