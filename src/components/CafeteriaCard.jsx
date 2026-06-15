import { Heart, MapPin, Star, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CafeCoverImage from './CafeCoverImage';
import OwnCafeteriaBadge from './OwnCafeteriaBadge';
import { isOwnEnterpriseCafeteria } from '../lib/ownCafeteria';

export default function CafeteriaCard({ cafe }) {
  const { user, toggleFavorite, isFavorite } = useAuth();
  const showDiscount = user?.premium && cafe.discountPercent != null;
  const isEnterprisePremium = cafe.subscriptionTier === 'Premium';
  const isOwn = isOwnEnterpriseCafeteria(user, cafe.id);
  const fav = isFavorite(cafe.id);

  return (
    <div className={`card group overflow-hidden dark:bg-coffee-800 dark:border-coffee-700 dark:hover:border-coffee-600 ${
      isOwn ? 'ring-2 ring-coffee-500/50 dark:ring-coffee-400/40' : isEnterprisePremium ? 'ring-1 ring-amber-400/40 dark:ring-amber-500/30' : ''
    }`}>
      <div className="relative h-48 overflow-hidden">
        <CafeCoverImage
          src={cafe.coverImage}
          alt={cafe.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent dark:from-black/60" />
        {user && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(cafe.id); }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              fav
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-coffee-600 hover:bg-cream-100 dark:bg-coffee-900/80 dark:text-cream-100 dark:hover:bg-coffee-800'
            }`}
          >
            <Heart size={16} className={fav ? 'fill-white' : ''} />
          </button>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-coffee-900/90 backdrop-blur-sm text-coffee-700 dark:text-cream-100 text-xs font-semibold px-2 py-1 rounded-full">
          <MapPin size={11} />
          {cafe.distance < 1000 ? `${cafe.distance}m` : `${(cafe.distance / 1000).toFixed(1)}km`}
        </div>
        {isOwn && (
          <div className="absolute top-3 left-3">
            <OwnCafeteriaBadge />
          </div>
        )}
        {isEnterprisePremium && !isOwn && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={11} className="fill-white" />
            Enterprise Premium
          </div>
        )}
        {showDiscount && !isEnterprisePremium && (
          <div
            className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            title="Descuento exclusivo plan consumidor Premium"
          >
            -{cafe.discountPercent}%
          </div>
        )}
        {showDiscount && isEnterprisePremium && !isOwn && (
          <div
            className="absolute top-12 left-3 bg-coffee-700/90 text-cream-50 text-xs font-bold px-2 py-1 rounded-full"
            title="Descuento exclusivo plan consumidor Premium"
          >
            -{cafe.discountPercent}%
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <h3 className="font-display text-lg font-semibold text-coffee-800 dark:text-cream-100 leading-tight">{cafe.name}</h3>
            {isOwn && <OwnCafeteriaBadge />}
          </div>
          {cafe.rating != null && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-body font-bold text-coffee-700 dark:text-cream-200 text-sm">{cafe.rating}</span>
            </div>
          )}
        </div>
        <p className="text-coffee-500 dark:text-coffee-300 text-xs font-body mb-2 flex items-center gap-1">
          <MapPin size={11} /> {cafe.neighborhood}
        </p>
        <p className="text-coffee-600 dark:text-coffee-200 text-sm font-body line-clamp-2 mb-3 leading-relaxed">
          {cafe.bio.split('\n')[0]}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {cafe.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-cream-100 dark:bg-coffee-700 text-coffee-600 dark:text-cream-200 text-xs px-2 py-0.5 rounded-full font-body font-medium border border-sand-200 dark:border-coffee-600 flex items-center gap-1"
            >
              <Tag size={10} className="opacity-60" />
              {tag}
            </span>
          ))}
        </div>
        <Link
          to={`/cafe/${cafe.id}`}
          className="block w-full text-center btn-primary text-sm py-2.5"
        >
          Ver perfil
        </Link>
      </div>
    </div>
  );
}
