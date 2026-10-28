import { ArrowDown, ArrowUpRight, FlaskConical, Globe2, PackageCheck, Sprout } from 'lucide-react';
import { Eyebrow } from '../components/SectionHeading';

export default function Hero() {
  return <>
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero__layout">
        <div className="hero__copy">
          <Eyebrow>Nutraceuticals. Private label. Exports.</Eyebrow>
          <h1 id="hero-title">NUTRITION.<br />WITHOUT<br /><span>BORDERS.</span></h1>
          <p>From a thoughtful formulation to your own label.<br className="desktop-break" /> A manufacturing partner for your global ambition.</p>
          <div className="hero__actions"><a className="button" href="#capabilities">Explore our capabilities<ArrowUpRight size={18} /></a><a className="text-link" href="#about">Discover Gomzi<ArrowRightIcon /></a></div>
          <div className="hero__proof"><div><strong>Your formula.</strong><span>Custom development</span></div><div><strong>Your identity.</strong><span>Private labelling</span></div><div><strong>Your ambition.</strong><span>Global partnerships</span></div></div>
        </div>
        <div className="hero__visual">
          <span className="hero__visual-caption">A WORLD OF POSSIBILITIES. UNDER YOUR LABEL.</span>
          <picture><source media="(max-width: 800px)" srcSet="/assets/images/hero-banner-960.webp" /><img className="hero__image" src="/assets/images/hero-banner.webp" width="1536" height="1024" fetchPriority="high" decoding="async" alt="Premium private label protein, gummy, capsule, granule and dropper packaging concepts in soft green and white" /></picture>
          <div className="hero__origin"><span className="hero__origin-icon"><Globe2 size={25} strokeWidth={1.3} /></span><div><span>ROOTED IN INDIA</span><strong>Made for your world.</strong></div><ArrowUpRight size={19} /></div>
          <span className="hero__image-note">Private label packaging concept</span>
        </div>
      </div>
      <div className="container hero__bottom"><span>SCIENCE WITH PURPOSE. PARTNERSHIP WITH POSSIBILITY.</span><a href="#about" aria-label="Scroll to About Gomzi"><ArrowDown size={17} /></a></div>
    </section>
    <div className="capability-strip"><div className="container capability-strip__inner"><span><FlaskConical />Formulation & development</span><span><PackageCheck />Customised private labelling</span><span><Sprout />Nutrition, thoughtfully made</span><span><Globe2 />An international outlook</span></div></div>
  </>;
}
function ArrowRightIcon() { return <ArrowUpRight size={17} />; }
