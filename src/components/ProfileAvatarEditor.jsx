import { useEffect, useRef, useState } from 'react';
import { User, Store, Camera, Trash2, Pencil } from 'lucide-react';
import { resolveMediaUrl } from '../lib/mediaUrl';

const avatarMenuItemClass =
  'w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-body text-sm text-coffee-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-coffee-700 transition-colors';

export default function ProfileAvatarEditor({
  name,
  avatarUrl,
  disabled,
  onFileSelect,
  onRemove,
  fallback = 'user',
  sizeClass = 'w-16 h-16',
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);
  const fileInputRef = useRef(null);
  const FallbackIcon = fallback === 'store' ? Store : User;

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0 pr-1 pb-1">
      {avatarUrl ? (
        <img
          src={resolveMediaUrl(avatarUrl)}
          alt={name}
          className={`${sizeClass} rounded-2xl object-cover border border-sand-200 dark:border-coffee-600`}
        />
      ) : (
        <div className={`${sizeClass} bg-coffee-600 dark:bg-coffee-700 rounded-2xl flex items-center justify-center`}>
          <FallbackIcon size={28} className="text-cream-100" />
        </div>
      )}

      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
        disabled={disabled}
        className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-cream-200 dark:bg-coffee-600 border border-sand-300 dark:border-coffee-500 rounded-full flex items-center justify-center hover:bg-cream-100 dark:hover:bg-coffee-500 transition-colors disabled:opacity-50 shadow-sm z-10"
        aria-label="Editar foto de perfil"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <Pencil size={12} className="text-coffee-600 dark:text-coffee-200" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 sm:left-full sm:top-0 sm:mt-0 sm:ml-2 z-50 min-w-[11.5rem] rounded-xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 shadow-coffee-lg py-1 animate-slide-down"
        >
          <button
            type="button"
            role="menuitem"
            className={avatarMenuItemClass}
            onClick={() => {
              setMenuOpen(false);
              fileInputRef.current?.click();
            }}
          >
            <Camera size={15} className="text-coffee-400 dark:text-coffee-300 shrink-0" />
            {avatarUrl ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              role="menuitem"
              className={`${avatarMenuItemClass} text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30`}
              onClick={() => {
                setMenuOpen(false);
                onRemove();
              }}
            >
              <Trash2 size={15} className="shrink-0" />
              Quitar foto
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={onFileSelect}
      />
    </div>
  );
}
