import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Save, Star, MapPin, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/apiClient';
import { CABA, isWithinCaba } from '../lib/caba';

export default function EnterpriseDashboard() {
  const {
    user,
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
      setError(err instanceof ApiError ? err.message : 'Error al guardar.');
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
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el plan.');
    } finally {
      setTierLoading(false);
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
              onClick={() => handleTier('Premium')}
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
    </div>
  );
}
