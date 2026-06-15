import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

const STORAGE_KEY = 'fmc-theme';

const ThemeContext = createContext(null);

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setThemeOrigin(x, y) {
  const root = document.documentElement;
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.style.setProperty('--theme-switch-x', `${x}px`);
  root.style.setProperty('--theme-switch-y', `${y}px`);
  root.style.setProperty('--theme-switch-r', `${r}px`);
}

function clearThemeOrigin() {
  const root = document.documentElement;
  root.style.removeProperty('--theme-switch-x');
  root.style.removeProperty('--theme-switch-y');
  root.style.removeProperty('--theme-switch-r');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_KEY) || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1e1408' : '#5a3c18');
  }, [theme]);

  const applyTheme = useCallback((next) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback((origin) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const reduced = prefersReducedMotion();

    if (reduced) {
      applyTheme(next);
      return;
    }

    const hasOrigin = origin && typeof origin.x === 'number' && typeof origin.y === 'number';

    if (typeof document.startViewTransition === 'function') {
      if (hasOrigin) setThemeOrigin(origin.x, origin.y);

      const transition = document.startViewTransition(() => {
        flushSync(() => applyTheme(next));
      });

      transition.finished.finally(clearThemeOrigin);
      return;
    }

    document.documentElement.classList.add('theme-transition');
    applyTheme(next);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 380);
  }, [theme, applyTheme]);

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
