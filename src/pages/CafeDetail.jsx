import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Share2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';

export default function CafeDetail() {
  const { id } = useParams();
  const { user, toggleFavorite, isFavorite } = useAuth();
  const { getCafeById, loading } = useCafeterias();
  const navigate = useNavigate();
  const cafe = getCafeById(id);

  if (loading && !cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-500">
        Cargando…
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-coffee-700 mb-4">Cafetería no encontrada</p>
          <Link to="/explore" className="btn-primary">Volver al explorador</Link>
        </div>
      </div>
    );
  }

  const fav = isFavorite(cafe.id);

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-coffee-700 hover:bg-white transition-all shadow-md"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-coffee-700 hover:bg-white transition-all shadow-md">
              <Share2 size={18} />
            </button>
            {user && (
              <button
                onClick={() => toggleFavorite(cafe.id)}
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all shadow-md ${
                  fav ? 'bg-red-500 text-white' : 'bg-white/90 text-coffee-700 hover:bg-white'
                }`}
              >
                <Heart size={18} className={fav ? 'fill-white' : ''} />
              </button>
            )}
          </div>
        </div>

        <div className="absolute -bottom-10 left-6">
          <img
            src={cafe.profileImage}
            alt={cafe.name}
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-14 pb-12">
        <h1 className="font-display text-3xl font-bold text-coffee-800">{cafe.name}</h1>
        <p className="font-body text-coffee-500 flex items-center gap-1.5 mt-1">
          <MapPin size={14} /> {cafe.address}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-cream-100 text-coffee-700 text-sm px-3 py-1 rounded-full font-body border border-sand-200">
            {cafe.distance < 1000 ? `${cafe.distance} m` : `${(cafe.distance / 1000).toFixed(1)} km`}
          </span>
          <span className="bg-cream-100 text-coffee-700 text-sm px-3 py-1 rounded-full font-body border border-sand-200">
            Enterprise {cafe.subscriptionTier}
          </span>
          {cafe.discountPercent != null && (
            <span className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-body font-semibold">
              {cafe.discountPercent}% de descuento (Premium)
            </span>
          )}
        </div>

        {cafe.discountPercent == null && user && !user.premium && (
          <p className="mt-4 font-body text-sm text-coffee-500 bg-cream-100 border border-sand-200 rounded-xl px-4 py-3">
            Los descuentos solo se muestran con plan consumidor Premium. Actualizá tu tier desde el perfil.
          </p>
        )}

        <section className="mt-8 card p-6">
          <h2 className="font-display text-xl font-semibold text-coffee-800 mb-3">Acerca de</h2>
          <p className="font-body text-coffee-600 leading-relaxed whitespace-pre-line">{cafe.description || cafe.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {cafe.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-cream-50 text-coffee-600 text-xs px-2 py-1 rounded-full border border-sand-200">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </section>

        <p className="mt-6 font-body text-xs text-coffee-400 text-center">
          Menú, fotos y reseñas no están en el contrato actual del API FMC.
        </p>
      </div>
    </div>
  );
}
