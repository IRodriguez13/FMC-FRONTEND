import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Heart, MapPin, Share2, Tag } from 'lucide-react';
import {
  fetchCafeteriaPhotos,
  fetchCafeteriaReviews,
  postCafeteriaReview,
  uploadCafeteriaPhoto,
} from '../api/cafeteriaMediaApi';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import { ApiError } from '../lib/apiClient';
import { resolveMediaUrl } from '../lib/mediaUrl';

function authorLabel(role) {
  return role === 'enterprise' ? 'Negocio' : 'Cliente';
}

export default function CafeDetail() {
  const { id } = useParams();
  const { user, token, toggleFavorite, isFavorite } = useAuth();
  const { getCafeById, loading } = useCafeterias();
  const navigate = useNavigate();
  const cafe = getCafeById(id);

  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadMedia = useCallback(async (signal) => {
    setMediaLoading(true);
    setMediaError('');
    try {
      const [photosRes, reviewsRes] = await Promise.all([
        fetchCafeteriaPhotos(id, signal),
        fetchCafeteriaReviews(id, signal),
      ]);
      setPhotos(photosRes.items ?? []);
      setReviews(reviewsRes.items ?? []);
      setAverageRating(reviewsRes.averageRating ?? null);
      setTotalReviews(reviewsRes.totalCount ?? 0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMediaError(err instanceof ApiError ? err.message : 'No se pudieron cargar fotos ni reseñas.');
      }
    } finally {
      setMediaLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    const ac = new AbortController();
    loadMedia(ac.signal);
    return () => ac.abort();
  }, [id, loadMedia]);

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
  const coverSrc = photos.length
    ? resolveMediaUrl(photos[0].url)
    : cafe.coverImage;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    setActionMessage('');
    try {
      await postCafeteriaReview(id, { rating: reviewRating, text: reviewText }, token);
      setActionMessage('Reseña guardada.');
      setReviewText('');
      await loadMedia();
    } catch (err) {
      setActionMessage(err instanceof ApiError ? err.message : 'Error al guardar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) {
      if (!token) navigate('/login');
      return;
    }
    setUploadingPhoto(true);
    setActionMessage('');
    try {
      await uploadCafeteriaPhoto(id, file, token);
      setActionMessage('Foto subida.');
      await loadMedia();
    } catch (err) {
      setActionMessage(err instanceof ApiError ? err.message : 'Error al subir la foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={coverSrc} alt={cafe.name} className="w-full h-full object-cover" />
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
            src={coverSrc}
            alt={cafe.name}
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-14 pb-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-coffee-800">{cafe.name}</h1>
            <p className="font-body text-coffee-500 flex items-center gap-1.5 mt-1">
              <MapPin size={14} /> {cafe.address}
            </p>
          </div>
          {averageRating != null && (
            <div className="flex items-center gap-2 bg-white border border-sand-200 rounded-xl px-4 py-2 shadow-sm">
              <StarRating rating={averageRating} size={18} />
              <span className="font-body text-sm text-coffee-600">
                {averageRating.toFixed(1)} ({totalReviews})
              </span>
            </div>
          )}
        </div>

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

        <section className="mt-8 card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-xl font-semibold text-coffee-800">Fotos</h2>
            {user && (
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
                <Camera size={16} />
                {uploadingPhoto ? 'Subiendo…' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={handlePhotoSelect}
                />
              </label>
            )}
          </div>

          {mediaLoading ? (
            <p className="font-body text-sm text-coffee-400">Cargando fotos…</p>
          ) : photos.length === 0 ? (
            <p className="font-body text-sm text-coffee-500">Todavía no hay fotos. {user ? 'Sé el primero en subir una.' : 'Iniciá sesión para contribuir.'}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map(photo => (
                <a
                  key={photo.id}
                  href={resolveMediaUrl(photo.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square rounded-xl overflow-hidden border border-sand-200 bg-cream-100"
                >
                  <img
                    src={resolveMediaUrl(photo.url)}
                    alt={`Foto de ${cafe.name}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 card p-6">
          <h2 className="font-display text-xl font-semibold text-coffee-800 mb-4">Reseñas</h2>

          {mediaLoading ? (
            <p className="font-body text-sm text-coffee-400">Cargando reseñas…</p>
          ) : reviews.length === 0 ? (
            <p className="font-body text-sm text-coffee-500 mb-6">Sin reseñas todavía.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {reviews.map(review => (
                <li key={review.id} className="border-b border-sand-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className="font-body text-xs text-coffee-400">
                      {authorLabel(review.authorRole)}
                    </span>
                  </div>
                  {review.text && (
                    <p className="font-body text-coffee-600 text-sm mt-2 leading-relaxed">{review.text}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {user ? (
            <form onSubmit={handleReviewSubmit} className="border-t border-sand-200 pt-6 space-y-4">
              <p className="font-body text-sm font-medium text-coffee-700">Dejá tu reseña</p>
              <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={22} />
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Contanos tu experiencia (opcional)"
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-sand-200 px-4 py-3 font-body text-sm text-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-300"
              />
              <button type="submit" className="btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Guardando…' : 'Publicar reseña'}
              </button>
            </form>
          ) : (
            <p className="font-body text-sm text-coffee-500 border-t border-sand-200 pt-6">
              <Link to="/login" className="text-coffee-700 underline">Iniciá sesión</Link> para dejar una reseña o subir fotos.
            </p>
          )}
        </section>

        {(mediaError || actionMessage) && (
          <p className={`mt-4 font-body text-sm text-center ${mediaError ? 'text-red-600' : 'text-green-700'}`}>
            {mediaError || actionMessage}
          </p>
        )}
      </div>
    </div>
  );
}
