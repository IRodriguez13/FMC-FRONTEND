import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`transition-colors ${
            i < Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-sand-300 dark:text-coffee-600 fill-transparent'
          } ${interactive ? 'cursor-pointer hover:text-amber-300' : ''}`}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
}
