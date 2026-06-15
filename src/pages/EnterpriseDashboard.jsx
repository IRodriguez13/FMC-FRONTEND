import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Save, Star, MapPin, AlertCircle, CheckCircle2, LogOut, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  deleteCafeteriaPhoto,
  fetchCafeteriaPhotos,
  uploadCafeteriaPhoto,
} from '../api/cafeteriaMediaApi';
import CafeCoverImage from '../components/CafeCoverImage';
import ConfirmDialog from '../components/ConfirmDialog';
import { friendlyApiMessage } from '../lib/userFacingError';
import { resolveMediaUrl } from '../lib/mediaUrl';
import { CABA, isWithinCaba } from '../lib/caba';

export default function EnterpriseDashboard() {
  const {
    user,
    token,
    authLoading,
    isEnterprise,
    saveEnterpriseCafeteria,
    setEnterpriseSubscriptionTier,
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
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [deleteConfirmPhotoId, setDeleteConfirmPhotoId] = useState(null);

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
    if (!cafe?.id) return undefined;
    const ac = new AbortController();
    loadPhotos(ac.signal);
    return () => ac.abort();
  }, [cafe?.id, loadPhotos]);

  if (authLoading || !cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-coffee-500">
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
      setMessage('Cafetería actualizada (PUT /api/enterprise/cafeteria/me).');
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
      setMessage(`Plan Enterprise ${subscriptionTier} activo (JWT renovado).`);
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

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-coffee-700 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-cream-100 flex items-center gap-3">
            <Store size={28} />
            Mi cafetería
          </h1>
          <p className="font-body text-cream-300 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="card p-5 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <p className="font-body text-sm text-coffee-500">Plan Enterprise</p>
            <p className="font-display text-xl font-bold text-coffee-800">
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
        </div>

        <div className="card p-5">
          <p className="font-body text-sm text-coffee-600 mb-2">Estado del listado</p>
          <p className={`font-body font-semibold flex items-center gap-2 ${cafe.listingActive ? 'text-green-700' : 'text-amber-700'}`}>
            {cafe.listingActive ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {cafe.listingActive
              ? 'Activo en /nearby (nombre y coordenadas válidas)'
              : 'Inactivo: completá nombre y coordenadas distintas de 0'}
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl font-body text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-coffee-800">Datos del local (PUT)</h2>
          <div>
            <label className="block font-body text-sm font-semibold text-coffee-700 mb-1">Nombre *</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-coffee-700 mb-1">Descripción</label>
            <textarea
              className="input-field min-h-[80px]"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block font-body text-sm font-semibold text-coffee-700 mb-1">Dirección</label>
            <input
              className="input-field"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1">Latitud</label>
              <input
                type="number"
                step="any"
                className="input-field"
                value={form.latitude}
                onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1">Longitud</label>
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
            <label className="block font-body text-sm font-semibold text-coffee-700 mb-1">
              Descuento % (0–100)
            </label>
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

        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-coffee-800">Fotos oficiales del local</h2>
              <p className="font-body text-sm text-coffee-600 mt-1">
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
            <p className="font-body text-sm text-coffee-500">Cargando fotos…</p>
          ) : photos.length === 0 ? (
            <p className="font-body text-sm text-coffee-600">
              Todavía no hay fotos. Subí al menos una para la portada del local.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-sand-200 bg-coffee-100">
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
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/explore" className="btn-secondary flex items-center gap-2">
            <MapPin size={16} /> Ver mapa público
          </Link>
          <button
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-red-600 font-body font-semibold px-4 py-2"
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
