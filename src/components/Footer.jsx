import Logo from './Logo';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-coffee-900 dark:bg-coffee-950 text-cream-200 py-10 border-t border-coffee-700 dark:border-coffee-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-2">
        <Logo size={52} className="mx-auto block opacity-90" />
        <p className="font-display text-xl font-semibold text-cream-50">Find My Coffee</p>
        <p className="font-body text-sm text-cream-200 flex flex-wrap justify-center gap-x-3 gap-y-1">
          <Link to="/demo" className="hover:text-cream-50 underline underline-offset-2">Ayuda</Link>
          <span className="text-coffee-500">·</span>
          <Link to="/terms" className="hover:text-cream-50 underline underline-offset-2">Términos</Link>
          <span className="text-coffee-500">·</span>
          <span className="text-cream-300">© 2026 · Buenos Aires</span>
        </p>
        <div className="mt-4 pt-4 border-t border-coffee-800/80 flex items-center justify-center gap-2 opacity-80">
          <img
            src="/img/manket.png"
            alt=""
            aria-hidden="true"
            className="h-5 w-5 object-contain shrink-0"
          />
          <p className="font-body text-[10px] sm:text-xs text-coffee-400 tracking-wide">
            Powered by Manke Tech<sup className="text-[8px] align-super">™</sup>
          </p>
        </div>
      </div>
    </footer>
  );
}
