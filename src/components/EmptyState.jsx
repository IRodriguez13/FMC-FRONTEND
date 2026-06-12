import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  children,
}) {
  return (
    <div className="text-center py-16 px-4">
      {emoji && <div className="text-5xl mb-4">{emoji}</div>}
      {Icon && !emoji && (
        <Icon size={40} className="mx-auto text-coffee-400 dark:text-coffee-500 mb-4" />
      )}
      <h3 className="font-display text-2xl font-semibold text-coffee-800 dark:text-cream-50 mb-2">{title}</h3>
      {description && (
        <p className="font-body text-coffee-600 dark:text-cream-200 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {children}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary inline-flex">{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" onClick={onAction} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  );
}
