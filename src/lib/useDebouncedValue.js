import { useEffect, useState } from 'react';

/** Retrasa actualizaciones frecuentes (p. ej. búsqueda) para evitar filtrados en cada tecla. */
export function useDebouncedValue(value, delayMs = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
