import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Globe2, Menu, X } from 'lucide-react';
import { company, navigation } from '../data/company';

export default function Header({ onInquiry }: { onInquiry: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`); });
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    navigation.forEach(item => { const section = document.querySelector(item.href); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    const media = matchMedia('(min-width: 1050px)');
    const resize = () => { if (media.matches) setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    media.addEventListener('change', resize);
    return () => { document.removeEventListener('keydown', handler); media.removeEventListener('change', resize); };
  }, [menuOpen]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="announcement"><div className="container announcement__inner"><span>YOUR NUTRITION. YOUR BRAND. OUR EXPERTISE.</span><span className="announcement__right"><Globe2 size={13} />Rooted in India. Open to the world.</span></div></div>
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#home" aria-label={`${company.name} home`} onClick={() => setMenuOpen(false)}><img src="/assets/images/logo.webp" width="168" height="63" alt="Gomzi Life Science LLP" decoding="async" /></a>
        <nav id="main-navigation" aria-label="Main navigation" className={`main-nav${menuOpen ? ' is-open' : ''}`}>
          {navigation.map(item => <a key={item.href} href={item.href} aria-current={activeSection === item.href ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <button className="button nav-mobile-inquiry" onClick={() => { setMenuOpen(false); onInquiry(); }}>Let’s partner<ArrowUpRight size={17} /></button>
        </nav>
        <button className="button header-cta" onClick={onInquiry}>Let’s partner<ArrowUpRight size={17} /></button>
        <button ref={menuButton} className="icon-button menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
    </header>
    {menuOpen && <button className="nav-scrim" tabIndex={-1} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
  </>;
}
