import type { ReactNode } from 'react';

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow${light ? ' eyebrow--light' : ''}`}><span aria-hidden="true" />{children}</p>;
}

export default function SectionHeading({ eyebrow, title, description, className = '' }: { eyebrow: string; title: ReactNode; description?: ReactNode; className?: string }) {
  return <div className={`section-heading ${className}`}><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div>{description && <div className="section-heading__description">{description}</div>}</div>;
}
