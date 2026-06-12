import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(null);

  const displayRating = interactive && hover != null ? hover : rating;

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => interactive && setHover(null)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Puntuación' : undefined}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(displayRating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            aria-label={interactive ? `${i + 1} estrellas` : undefined}
            aria-checked={interactive ? rating === i + 1 : undefined}
            className={`p-0 border-0 bg-transparent leading-none transition-colors ${
              filled
                ? 'text-amber-400 fill-amber-400'
                : 'text-sand-300 dark:text-coffee-600 fill-transparent'
            } ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onClick={() => interactive && onChange?.(i + 1)}
          >
            <Star size={size} className={filled ? 'fill-current' : ''} />
          </button>
        );
      })}
    </div>
  );
}
