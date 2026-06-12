import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, { type = 'info', duration = 4500 } = {}) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const value = useMemo(
    () => ({
      toast: push,
      success: (msg, opts) => push(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => push(msg, { ...opts, type: 'error' }),
      info: (msg, opts) => push(msg, { ...opts, type: 'info' }),
    }),
    [push]
  );

  const iconFor = (type) => {
    if (type === 'success') return CheckCircle2;
    if (type === 'error') return AlertCircle;
    return Info;
  };

  const stylesFor = (type) => {
    if (type === 'success') return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
    if (type === 'error') return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200';
    return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100';
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(({ id, message, type }) => {
          const Icon = iconFor(type);
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg font-body text-sm animate-slide-up ${stylesFor(type)}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <p className="flex-1">{message}</p>
              <button type="button" onClick={() => dismiss(id)} className="opacity-60 hover:opacity-100 shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
