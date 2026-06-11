import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Heart, MapPin, Share2, Tag } from 'lucide-react';
import {
  fetchCafeteriaPhotos,
  fetchCafeteriaReviews,
  postCafeteriaReview,
  uploadCafeteriaPhoto,
} from '../api/cafeteriaMediaApi';
import CafeCoverImage from '../components/CafeCoverImage';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCafeterias } from '../context/CafeteriasContext';
import { ApiError } from '../lib/apiClient';
import { resolveMediaUrl } from '../lib/mediaUrl';

function authorLabel(role) {
  return role === 'enterprise' ? 'Negocio' : 'Cliente';
}

function DetailPanel({ children, className = '' }) {
  return (
    <section
      className={`mt-8 rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 p-6 shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

const heroIconBtn =
  'p-2.5 bg-black/45 dark:bg-black/55 backdrop-blur-sm rounded-full text-white shadow-md transition-all hover:bg-black/60 dark:hover:bg-black/70 hover:scale-105';

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
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-600 dark:text-coffee-200">
        Cargando…
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-coffee-900">
        <div className="text-center">
          <p className="font-display text-2xl text-coffee-800 dark:text-cream-100 mb-4">Cafetería no encontrada</p>
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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: cafe.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setActionMessage('Enlace copiado al portapapeles.');
      }
    } catch {
      /* usuario canceló share */
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
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900">
      <div className="relative h-72 md:h-96 overflow-hidden bg-coffee-800">
        <CafeCoverImage src={coverSrc} alt={cafe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button type="button" onClick={() => navigate(-1)} className={heroIconBtn} aria-label="Volver">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={handleShare} className={heroIconBtn} aria-label="Compartir">
              <Share2 size={18} />
            </button>
            {user && (
              <button
                type="button"
                onClick={() => toggleFavorite(cafe.id)}
                className={
                  fav
                    ? 'p-2.5 rounded-full bg-red-500 text-white shadow-md transition-all hover:bg-red-600 hover:scale-105'
                    : heroIconBtn
                }
                aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart size={18} className={fav ? 'fill-white' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="relative -mt-10 mb-6 flex items-end gap-4">
          <CafeCoverImage
            src={coverSrc}
            alt={cafe.name}
            className="w-24 h-24 rounded-2xl border-4 border-white dark:border-coffee-700 shadow-lg object-cover shrink-0"
          />
          <div className="pb-1 min-w-0 flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-coffee-900 dark:text-cream-50 truncate">
              {cafe.name}
            </h1>
            <p className="font-body text-coffee-600 dark:text-coffee-200 flex items-center gap-1.5 mt-1 text-sm">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{cafe.address}</span>
            </p>
          </div>
          {averageRating != null && (
            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-2 shadow-sm shrink-0">
              <StarRating rating={averageRating} size={18} />
              <span className="font-body text-sm text-coffee-700 dark:text-cream-100">
                {averageRating.toFixed(1)} ({totalReviews})
              </span>
            </div>
          )}
        </div>

        {averageRating != null && (
          <div className="sm:hidden flex items-center gap-2 mb-4 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-2 shadow-sm w-fit">
            <StarRating rating={averageRating} size={16} />
            <span className="font-body text-sm text-coffee-700 dark:text-cream-100">
              {averageRating.toFixed(1)} ({totalReviews})
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="bg-white dark:bg-coffee-800 text-coffee-700 dark:text-cream-200 text-sm px-3 py-1 rounded-full font-body border border-sand-200 dark:border-coffee-600">
            {cafe.distance < 1000 ? `${cafe.distance} m` : `${(cafe.distance / 1000).toFixed(1)} km`}
          </span>
          <span className="bg-white dark:bg-coffee-800 text-coffee-700 dark:text-cream-200 text-sm px-3 py-1 rounded-full font-body border border-sand-200 dark:border-coffee-600">
            Enterprise {cafe.subscriptionTier}
          </span>
          {cafe.discountPercent != null && user?.premium && (
            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 text-sm px-3 py-1 rounded-full font-body font-semibold border border-amber-200 dark:border-amber-700">
              -{cafe.discountPercent}% con tu plan Premium
            </span>
          )}
        </div>

        {user?.premium && cafe.discountPercent != null && (
          <div className="mt-4 rounded-2xl border-2 border-amber-400/50 dark:border-amber-600/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-4 flex items-start gap-3">
            <Tag size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-amber-900 dark:text-amber-100">
                Descuento exclusivo Premium: {cafe.discountPercent}%
              </p>
              <p className="font-body text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
                Este beneficio solo es visible con tu cuenta Premium. Presentate en el local para acceder al descuento.
              </p>
            </div>
          </div>
        )}

        {user?.premium && cafe.discountPercent == null && (
          <p className="mt-4 font-body text-sm text-coffee-600 dark:text-coffee-200 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-3">
            Este local no tiene descuento activo por ahora. Probá el filtro «Con descuento» en Explorar.
          </p>
        )}

        {cafe.discountPercent == null && user && !user.premium && (
          <p className="mt-4 font-body text-sm text-coffee-600 dark:text-coffee-200 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-3">
            Los descuentos comerciales son un beneficio del plan consumidor Premium.{' '}
            <Link to="/checkout/consumer-premium" className="text-coffee-800 dark:text-cream-50 font-semibold underline">
              Activar Premium
            </Link>
          </p>
        )}

        <DetailPanel>
          <h2 className="font-display text-xl font-semibold text-coffee-900 dark:text-cream-50 mb-3">Acerca de</h2>
          <p className="font-body text-coffee-700 dark:text-coffee-100 leading-relaxed whitespace-pre-line">
            {cafe.description || cafe.bio}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {cafe.tags
              .filter(tag => user?.premium || !tag.endsWith('% off'))
              .map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-cream-50 dark:bg-coffee-700 text-coffee-700 dark:text-cream-200 text-xs px-2 py-1 rounded-full border border-sand-200 dark:border-coffee-600"
                >
                  <Tag size={10} /> {tag}
                </span>
              ))}
          </div>
        </DetailPanel>

        <DetailPanel>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-xl font-semibold text-coffee-900 dark:text-cream-50">Fotos</h2>
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
            <p className="font-body text-sm text-coffee-500 dark:text-coffee-300">Cargando fotos…</p>
          ) : photos.length === 0 ? (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-200">
              Todavía no hay fotos. {user ? 'Sé el primero en subir una.' : 'Iniciá sesión para contribuir.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map(photo => (
                <a
                  key={photo.id}
                  href={resolveMediaUrl(photo.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square rounded-xl overflow-hidden border border-sand-200 dark:border-coffee-600 bg-coffee-100 dark:bg-coffee-700"
                >
                  <CafeCoverImage
                    src={resolveMediaUrl(photo.url)}
                    alt={`Foto de ${cafe.name}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          )}
        </DetailPanel>

        <DetailPanel>
          <h2 className="font-display text-xl font-semibold text-coffee-900 dark:text-cream-50 mb-4">Reseñas</h2>

          {mediaLoading ? (
            <p className="font-body text-sm text-coffee-500 dark:text-coffee-300">Cargando reseñas…</p>
          ) : reviews.length === 0 ? (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-200 mb-6">Sin reseñas todavía.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {reviews.map(review => (
                <li
                  key={review.id}
                  className="border-b border-sand-200 dark:border-coffee-600 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className="font-body text-xs text-coffee-500 dark:text-coffee-300">
                      {authorLabel(review.authorRole)}
                    </span>
                  </div>
                  {review.text && (
                    <p className="font-body text-coffee-700 dark:text-cream-100 text-sm mt-2 leading-relaxed">
                      {review.text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {user ? (
            <form
              onSubmit={handleReviewSubmit}
              className="border-t border-sand-200 dark:border-coffee-600 pt-6 space-y-4"
            >
              <p className="font-body text-sm font-medium text-coffee-800 dark:text-cream-100">Dejá tu reseña</p>
              <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={22} />
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Contanos tu experiencia (opcional)"
                rows={3}
                maxLength={2000}
                className="input-field resize-y min-h-[5rem]"
              />
              <button type="submit" className="btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Guardando…' : 'Publicar reseña'}
              </button>
            </form>
          ) : (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-200 border-t border-sand-200 dark:border-coffee-600 pt-6">
              <Link to="/login" className="text-coffee-800 dark:text-cream-50 font-semibold underline">
                Iniciá sesión
              </Link>{' '}
              para dejar una reseña o subir fotos.
            </p>
          )}
        </DetailPanel>

        {(mediaError || actionMessage) && (
          <p
            className={`mt-4 font-body text-sm text-center ${
              mediaError ? 'text-red-600 dark:text-red-300' : 'text-green-700 dark:text-green-300'
            }`}
          >
            {mediaError || actionMessage}
          </p>
        )}
      </div>
    </div>
  );
}
