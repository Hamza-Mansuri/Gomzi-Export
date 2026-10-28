import { ArrowUpRight, FileCheck2 } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { certifications } from '../data/certifications';

export default function Certifications() {
  return (
    <section id="certifications" className="section certifications" aria-labelledby="certifications-title">
      <div className="container">
        <SectionHeading
          eyebrow="05 / Product certification"
          title={<span id="certifications-title">Quality deserves<br />clear documentation.</span>}
          description={
            <>
              <p>A considered partnership starts with the details.<br />Explore the certification artwork in the supplied profile.</p>
              <a className="text-link" href="/assets/certifications/supplied-profile-certifications.pdf" target="_blank" rel="noopener noreferrer">
                View supplied references<ArrowUpRight size={17} />
              </a>
            </>
          }
        />
        <p className="certifications__label">
          <FileCheck2 size={15} />SUPPLIED COMPANY PROFILE · CERTIFICATION & MEMBERSHIP REFERENCES
        </p>
        <div className="certification-grid">
          {certifications.map(cert => (
            <figure className="certification" key={cert.id}>
              <div>
                <img
                  src={`/assets/certifications/${cert.id}.webp`}
                  width="150"
                  height="110"
                  alt={`${cert.name} artwork from the supplied WellsPro profile`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <strong>{cert.name}</strong>
                <span>{cert.descriptor}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="certifications__note">
          Artwork reproduced from the supplied WellsPro company profile. These references do not establish Gomzi certification or product approval. Gomzi-specific documents, entity, scope and validity must be verified before publication.
        </p>
      </div>
    </section>
  );
}
