import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, labelledBy, children, className = '' }: { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    el.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const cancel = (event: Event) => { event.preventDefault(); closeRef.current(); };
    el.addEventListener('cancel', cancel);
    return () => {
      el.removeEventListener('cancel', cancel);
      el.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, [open]);
  return <dialog ref={ref} aria-labelledby={labelledBy} className={`modal ${className}`} onClick={event => {
    if (event.target !== ref.current) return;
    const box = ref.current.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
  }}>
    <button className="icon-button modal__close" onClick={onClose} aria-label="Close dialog"><X size={22} /></button>
    {open && children}
  </dialog>;
}
