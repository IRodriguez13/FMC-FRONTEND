import BackNavLink from './BackNavLink';

export default function AuthBackLink() {
  return (
    <BackNavLink
      fallback="/"
      label="Volver al inicio"
      className="inline-flex items-center gap-2 text-coffee-700 hover:text-coffee-900 dark:text-cream-200 dark:hover:text-cream-50 font-body text-sm font-semibold mb-6 transition-colors"
    />
  );
}
