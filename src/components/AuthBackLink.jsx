import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthBackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-coffee-700 hover:text-coffee-900 dark:text-cream-200 dark:hover:text-cream-50 font-body text-sm font-semibold mb-6 transition-colors"
    >
      <ArrowLeft size={18} />
      Volver al inicio
    </Link>
  );
}
