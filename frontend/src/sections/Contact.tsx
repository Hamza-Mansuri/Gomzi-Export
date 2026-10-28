import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { company } from '../data/company';

interface ContactProps {
  onInquiry?: () => void;
}

export default function Contact({ onInquiry }: ContactProps) {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-section-title">
      <div className="container">
        <SectionHeading
          eyebrow="07 / Contact & location"
          title={<span id="contact-section-title">Get in Touch</span>}
          description={
            <p>
              We’d love to hear from you. Reach out to us for any queries, support, or just to say hello!
            </p>
          }
        />

        <div className="contact-card">
          {/* Company Details Column */}
          <div className="contact-card__info">
            <h3 className="contact-card__company">{company.name}</h3>

            <div className="contact-items">
              {/* Phone */}
              <a href={`tel:${company.phoneHref}`} className="contact-item">
                <div className="contact-item__icon contact-item__icon--phone">
                  <Phone size={22} />
                </div>
                <div className="contact-item__body">
                  <span className="contact-item__label">Contact Number</span>
                  <span className="contact-item__value">{company.phone}</span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${company.phoneHref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item contact-item--whatsapp"
              >
                <div className="contact-item__icon contact-item__icon--whatsapp">
                  <MessageCircle size={22} />
                </div>
                <div className="contact-item__body">
                  <span className="contact-item__label">WhatsApp</span>
                  <span className="contact-item__value">Chat with us on WhatsApp</span>
                </div>
              </a>

              {/* Email */}
              <a href={`mailto:${company.email}`} className="contact-item">
                <div className="contact-item__icon contact-item__icon--email">
                  <Mail size={22} />
                </div>
                <div className="contact-item__body">
                  <span className="contact-item__label">Email Address</span>
                  <span className="contact-item__value">{company.email}</span>
                </div>
              </a>

              {/* Address */}
              <a
                href="https://maps.google.com/maps?q=21.189452,72.73386"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item"
              >
                <div className="contact-item__icon contact-item__icon--address">
                  <MapPin size={22} />
                </div>
                <div className="contact-item__body">
                  <span className="contact-item__label">Address</span>
                  <address className="contact-item__address">
                    443, 444, 445, 1st Floor, RJD Textile Park,<br />
                    At.Ichchhapor, Hazira Road,<br />
                    Surat, Gujarat 394510
                  </address>
                </div>
              </a>
            </div>

            {onInquiry && (
              <div className="contact-card__action">
                <button className="button" onClick={onInquiry}>
                  Submit an inquiry
                  <ArrowUpRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Google Map Column */}
          <div className="contact-card__map-wrap">
            <iframe
              title="Gomzi Lifesciences LLP Location Map"
              src="https://maps.google.com/maps?q=21.189452,72.73386&hl=en&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="contact-card__map"
            />
            <a
              href="https://maps.google.com/maps?q=21.189452,72.73386"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card__map-badge"
            >
              <span>View larger map</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
