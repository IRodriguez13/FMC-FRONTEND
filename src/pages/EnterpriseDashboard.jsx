import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Save, Star, MapPin, AlertCircle, CheckCircle2, LogOut, Camera, Trash2, Heart, BarChart3, Ticket, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createEnterpriseCoupon,
  deleteEnterpriseCoupon,
  fetchEnterpriseCoupons,
  fetchEnterpriseStats,
} from '../api/enterpriseApi';
import {
  deleteCafeteriaPhoto,
  fetchCafeteriaPhotos,
  uploadCafeteriaPhoto,
} from '../api/cafeteriaMediaApi';
import ProfileAvatarEditor from '../components/ProfileAvatarEditor';
import CafeCoverImage from '../components/CafeCoverImage';
import ConfirmDialog from '../components/ConfirmDialog';
import { friendlyApiMessage } from '../lib/userFacingError';
import { resolveMediaUrl } from '../lib/mediaUrl';
import { CABA, isWithinCaba } from '../lib/caba';
import { couponBenefitLabel, formatCouponWeekEnd } from '../lib/couponUtils';

function EnterprisePanel({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-sand-200 dark:border-coffee-600 bg-white dark:bg-coffee-800 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export default function EnterpriseDashboard() {
  const {
    user,
    token,
    authLoading,
    isEnterprise,
    saveEnterpriseCafeteria,
    setEnterpriseSubscriptionTier,
    saveEnterpriseAvatar,
    removeEnterpriseAvatar,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const cafe = user?.cafeteria;

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    discountPercent: 0,
  });
  const [saving, setSaving] = useState(false);
  const [tierLoading, setTierLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [statsLoadError, setStatsLoadError] = useState('');
  const [couponsLoadError, setCouponsLoadError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [deleteConfirmPhotoId, setDeleteConfirmPhotoId] = useState(null);
  const [stats, setStats] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ kind: 'Percent', discountPercent: 15, fixedAmountArs: 500, title: '', description: '' });
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const isPremium = cafe?.subscriptionTier === 'Premium';

  const loadStats = useCallback(async (signal) => {
    if (!token) return;
    setStatsLoadError('');
    try {
      const res = await fetchEnterpriseStats(token, signal);
      setStats(res);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setStatsLoadError(friendlyApiMessage(err, 'No pudimos cargar las métricas.'));
      }
    }
  }, [token]);

  const loadCoupons = useCallback(async (signal) => {
    if (!token) return;
    setCouponsLoadError('');
    try {
      const list = await fetchEnterpriseCoupons(token, signal);
      setCoupons(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setCouponsLoadError(friendlyApiMessage(err, 'No pudimos cargar los cupones.'));
      }
    }
  }, [token]);

  const loadPhotos = useCallback(async (signal) => {
    if (!cafe?.id) return;
    setPhotosLoading(true);
    try {
      const res = await fetchCafeteriaPhotos(cafe.id, signal);
      setPhotos(res.items ?? []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(friendlyApiMessage(err, 'No pudimos cargar las fotos del local.'));
      }
    } finally {
      setPhotosLoading(false);
    }
  }, [cafe?.id]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    else if (!authLoading && user && !isEnterprise) navigate('/profile');
  }, [authLoading, user, isEnterprise, navigate]);

  useEffect(() => {
    if (cafe) {
      setForm({
        name: cafe.name || '',
        description: cafe.description || '',
        address: cafe.address || '',
        latitude: cafe.latitude ?? 0,
        longitude: cafe.longitude ?? 0,
        discountPercent: cafe.discountPercent ?? 0,
      });
    }
  }, [cafe]);

  useEffect(() => {
    if (!cafe?.id || !token) return undefined;
    const ac = new AbortController();
    loadPhotos(ac.signal);
    loadStats(ac.signal);
    loadCoupons(ac.signal);
    return () => ac.abort();
  }, [cafe?.id, token, loadPhotos, loadStats, loadCoupons]);

  if (authLoading || !cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-600 dark:text-coffee-200">
        Cargando cafetería…
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!isWithinCaba(Number(form.latitude), Number(form.longitude))) {
      setError(`Las coordenadas deben estar en ${CABA.displayName}.`);
      return;
    }
    setSaving(true);
    try {
      await saveEnterpriseCafeteria({
        name: form.name,
        description: form.description || null,
        address: form.address || null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        discountPercent: Number(form.discountPercent),
      });
      setMessage('Cafetería actualizada.');
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos guardar los cambios. Probá de nuevo.'));
    } finally {
      setSaving(false);
    }
  };

  const handleTier = async (subscriptionTier) => {
    setError('');
    setMessage('');
    setTierLoading(true);
    try {
      await setEnterpriseSubscriptionTier(subscriptionTier);
      setMessage(`Plan Enterprise ${subscriptionTier} activo.`);
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos cambiar el plan. Probá de nuevo.'));
    } finally {
      setTierLoading(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token || !cafe?.id) return;
    setUploadingPhoto(true);
    setError('');
    setMessage('');
    try {
      await uploadCafeteriaPhoto(cafe.id, file, token);
      setMessage('Foto del local subida.');
      await loadPhotos();
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos subir la foto.'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const confirmPhotoDelete = async () => {
    if (!token || !deleteConfirmPhotoId || !cafe?.id) return;
    const photoId = deleteConfirmPhotoId;
    setDeletingPhotoId(photoId);
    setError('');
    try {
      await deleteCafeteriaPhoto(cafe.id, photoId, token);
      setDeleteConfirmPhotoId(null);
      setMessage('Foto eliminada.');
      await loadPhotos();
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos eliminar la foto.'));
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!token || !isPremium) return;
    setCreatingCoupon(true);
    setError('');
    setMessage('');
    try {
      await createEnterpriseCoupon({
        kind: couponForm.kind,
        discountPercent: couponForm.kind === 'Percent' ? Number(couponForm.discountPercent) : null,
        fixedAmountArs: couponForm.kind === 'FixedAmount' ? Number(couponForm.fixedAmountArs) : null,
        title: couponForm.title || null,
        description: couponForm.description || null,
      }, token);
      setMessage('Cupón publicado para esta semana.');
      setCouponForm((p) => ({ ...p, title: '', description: '' }));
      await loadCoupons();
      await loadStats();
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos crear el cupón.'));
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!token) return;
    setDeletingCouponId(couponId);
    try {
      await deleteEnterpriseCoupon(couponId, token);
      setMessage('Cupón eliminado.');
      await loadCoupons();
      await loadStats();
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos eliminar el cupón.'));
    } finally {
      setDeletingCouponId(null);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarUploading(true);
    setError('');
    try {
      await saveEnterpriseAvatar(file);
      setMessage('Foto de perfil actualizada.');
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos subir la foto.'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    setError('');
    try {
      await removeEnterpriseAvatar();
      setMessage('Foto de perfil eliminada.');
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos quitar la foto.'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const labelClass = 'block font-body text-sm font-semibold text-coffee-800 dark:text-cream-100 mb-1.5';
  const activeCoupons = coupons.filter((c) => c.isActive);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-coffee-900">
      <div className="bg-coffee-700 dark:bg-coffee-800 border-b border-coffee-600 dark:border-coffee-600 py-10 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <ProfileAvatarEditor
            name={cafe.name}
            avatarUrl={user.avatarUrl}
            disabled={avatarUploading}
            onFileSelect={handleAvatarSelect}
            onRemove={handleAvatarRemove}
            fallback="store"
          />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold text-cream-100 flex items-center gap-3">
              <Store size={28} className="hidden sm:block shrink-0" />
              Mi cafetería
            </h1>
            <p className="font-body text-cream-200 dark:text-coffee-200 mt-1 truncate">{user.email}</p>
            <p className="font-body text-cream-300/90 text-sm mt-0.5">Foto de perfil del negocio</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <EnterprisePanel className="p-5 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-300">Plan Enterprise</p>
            <p className="font-display text-xl font-bold text-coffee-900 dark:text-cream-50">
              {cafe.subscriptionTier}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={tierLoading || cafe.subscriptionTier === 'Standard'}
              onClick={() => handleTier('Standard')}
              className="btn-secondary text-sm py-2"
            >
              Standard
            </button>
            <button
              type="button"
              disabled={tierLoading || cafe.subscriptionTier === 'Premium'}
              onClick={() => navigate('/checkout/enterprise-premium')}
              className="btn-primary text-sm py-2 flex items-center gap-1"
            >
              <Star size={14} /> Premium
            </button>
          </div>
        </EnterprisePanel>

        <EnterprisePanel className="p-5">
          <p className="font-body text-sm text-coffee-600 dark:text-coffee-300 mb-2">Estado del listado</p>
          <p
            className={`font-body font-semibold flex items-center gap-2 ${
              cafe.listingActive
                ? 'text-green-700 dark:text-green-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {cafe.listingActive ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {cafe.listingActive
              ? 'Activo en Explorar y Mapa (nombre y coordenadas válidas)'
              : 'Inactivo: completá nombre y coordenadas distintas de 0'}
          </p>
        </EnterprisePanel>

        {(stats || statsLoadError) && (
          <EnterprisePanel className="p-6">
            <h2 className="font-display text-lg font-semibold text-coffee-900 dark:text-cream-50 flex items-center gap-2 mb-4">
              <BarChart3 size={20} />
              Resumen
            </h2>
            {statsLoadError && (
              <p className="font-body text-sm text-amber-800 dark:text-amber-200 mb-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                {statsLoadError}
              </p>
            )}
            {stats && (
              <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-cream-50 dark:bg-coffee-700/80 p-3 border border-sand-200 dark:border-coffee-600">
                <p className="font-body text-xs text-coffee-500 dark:text-coffee-300">Valoración</p>
                <p className="font-display text-xl font-bold text-coffee-900 dark:text-cream-50">
                  {stats.averageRating != null ? stats.averageRating.toFixed(1) : '—'}
                </p>
                <p className="font-body text-xs text-coffee-500">{stats.reviewCount} reseñas</p>
              </div>
              <div className="rounded-xl bg-cream-50 dark:bg-coffee-700/80 p-3 border border-sand-200 dark:border-coffee-600">
                <p className="font-body text-xs text-coffee-500 dark:text-coffee-300">Guardados por usuarios</p>
                <p className="font-display text-xl font-bold text-coffee-900 dark:text-cream-50 flex items-center gap-1">
                  <Heart size={16} className="text-red-500" />
                  {stats.favoriteCount}
                </p>
                <p className="font-body text-[10px] text-coffee-400 dark:text-coffee-500">favoritos del local</p>
              </div>
              <div className="rounded-xl bg-cream-50 dark:bg-coffee-700/80 p-3 border border-sand-200 dark:border-coffee-600">
                <p className="font-body text-xs text-coffee-500 dark:text-coffee-300">Fotos</p>
                <p className="font-display text-xl font-bold text-coffee-900 dark:text-cream-50">{stats.photoCount}</p>
              </div>
              <div className="rounded-xl bg-cream-50 dark:bg-coffee-700/80 p-3 border border-sand-200 dark:border-coffee-600">
                <p className="font-body text-xs text-coffee-500 dark:text-coffee-300">Cupones semana</p>
                <p className="font-display text-xl font-bold text-coffee-900 dark:text-cream-50">{stats.activeCouponsThisWeek}</p>
              </div>
            </div>
            {isPremium ? (
              <p className="font-body text-sm text-amber-800 dark:text-amber-200 mt-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                Plan Premium: tu local aparece antes que Standard en Explorar y Mapa.
              </p>
            ) : (
              <p className="font-body text-sm text-coffee-600 dark:text-coffee-300 mt-4">
                Con Enterprise Premium mejorás visibilidad y podés publicar cupones del negocio.
              </p>
            )}
            {stats.weekValidUntil && (
              <p className="font-body text-xs text-coffee-500 dark:text-coffee-400 mt-2">
                Semana vigente hasta {formatCouponWeekEnd(stats.weekValidUntil)}.
              </p>
            )}
              </>
            )}
          </EnterprisePanel>
        )}

        <EnterprisePanel className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Ticket size={20} className="text-coffee-600 dark:text-cream-200" />
            <h2 className="font-display text-lg font-semibold text-coffee-900 dark:text-cream-50">
              Cupones del negocio
            </h2>
          </div>
          {couponsLoadError && (
            <p className="font-body text-sm text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
              {couponsLoadError}
            </p>
          )}
          {!isPremium ? (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-300">
              Publicá cupones semanales (% , monto fijo o 2x1) con{' '}
              <button type="button" onClick={() => navigate('/checkout/enterprise-premium')} className="underline font-semibold text-coffee-800 dark:text-cream-50">
                Enterprise Premium
              </button>
              .
            </p>
          ) : (
            <>
              <form onSubmit={handleCreateCoupon} className="space-y-3 border border-sand-200 dark:border-coffee-600 rounded-xl p-4 bg-cream-50/50 dark:bg-coffee-700/40">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Tipo</label>
                    <select
                      className="input-field"
                      value={couponForm.kind}
                      onChange={(e) => setCouponForm((p) => ({ ...p, kind: e.target.value }))}
                    >
                      <option value="Percent">Porcentaje</option>
                      <option value="FixedAmount">Monto fijo (ARS)</option>
                      <option value="TwoForOne">2x1</option>
                    </select>
                  </div>
                  {couponForm.kind === 'Percent' && (
                    <div>
                      <label className={labelClass}>% descuento</label>
                      <input type="number" min={1} max={100} className="input-field" value={couponForm.discountPercent}
                        onChange={(e) => setCouponForm((p) => ({ ...p, discountPercent: e.target.value }))} />
                    </div>
                  )}
                  {couponForm.kind === 'FixedAmount' && (
                    <div>
                      <label className={labelClass}>Monto ARS</label>
                      <input type="number" min={100} className="input-field" value={couponForm.fixedAmountArs}
                        onChange={(e) => setCouponForm((p) => ({ ...p, fixedAmountArs: e.target.value }))} />
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Título (opcional)</label>
                  <input className="input-field" value={couponForm.title}
                    onChange={(e) => setCouponForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ej. 2x1 en cappuccino" />
                </div>
                <button type="submit" disabled={creatingCoupon} className="btn-primary text-sm py-2 inline-flex items-center gap-2">
                  <Plus size={14} />
                  {creatingCoupon ? 'Publicando…' : 'Publicar cupón esta semana'}
                </button>
              </form>
              {activeCoupons.length === 0 ? (
                <p className="font-body text-sm text-coffee-600 dark:text-coffee-300">Sin cupones activos esta semana.</p>
              ) : (
                <ul className="space-y-2">
                  {activeCoupons.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-sand-200 dark:border-coffee-600 px-4 py-3 bg-white dark:bg-coffee-800">
                      <div>
                        <p className="font-body font-semibold text-coffee-900 dark:text-cream-50">{c.title}</p>
                        <p className="font-body text-sm text-coffee-600 dark:text-coffee-300">
                          {couponBenefitLabel(c)} · {c.code} · hasta {formatCouponWeekEnd(c.validUntil)}
                        </p>
                      </div>
                      <button type="button" disabled={deletingCouponId === c.id} onClick={() => handleDeleteCoupon(c.id)}
                        className="text-red-600 dark:text-red-300 text-sm font-semibold hover:underline disabled:opacity-50">
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </EnterprisePanel>

        {message && (
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 px-4 py-3 font-body text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-3 font-body text-sm">
            {error}
          </div>
        )}

        <EnterprisePanel className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-coffee-900 dark:text-cream-50">
              Datos del local
            </h2>
            <div>
              <label className={labelClass}>Nombre *</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea
                className="input-field min-h-[80px]"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Dirección</label>
              <input
                className="input-field"
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Latitud</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={form.latitude}
                  onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass}>Longitud</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={form.longitude}
                  onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Descuento % (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="input-field"
                value={form.discountPercent}
                onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} />
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </EnterprisePanel>

        <EnterprisePanel className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-coffee-900 dark:text-cream-50">
                Fotos oficiales del local
              </h2>
              <p className="font-body text-sm text-coffee-600 dark:text-coffee-300 mt-1">
                Estas imágenes se muestran en la ficha pública de tu cafetería.
              </p>
            </div>
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
          </div>
          {photosLoading ? (
            <p className="font-body text-sm text-coffee-500 dark:text-coffee-400">Cargando fotos…</p>
          ) : photos.length === 0 ? (
            <p className="font-body text-sm text-coffee-600 dark:text-coffee-300">
              Todavía no hay fotos. Subí al menos una para la portada del local.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map(photo => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden border border-sand-200 dark:border-coffee-600 bg-coffee-100 dark:bg-coffee-700"
                >
                  <CafeCoverImage
                    src={resolveMediaUrl(photo.url)}
                    alt="Foto del local"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmPhotoId(photo.id)}
                    disabled={deletingPhotoId === photo.id}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/55 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    aria-label="Eliminar foto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </EnterprisePanel>

        <div className="flex flex-wrap gap-3">
          <Link to="/explore" className="btn-secondary flex items-center gap-2">
            <MapPin size={16} /> Ver mapa público
          </Link>
          <button
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-red-600 dark:text-red-300 font-body font-semibold px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmPhotoId != null}
        title="¿Eliminar foto del local?"
        message="La imagen dejará de mostrarse en la galería oficial."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        loading={deletingPhotoId != null}
        onConfirm={confirmPhotoDelete}
        onCancel={() => { if (!deletingPhotoId) setDeleteConfirmPhotoId(null); }}
      />
    </div>
  );
}
