import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Download, Heart, MapPin, Pencil, Share2, Star, Tag, Trash2, X } from 'lucide-react';
import {
  deleteCafeteriaPhoto,
  deleteCafeteriaReview,
  deleteReviewPhoto,
  fetchCafeteriaPhotos,
  fetchCafeteriaReviews,
  postCafeteriaReview,
  putCafeteriaReview,
  uploadCafeteriaPhoto,
  uploadReviewPhoto,
} from '../api/cafeteriaMediaApi';
import { fetchCafeteriaCoupons } from '../api/discoveryApi';
import CafeCoverImage from '../components/CafeCoverImage';
import ConfirmDialog from '../components/ConfirmDialog';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import OwnCafeteriaBadge from '../components/OwnCafeteriaBadge';
import { isOwnEnterpriseCafeteria } from '../lib/ownCafeteria';
import { useCafeterias } from '../context/CafeteriasContext';
import { friendlyApiMessage } from '../lib/userFacingError';
import { couponBenefitLabel, couponSourceLabel, formatCouponWeekEnd } from '../lib/couponUtils';
import { resolveMediaUrl } from '../lib/mediaUrl';

function authorLabel(role) {
  return role === 'enterprise' ? 'Negocio' : 'Cliente';
}

function isOwnReview(review, user) {
  if (!user) return false;
  return String(review.authorUserId) === String(user.id) && review.authorRole === user.role;
}

function isOwnCafeEnterprise(user, cafeId) {
  return user?.role === 'enterprise' && String(user.cafeteriaId) === String(cafeId);
}

function validateReviewFields(rating, text) {
  const errors = {};
  if (rating < 1 || rating > 5) {
    errors.rating = 'Elegí una puntuación de 1 a 5 estrellas.';
  }
  const trimmed = text?.trim() ?? '';
  if (trimmed.length > 2000) {
    errors.text = 'El comentario no puede superar 2000 caracteres.';
  }
  return errors;
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

const photoOverlayBtn =
  'p-2 rounded-lg bg-black/55 text-white hover:bg-black/70 transition-colors disabled:opacity-50';

function ReviewPhotoDraft({ file, previewUrl, inputId, disabled, onFileSelect, onClear }) {
  const src = file ? URL.createObjectURL(file) : previewUrl ?? null;

  if (!src) {
    return (
      <label
        htmlFor={inputId}
        className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm w-fit"
      >
        <Camera size={16} />
        Agregar foto
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={e => {
            onFileSelect(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-sand-200 dark:border-coffee-600">
        <CafeCoverImage src={src} alt="Vista previa de la reseña" className="w-full h-40 object-cover" />
        <div className="absolute top-2 right-2 flex gap-2">
          <label
            htmlFor={`${inputId}-replace`}
            className={`${photoOverlayBtn} cursor-pointer`}
            title="Reemplazar foto"
            aria-label="Reemplazar foto"
          >
            <Camera size={14} />
            <input
              id={`${inputId}-replace`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={disabled}
              onChange={e => {
                onFileSelect(e.target.files?.[0] ?? null);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className={`${photoOverlayBtn} hover:bg-red-600`}
            title="Quitar foto"
            aria-label="Quitar foto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {file?.name && (
        <p className="font-body text-xs text-coffee-500 dark:text-coffee-300 truncate max-w-xs">{file.name}</p>
      )}
    </div>
  );
}

function ReviewPhotoPublishedActions({ reviewId, photoUrl, disabled, onReplace, onRemove }) {
  const inputId = `review-photo-replace-${reviewId}`;

  return (
    <div className="space-y-3">
      <a href={resolveMediaUrl(photoUrl)} target="_blank" rel="noreferrer" className="block max-w-xs">
        <CafeCoverImage
          src={resolveMediaUrl(photoUrl)}
          alt="Foto de la reseña"
          className="w-full h-40 rounded-xl object-cover border border-sand-200 dark:border-coffee-600 hover:opacity-95 transition-opacity"
        />
      </a>
      <div className="flex flex-wrap items-center gap-3 max-w-xs">
        <label
          htmlFor={inputId}
          className="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm py-2 px-3"
        >
          <Camera size={14} />
          Reemplazar
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled}
            onChange={e => {
              const selected = e.target.files?.[0];
              e.target.value = '';
              if (selected) onReplace(selected);
            }}
          />
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="btn-secondary text-sm py-2 px-3 text-red-600 dark:text-red-300 inline-flex items-center gap-2"
        >
          <Trash2 size={14} />
          Quitar foto
        </button>
      </div>
    </div>
  );
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

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState(null);
  const [downloadingCoupon, setDownloadingCoupon] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [deleteConfirmPhotoId, setDeleteConfirmPhotoId] = useState(null);
  const [reviewPhotoFile, setReviewPhotoFile] = useState(null);
  const [editReviewPhotoFile, setEditReviewPhotoFile] = useState(null);
  const [uploadingReviewPhoto, setUploadingReviewPhoto] = useState(false);
  const [reviewFormErrors, setReviewFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [actionMessage, setActionMessage] = useState('');
  const [couponsData, setCouponsData] = useState(null);

  const loadMedia = useCallback(async (signal) => {
    setMediaLoading(true);
    setMediaError('');
    try {
      const [photosRes, reviewsRes, couponsRes] = await Promise.all([
        fetchCafeteriaPhotos(id, signal),
        fetchCafeteriaReviews(id, signal),
        fetchCafeteriaCoupons(id, token, signal).catch(() => null),
      ]);
      setPhotos(photosRes.items ?? []);
      setReviews(reviewsRes.items ?? []);
      setAverageRating(reviewsRes.averageRating ?? null);
      setTotalReviews(reviewsRes.totalCount ?? 0);
      setCouponsData(couponsRes);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMediaError(friendlyApiMessage(err, 'No pudimos cargar fotos ni reseñas de este local.'));
      }
    } finally {
      setMediaLoading(false);
    }
  }, [id, token]);

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
  const ownReview = user ? reviews.find(r => isOwnReview(r, user)) : null;
  const managesGallery = isOwnCafeEnterprise(user, cafe.id);
  const isConsumerPremium = user?.premium && user?.role === 'consumer';
  const isConsumerFree = user?.role === 'consumer' && !user.premium;
  const checkoutReturn = `/cafe/${id}`;
  const isEnterprisePremiumCafe = cafe.subscriptionTier === 'Premium';
  const availableCoupons = [
    ...(couponsData?.platformCoupon ? [couponsData.platformCoupon] : []),
    ...(couponsData?.businessCoupons ?? []),
  ];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    const trimmedText = reviewText.trim();
    const errors = validateReviewFields(reviewRating, trimmedText);
    if (Object.keys(errors).length > 0) {
      setReviewFormErrors(errors);
      setActionMessage('');
      return;
    }
    setReviewFormErrors({});
    setSubmittingReview(true);
    setActionMessage('');
    try {
      const saved = await postCafeteriaReview(
        id,
        { rating: reviewRating, text: trimmedText || null },
        token
      );
      if (reviewPhotoFile) {
        await uploadReviewPhoto(id, saved.id, reviewPhotoFile, token);
      }
      setActionMessage('Reseña guardada.');
      setReviewText('');
      setReviewRating(0);
      setReviewPhotoFile(null);
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos publicar tu reseña. Probá de nuevo.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditText(review.text ?? '');
    setEditReviewPhotoFile(null);
    setEditFormErrors({});
    setActionMessage('');
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditText('');
    setEditReviewPhotoFile(null);
    setEditFormErrors({});
  };

  const handleReviewEditSave = async (e) => {
    e.preventDefault();
    if (!token || !editingReviewId) return;
    const trimmedText = editText.trim();
    const errors = validateReviewFields(editRating, trimmedText);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      setActionMessage('');
      return;
    }
    setEditFormErrors({});
    setSavingEdit(true);
    setActionMessage('');
    try {
      await putCafeteriaReview(
        id,
        editingReviewId,
        { rating: editRating, text: trimmedText || null },
        token
      );
      if (editReviewPhotoFile) {
        await uploadReviewPhoto(id, editingReviewId, editReviewPhotoFile, token);
      }
      setActionMessage('Reseña actualizada.');
      cancelEditReview();
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos actualizar tu reseña. Probá de nuevo.'));
    } finally {
      setSavingEdit(false);
    }
  };

  const requestReviewDelete = (reviewId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setDeleteConfirmReviewId(reviewId);
    setActionMessage('');
  };

  const cancelReviewDelete = () => {
    if (deletingReviewId) return;
    setDeleteConfirmReviewId(null);
  };

  const confirmReviewDelete = async () => {
    if (!token || !deleteConfirmReviewId) return;
    const reviewId = deleteConfirmReviewId;
    setDeletingReviewId(reviewId);
    setActionMessage('');
    try {
      await deleteCafeteriaReview(id, reviewId, token);
      if (editingReviewId === reviewId) cancelEditReview();
      setDeleteConfirmReviewId(null);
      setActionMessage('Reseña eliminada.');
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos eliminar tu reseña. Probá de nuevo.'));
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleDownloadCoupon = async (coupon) => {
    if (!user?.premium || !coupon) return;
    setDownloadingCoupon(true);
    setActionMessage('');
    try {
      const { downloadDiscountCoupon } = await import('../lib/discountCouponPdf');
      await downloadDiscountCoupon(
        { name: cafe.name, address: cafe.address },
        { name: user.name, email: user.email },
        coupon
      );
      setActionMessage('Cupón descargado.');
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos generar el cupón. Probá de nuevo.'));
    } finally {
      setDownloadingCoupon(false);
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
      setActionMessage('Foto del local actualizada.');
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos subir la foto. Probá con otra imagen.'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const requestPhotoDelete = (photoId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    setDeleteConfirmPhotoId(photoId);
    setActionMessage('');
  };

  const cancelPhotoDelete = () => {
    if (deletingPhotoId) return;
    setDeleteConfirmPhotoId(null);
  };

  const confirmPhotoDelete = async () => {
    if (!token || !deleteConfirmPhotoId) return;
    const photoId = deleteConfirmPhotoId;
    setDeletingPhotoId(photoId);
    setActionMessage('');
    try {
      await deleteCafeteriaPhoto(id, photoId, token);
      setDeleteConfirmPhotoId(null);
      setActionMessage('Foto eliminada.');
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos eliminar la foto.'));
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleReviewPhotoRemove = async (reviewId) => {
    if (!token) return;
    setUploadingReviewPhoto(true);
    setActionMessage('');
    try {
      await deleteReviewPhoto(id, reviewId, token);
      setActionMessage('Foto de reseña eliminada.');
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos quitar la foto de la reseña.'));
    } finally {
      setUploadingReviewPhoto(false);
    }
  };

  const handleReviewPhotoReplace = async (reviewId, file) => {
    if (!token || !file) return;
    setUploadingReviewPhoto(true);
    setActionMessage('');
    try {
      await uploadReviewPhoto(id, reviewId, file, token);
      setActionMessage('Foto de reseña actualizada.');
      await loadMedia();
    } catch (err) {
      setActionMessage(friendlyApiMessage(err, 'No pudimos actualizar la foto de la reseña.'));
    } finally {
      setUploadingReviewPhoto(false);
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
        <div className="relative mb-6 flex items-start gap-4">
          <CafeCoverImage
            src={coverSrc}
            alt={cafe.name}
            className="w-24 h-24 -mt-10 rounded-2xl border-4 border-white dark:border-coffee-700 shadow-lg object-cover shrink-0"
          />
          <div className="pt-8 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-snug text-coffee-900 dark:text-cream-50 line-clamp-2">
                {cafe.name}
              </h1>
              {isOwnEnterpriseCafeteria(user, cafe.id) && <OwnCafeteriaBadge className="mb-0.5" />}
            </div>
            <p className="font-body text-coffee-600 dark:text-coffee-200 flex items-center gap-1.5 mt-1 text-sm">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{cafe.address}</span>
            </p>
          </div>
          {averageRating != null && (
            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-2 shadow-sm shrink-0 mt-8">
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
          <span className={`text-sm px-3 py-1 rounded-full font-body border ${
            isEnterprisePremiumCafe
              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-600 font-semibold flex items-center gap-1'
              : 'bg-white dark:bg-coffee-800 text-coffee-700 dark:text-cream-200 border-sand-200 dark:border-coffee-600'
          }`}>
            {isEnterprisePremiumCafe && <Star size={12} className="fill-amber-500 text-amber-500" />}
            Enterprise {cafe.subscriptionTier}
          </span>
          {cafe.discountPercent != null && user?.premium && (
            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 text-sm px-3 py-1 rounded-full font-body font-semibold border border-amber-200 dark:border-amber-700">
              -{cafe.discountPercent}% con tu plan Premium
            </span>
          )}
        </div>

        {isConsumerPremium && availableCoupons.length > 0 && (
          <div className="mt-4 space-y-3">
            {availableCoupons.map((coupon) => (
              <div
                key={coupon.id ?? coupon.code}
                className="rounded-2xl border-2 border-amber-400/50 dark:border-amber-600/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Tag size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display font-semibold text-amber-900 dark:text-amber-100">
                      {coupon.title} · {couponBenefitLabel(coupon)}
                    </p>
                    <p className="font-body text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
                      {couponSourceLabel(coupon.source)} · Código {coupon.code} · válido hasta {formatCouponWeekEnd(coupon.validUntil)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadCoupon(coupon)}
                  disabled={downloadingCoupon}
                  className="btn-secondary shrink-0 inline-flex items-center justify-center gap-2 text-sm py-2.5 px-4 border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-100 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloadingCoupon ? 'Generando…' : 'Descargar PDF'}
                </button>
              </div>
            ))}
          </div>
        )}

        {isConsumerPremium && availableCoupons.length === 0 && (
          <p className="mt-4 font-body text-sm text-coffee-600 dark:text-coffee-200 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-3">
            Este local no tiene cupones activos esta semana. El beneficio FMC aparece cuando el local tiene descuento configurado.
          </p>
        )}

        {isConsumerFree && (
          <div className="mt-4 rounded-2xl border-2 border-amber-400/50 dark:border-amber-600/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Tag size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-amber-900 dark:text-amber-100">
                  {cafe.discountPercent != null
                    ? `Descuento disponible: ${cafe.discountPercent}%`
                    : 'Descuentos exclusivos Premium'}
                </p>
                <p className="font-body text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
                  Pasá a Premium para ver el beneficio en este local y descargar tu cupón en PDF.
                </p>
              </div>
            </div>
            <Link
              to="/checkout/consumer-premium"
              state={{ from: checkoutReturn }}
              className="btn-primary shrink-0 inline-flex items-center justify-center gap-2 text-sm py-2.5 px-4 bg-amber-600 hover:bg-amber-700 border-0"
            >
              <Star size={16} className="fill-current" />
              Pasar a Premium
            </Link>
          </div>
        )}

        {user && !user.premium && user.role === 'enterprise' && (
          <p className="mt-4 font-body text-sm text-coffee-600 dark:text-coffee-200 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-3">
            Los descuentos comerciales son un beneficio del plan consumidor Premium. Iniciá sesión con una cuenta consumidor o{' '}
            <Link to="/register" className="text-coffee-800 dark:text-cream-50 font-semibold underline">
              registrate
            </Link>
            .
          </p>
        )}

        {!user && (
          <p className="mt-4 font-body text-sm text-coffee-600 dark:text-coffee-200 bg-white dark:bg-coffee-800 border border-sand-200 dark:border-coffee-600 rounded-xl px-4 py-3">
            Los descuentos comerciales son un beneficio del plan consumidor Premium.{' '}
            <Link to="/login" state={{ from: checkoutReturn }} className="text-coffee-800 dark:text-cream-50 font-semibold underline">
              Iniciá sesión
            </Link>{' '}
            o{' '}
            <Link to="/checkout/consumer-premium" state={{ from: checkoutReturn }} className="text-coffee-800 dark:text-cream-50 font-semibold underline">
              activá Premium
            </Link>
            .
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
            <div>
              <h2 className="font-display text-xl font-semibold text-coffee-900 dark:text-cream-50">Fotos del local</h2>
              <p className="font-body text-xs text-coffee-500 dark:text-coffee-300 mt-1">
                Galería oficial gestionada por el negocio.
              </p>
            </div>
            {managesGallery && (
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
              {managesGallery
                ? 'Todavía no hay fotos oficiales. Subí imágenes para mostrar tu local.'
                : 'El negocio todavía no publicó fotos oficiales de este local.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden border border-sand-200 dark:border-coffee-600 bg-coffee-100 dark:bg-coffee-700 group"
                >
                  <a
                    href={resolveMediaUrl(photo.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full h-full"
                  >
                    <CafeCoverImage
                      src={resolveMediaUrl(photo.url)}
                      alt={`Foto de ${cafe.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  {managesGallery && (
                    <button
                      type="button"
                      onClick={() => requestPhotoDelete(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/55 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      aria-label="Eliminar foto"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </DetailPanel>

        <DetailPanel>
          <h2 className="font-display text-xl font-semibold text-coffee-900 dark:text-cream-50 mb-4 pt-1">Reseñas</h2>

          {mediaLoading ? (
            <p className="font-body text-sm text-coffee-500 dark:text-coffee-300">Cargando reseñas…</p>
          ) : reviews.length === 0 ? (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-200 mb-6">Sin reseñas todavía.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {reviews.map(review => {
                const own = isOwnReview(review, user);
                const isEditing = editingReviewId === review.id;

                return (
                  <li
                    key={review.id}
                    className="border-b border-sand-200 dark:border-coffee-600 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {!isEditing && <StarRating rating={review.rating} size={14} />}
                        <span className="font-body text-xs text-coffee-500 dark:text-coffee-300">
                          {authorLabel(review.authorRole)}
                        </span>
                      </div>
                      {own && !isEditing && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditReview(review)}
                            className="p-1.5 rounded-lg text-coffee-600 dark:text-coffee-300 hover:bg-cream-100 dark:hover:bg-coffee-700 transition-colors"
                            aria-label="Editar reseña"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestReviewDelete(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                            aria-label="Eliminar reseña"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleReviewEditSave} className="mt-3 space-y-3">
                        <div>
                          <StarRating
                            rating={editRating}
                            interactive
                            onChange={value => {
                              setEditRating(value);
                              if (editFormErrors.rating) {
                                setEditFormErrors(prev => {
                                  const next = { ...prev };
                                  delete next.rating;
                                  return next;
                                });
                              }
                            }}
                            size={20}
                          />
                          {editFormErrors.rating && (
                            <p className="font-body text-xs text-red-600 dark:text-red-300 mt-1">{editFormErrors.rating}</p>
                          )}
                        </div>
                        <div>
                          <textarea
                            value={editText}
                            onChange={e => {
                              setEditText(e.target.value);
                              if (editFormErrors.text) {
                                setEditFormErrors(prev => {
                                  const next = { ...prev };
                                  delete next.text;
                                  return next;
                                });
                              }
                            }}
                            placeholder="Contanos tu experiencia"
                            rows={3}
                            maxLength={2000}
                            className="input-field resize-y min-h-[5rem]"
                          />
                          {editFormErrors.text && (
                            <p className="font-body text-xs text-red-600 dark:text-red-300 mt-1">{editFormErrors.text}</p>
                          )}
                        </div>
                        <div className="space-y-3">
                          <ReviewPhotoDraft
                            file={editReviewPhotoFile}
                            previewUrl={!editReviewPhotoFile && review.photoUrl ? resolveMediaUrl(review.photoUrl) : null}
                            inputId={`edit-review-photo-${review.id}`}
                            disabled={uploadingReviewPhoto || savingEdit}
                            onFileSelect={setEditReviewPhotoFile}
                            onClear={() => {
                              if (editReviewPhotoFile) {
                                setEditReviewPhotoFile(null);
                                return;
                              }
                              if (review.photoUrl) handleReviewPhotoRemove(review.id);
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                          <button type="submit" className="btn-primary text-sm py-2 px-4" disabled={savingEdit}>
                            {savingEdit ? 'Guardando…' : 'Guardar cambios'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditReview}
                            className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-1"
                          >
                            <X size={14} /> Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {review.photoUrl && own ? (
                          <div className="mt-3">
                            <ReviewPhotoPublishedActions
                              reviewId={review.id}
                              photoUrl={review.photoUrl}
                              disabled={uploadingReviewPhoto}
                              onReplace={file => handleReviewPhotoReplace(review.id, file)}
                              onRemove={() => handleReviewPhotoRemove(review.id)}
                            />
                          </div>
                        ) : review.photoUrl ? (
                          <a
                            href={resolveMediaUrl(review.photoUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-3 max-w-xs"
                          >
                            <CafeCoverImage
                              src={resolveMediaUrl(review.photoUrl)}
                              alt="Foto de la reseña"
                              className="w-full h-40 rounded-xl object-cover border border-sand-200 dark:border-coffee-600 hover:opacity-95 transition-opacity"
                            />
                          </a>
                        ) : null}
                        {review.text && (
                          <p className="font-body text-coffee-700 dark:text-cream-100 text-sm mt-2 leading-relaxed">
                            {review.text}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {user && !ownReview ? (
            <form
              onSubmit={handleReviewSubmit}
              className="border-t border-sand-200 dark:border-coffee-600 pt-6 space-y-4"
            >
              <p className="font-body text-sm font-medium text-coffee-800 dark:text-cream-100">Dejá tu reseña</p>
              <p className="font-body text-xs text-coffee-500 dark:text-coffee-400 -mt-2">
                La puntuación es obligatoria si publicás una reseña.
              </p>
              <div>
                <StarRating
                  rating={reviewRating}
                  interactive
                  onChange={value => {
                    setReviewRating(value);
                    if (reviewFormErrors.rating) {
                      setReviewFormErrors(prev => {
                        const next = { ...prev };
                        delete next.rating;
                        return next;
                      });
                    }
                  }}
                  size={22}
                />
                {reviewFormErrors.rating ? (
                  <p className="font-body text-xs text-red-600 dark:text-red-300 mt-1">{reviewFormErrors.rating}</p>
                ) : reviewRating < 1 ? (
                  <p className="font-body text-xs text-coffee-500 dark:text-coffee-400 mt-1">
                    Tocá las estrellas para puntuar.
                  </p>
                ) : null}
              </div>
              <div>
                <textarea
                  value={reviewText}
                  onChange={e => {
                    setReviewText(e.target.value);
                    if (reviewFormErrors.text) {
                      setReviewFormErrors(prev => {
                        const next = { ...prev };
                        delete next.text;
                        return next;
                      });
                    }
                  }}
                  placeholder="Contanos tu experiencia"
                  rows={3}
                  maxLength={2000}
                  className="input-field resize-y min-h-[5rem]"
                />
                {reviewFormErrors.text && (
                  <p className="font-body text-xs text-red-600 dark:text-red-300 mt-1">{reviewFormErrors.text}</p>
                )}
              </div>
              <ReviewPhotoDraft
                file={reviewPhotoFile}
                inputId="new-review-photo"
                disabled={submittingReview}
                onFileSelect={setReviewPhotoFile}
                onClear={() => setReviewPhotoFile(null)}
              />
              <div className="pt-4 mt-2 border-t border-sand-100 dark:border-coffee-700">
                <button type="submit" className="btn-primary w-fit" disabled={submittingReview}>
                  {submittingReview ? 'Guardando…' : 'Publicar reseña'}
                </button>
              </div>
            </form>
          ) : user && ownReview ? (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-200 border-t border-sand-200 dark:border-coffee-600 pt-6">
              Ya publicaste una reseña. Editá el texto con el lápiz o usá Reemplazar / Quitar foto debajo de tu imagen.
            </p>
          ) : (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-200 border-t border-sand-200 dark:border-coffee-600 pt-6">
              <Link to="/login" className="text-coffee-800 dark:text-cream-50 font-semibold underline">
                Iniciá sesión
              </Link>{' '}
              para dejar una reseña.
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

      <ConfirmDialog
        open={deleteConfirmReviewId != null}
        title="¿Eliminar reseña?"
        message="Esta acción no se puede deshacer. Tu valoración, comentario y foto se quitarán del local."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        loading={deletingReviewId != null}
        onConfirm={confirmReviewDelete}
        onCancel={cancelReviewDelete}
      />

      <ConfirmDialog
        open={deleteConfirmPhotoId != null}
        title="¿Eliminar foto del local?"
        message="La imagen dejará de mostrarse en la galería oficial."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        loading={deletingPhotoId != null}
        onConfirm={confirmPhotoDelete}
        onCancel={cancelPhotoDelete}
      />
    </div>
  );
}
