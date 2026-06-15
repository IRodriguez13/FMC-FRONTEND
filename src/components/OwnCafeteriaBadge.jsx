import { Store } from 'lucide-react';

export default function OwnCafeteriaBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-coffee-600 dark:bg-coffee-500 text-cream-50 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 shrink-0 ${className}`}
    >
      <Store size={10} className="opacity-90" />
      Tu local
    </span>
  );
}
