import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // 1. Sumamos useState y useEffect
import { ArrowLeft, Heart, MapPin, Share2, Tag, Star, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import { getCafeteriaPhotos, getCafeteriaReviews } from '../api/discoveryApi';

export default function CafeDetail() {
  const { id } = useParams();
  const { user, toggleFavorite, isFavorite } = useAuth();
  const { getCafeById, loading: contextLoading } = useCafeterias();
  const navigate = useNavigate();
  const cafe = getCafeById(id);

  // Estados locales para las fotos y reseñas reales del Backend
  const [photos, setPhotos] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0 });
  const [loadingExtra, setLoadingExtra] = useState(true);

  // 3. Efecto para cargar los endpoints REST en paralelo
  useEffect(() => {
    if (!id) return;

    const cargarFotosYResenas = async () => {
      try {
        setLoadingExtra(true);
        const [fotosBackend, resenasBackend] = await Promise.all([
          getCafeteriaPhotos(id),
          getCafeteriaReviews(id)
        ]);

        setPhotos(fotosBackend || []);
        setReviewsData({
          reviews: resenasBackend?.reviews || [],
          averageRating: resenasBackend?.averageRating || 0
        });
      } catch (error) {
        console.error("Error cargando fotos o reseñas complementarias:", error);
      } finally {
        setLoadingExtra(false);
      }
    };

    cargarFotosYResenas();
  }, [id]);

  if (contextLoading && !cafe) {
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
      {/* Cover Image */}
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
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all shadow-md ${fav ? 'bg-red-500 text-white' : 'bg-white/90 text-coffee-700 hover:bg-white'
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pt-14 pb-12">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="font-display text-3xl font-bold text-coffee-800">{cafe.name}</h1>
            <p className="font-body text-coffee-500 flex items-center gap-1.5 mt-1">
              <MapPin size={14} /> {cafe.address}
            </p>
          </div>
          {/* Mostramos el promedio real de estrellas que viene de la API REST */}
          <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl font-body font-bold text-sm">
            <Star size={15} className="fill-amber-500 text-amber-500" />
            {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : "Sin notas"}
          </div>
        </div>

        {/* Chips */}
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

        {/* Premium Banner */}
        {cafe.discountPercent == null && user && !user.premium && (
          <p className="mt-4 font-body text-sm text-coffee-500 bg-cream-100 border border-sand-200 rounded-xl px-4 py-3">
            Los descuentos solo se muestran con plan consumidor Premium. Actualizá tu tier desde el perfil.
          </p>
        )}

        {/* Acerca de */}
        <section className="mt-8 card bg-white p-6 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="font-display text-xl font-semibold text-coffee-800 mb-3">Acerca de</h2>
          <p className="font-body text-coffee-600 leading-relaxed whitespace-pre-line">{cafe.description || cafe.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {cafe.tags && cafe.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-cream-50 text-coffee-600 text-xs px-2 py-1 rounded-full border border-sand-200">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 1: GALERÍA DE FOTOS REALES (REST) ───────────────── */}
        <section className="mt-8 card bg-white p-6 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="font-display text-xl font-semibold text-coffee-800 mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-coffee-600" /> Galería de la Comunidad
          </h2>
          {loadingExtra ? (
            <p className="font-body text-sm text-coffee-400">Cargando imágenes...</p>
          ) : photos.length === 0 ? (
            <p className="font-body text-sm text-coffee-400 bg-cream-50 rounded-xl p-4 text-center">
              Todavía no hay fotos de este local. ¡Sé el primero en subir una!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={photo.id || index} className="h-32 rounded-xl overflow-hidden shadow-sm border border-sand-100">
                  <img src={photo.url} alt="Café" className="w-full h-full object-cover hover:scale-105 transition-all duration-300" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECCIÓN 2: RESEÑAS DE USUARIOS REALES (REST) ────────────── */}
        <section className="mt-8 card bg-white p-6 rounded-2xl shadow-sm border border-sand-200">
          <h2 className="font-display text-xl font-semibold text-coffee-800 mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-coffee-600" /> Reseñas ({reviewsData.reviews.length})
          </h2>

          {loadingExtra ? (
            <p className="font-body text-sm text-coffee-400">Cargando comentarios...</p>
          ) : reviewsData.reviews.length === 0 ? (
            <p className="font-body text-sm text-coffee-400 bg-cream-50 rounded-xl p-4 text-center">
              Nadie escribió una reseña todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {reviewsData.reviews.map((review, i) => (
                <div key={review.id || i} className="border-b border-sand-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-body text-sm font-bold text-coffee-700">
                      {review.authorName || "Consumidor Anónimo"}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={idx < review.rating ? 'fill-current' : 'text-sand-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-body text-sm text-coffee-600 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}