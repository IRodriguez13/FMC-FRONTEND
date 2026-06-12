import { useEffect, useState } from 'react';
import { FALLBACK_COVER } from '../lib/mediaUrl';

export default function CafeCoverImage({ src, alt = '', className = '' }) {
  const [current, setCurrent] = useState(src || FALLBACK_COVER);

  useEffect(() => {
    setCurrent(src || FALLBACK_COVER);
  }, [src]);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (current !== FALLBACK_COVER) setCurrent(FALLBACK_COVER);
      }}
    />
  );
}
