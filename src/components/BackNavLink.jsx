import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Vuelve a returnTo (state), historial anterior o fallback.
 */
export default function BackNavLink({
  fallback = '/explore',
  label = 'Volver',
  className = 'inline-flex items-center gap-2 text-cream-200 hover:text-cream-50 font-body text-sm mb-4 transition-colors',
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    const returnTo = location.state?.returnTo;
    if (returnTo && returnTo !== location.pathname) {
      navigate(returnTo);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

/** Para pasar en Link state={{ returnTo: location.pathname }} */
export function withReturnTo(pathname) {
  return { returnTo: pathname };
}
