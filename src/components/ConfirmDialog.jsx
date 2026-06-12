export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 p-6 shadow-card animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="font-display text-lg font-semibold text-coffee-900 dark:text-cream-50"
        >
          {title}
        </h3>
        {message && (
          <p className="font-body text-sm text-coffee-600 dark:text-coffee-200 mt-2 leading-relaxed">
            {message}
          </p>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary flex-1 text-sm py-2.5 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-sm py-2.5 rounded-xl font-body font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
