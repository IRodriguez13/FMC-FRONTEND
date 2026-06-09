import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AuthBackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-800 font-body text-sm font-semibold mb-6 transition-colors"
    >
      <ArrowLeft size={18} />
      Volver al inicio
    </Link>
  );
}
