import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InquiryModal from './components/InquiryModal';
import Hero from './sections/Hero';
import About from './sections/About';
import Principles from './sections/Principles';
import Gallery from './sections/Gallery';
import Capabilities from './sections/Capabilities';
import PrivateLabel from './sections/PrivateLabel';
import Quality from './sections/Quality';
import Certifications from './sections/Certifications';
import GlobalPresence from './sections/GlobalPresence';
import Contact from './sections/Contact';

export default function App() {
  const [inquiry, setInquiry] = useState<{ open: boolean; format: string }>({ open: false, format: '' });
  const openInquiry = (format = '') => setInquiry({ open: true, format });
  return <>
    <Header onInquiry={() => openInquiry()} />
    <main id="main">
      <Hero /><About /><Principles /><Gallery />
      <Capabilities onInquiry={openInquiry} />
      <PrivateLabel onInquiry={() => openInquiry()} />
      <Quality /><Certifications />
      <GlobalPresence onInquiry={() => openInquiry()} />
      <Contact onInquiry={() => openInquiry()} />
    </main>
    <Footer onInquiry={() => openInquiry()} />
    <InquiryModal key={`${inquiry.open}-${inquiry.format}`} open={inquiry.open} initialFormat={inquiry.format} onClose={() => setInquiry({ open: false, format: '' })} />
  </>;
}
