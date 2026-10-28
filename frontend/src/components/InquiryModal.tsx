import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import Modal from './Modal';
import { Eyebrow } from './SectionHeading';
import { company } from '../data/company';
import { formats } from '../data/products';

export default function InquiryModal({ open, onClose, initialFormat }: { open: boolean; onClose: () => void; initialFormat: string }) {
  const [draft, setDraft] = useState('');
  const [subject, setSubject] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [fields, setFields] = useState({ name: '', email: '', company: '', market: '', format: initialFormat || 'Let’s explore together', message: '' });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? '').trim();
    setFields({ name: value('name'), email: value('email'), company: value('company'), market: value('market'), format: value('format'), message: value('message') });
    setSubject(`Export & private label inquiry — ${value('company') || value('name')}`);
    setDraft(`Hello Gomzi team,\n\nI would like to discuss a nutrition project.\n\nName: ${value('name')}\nWork email: ${value('email')}\nCompany: ${value('company') || 'Not specified'}\nMarket: ${value('market')}\nProduct format: ${value('format')}\n\nProject brief:\n${value('message')}\n\nI look forward to discussing the next steps.\n\n${value('name')}`);
  };
  const copyDraft = async () => {
    try { await navigator.clipboard.writeText(draft); setCopyMessage('Copied to clipboard'); }
    catch { setCopyMessage('Please select and copy the draft below.'); }
  };
  const close = () => { onClose(); setDraft(''); setCopyMessage(''); };
  return <Modal open={open} onClose={close} labelledBy="inquiry-title" className="inquiry-modal">
    <Eyebrow>Let’s build something meaningful</Eyebrow>
    <h2 id="inquiry-title">Your next chapter<br />starts here.</h2>
    {!draft ? <>
      <p className="modal-intro">Tell us a little about your ambition. We’ll help you prepare a clear brief for the Gomzi team.</p>
      <form onSubmit={submit} className="inquiry-form">
        <div className="form-row"><label>Your name <span>*</span><input name="name" defaultValue={fields.name} autoComplete="name" required maxLength={100} placeholder="Full name" /></label><label>Work email <span>*</span><input name="email" defaultValue={fields.email} autoComplete="email" type="email" required maxLength={200} placeholder="you@company.com" /></label></div>
        <div className="form-row"><label>Company<input name="company" defaultValue={fields.company} autoComplete="organization" maxLength={150} placeholder="Your company or brand" /></label><label>Target market <span>*</span><select name="market" defaultValue={fields.market} required><option value="" disabled>Select your market</option><option>United Kingdom</option><option>African markets</option><option>Dubai / UAE</option><option>Sri Lanka</option><option>Bangladesh</option><option>Asian markets</option><option>India</option><option>Other market</option></select></label></div>
        <label>Product format<select name="format" defaultValue={fields.format}><option>Let’s explore together</option>{formats.map(format => <option key={format.id}>{format.name}</option>)}</select></label>
        <label>A little about your project <span>*</span><textarea name="message" defaultValue={fields.message} required minLength={10} maxLength={3000} rows={3} placeholder="Your product idea, ingredients, quantities or timeline…" /></label>
        <p className="form-note"><Mail size={15} />This prepares an email draft. Nothing is submitted or stored on this website.</p>
        <button className="button" type="submit">Prepare my inquiry<ArrowRight size={18} /></button>
      </form>
    </> : <div className="draft-panel">
      <p className="draft-ready"><Check size={18} />Your inquiry draft is ready.</p>
      <label htmlFor="email-draft">To: {company.email}</label><textarea id="email-draft" readOnly value={draft} rows={11} />
      <div className="draft-actions"><a className="button" href={`mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`}>Open email app<ArrowUpRight size={18} /></a><button className="button button--outline" onClick={copyDraft}><Copy size={16} />Copy draft</button></div>
      <p className="form-note">Send the draft from your email app to contact Gomzi. It has not been sent yet.</p>
      <p className="copy-status" role="status">{copyMessage}</p>
      <button className="text-link" onClick={() => setDraft('')}>Edit my brief<ArrowRight size={16} /></button>
    </div>}
  </Modal>;
}
