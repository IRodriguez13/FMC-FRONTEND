import { Heart, MapPin, Star, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CafeteriaCard({ cafe }) {
  const { user, toggleFavorite, isFavorite } = useAuth();
  const fav = isFavorite(cafe.id);

  return (
    <div className="card group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={cafe.coverImage}
          alt={cafe.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {user && (
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(cafe.id); }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              fav ? 'bg-red-500 text-white' : 'bg-white/80 text-coffee-600 hover:bg-white'
            }`}
          >
            <Heart size={16} className={fav ? 'fill-white' : ''} />
          </button>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-coffee-700 text-xs font-semibold px-2 py-1 rounded-full">
          <MapPin size={11} />
          {cafe.distance < 1000 ? `${cafe.distance}m` : `${(cafe.distance / 1000).toFixed(1)}km`}
        </div>
        {cafe.discountPercent != null && (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{cafe.discountPercent}%
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-lg font-semibold text-coffee-800 leading-tight">{cafe.name}</h3>
          {cafe.rating != null && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-body font-bold text-coffee-700 text-sm">{cafe.rating}</span>
            </div>
          )}
        </div>
        <p className="text-coffee-500 text-xs font-body mb-2 flex items-center gap-1">
          <MapPin size={11} /> {cafe.neighborhood}
        </p>
        <p className="text-coffee-600 text-sm font-body line-clamp-2 mb-3 leading-relaxed">
          {cafe.bio.split('\n')[0]}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {cafe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-cream-100 text-coffee-600 text-xs px-2 py-0.5 rounded-full font-body font-medium border border-sand-200 flex items-center gap-1">
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
