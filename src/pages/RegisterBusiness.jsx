import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Store, MapPin, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import AuthBackLink from '../components/AuthBackLink';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/apiClient';
import { DEFAULT_COORDS } from '../lib/geolocation';
import { CABA, isWithinCaba } from '../lib/caba';

export default function RegisterBusiness() {
  const { registerEnterprise } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
    cafeteriaName: '',
    cafeteriaDescription: '',
    cafeteriaAddress: '',
    latitude: DEFAULT_COORDS.lat,
    longitude: DEFAULT_COORDS.lng,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.includes('@')) return setError('Email inválido.');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.');
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if ((lat !== 0 || lng !== 0) && !isWithinCaba(lat, lng)) {
      return setError(`El local debe estar en ${CABA.displayName}.`);
    }
    setLoading(true);
    try {
      await registerEnterprise({
        email: form.email,
        password: form.password,
        cafeteriaName: form.cafeteriaName || null,
        cafeteriaDescription: form.cafeteriaDescription || null,
        cafeteriaAddress: form.cafeteriaAddress || null,
        latitude: Number(form.latitude) || null,
        longitude: Number(form.longitude) || null,
      });
      navigate('/enterprise');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el negocio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-coffee-700 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-coffee-pattern opacity-20" />
        <div className="relative text-center">
          <Logo size={100} color="#f5e6cc" className="mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold text-cream-100 mb-4">Tu cafetería en el mapa</h1>
          <p className="font-body text-cream-300 text-lg max-w-sm">
            Registro Enterprise: alta de cuenta y datos iniciales del local (API FMC).
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-cream-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8 animate-slide-up">
          <AuthBackLink />
          <h2 className="font-display text-3xl font-bold text-coffee-800 mb-2">Registrar negocio</h2>
          <p className="font-body text-coffee-500 mb-6">
            Solo locales en {CABA.displayName}. Centro demo: {DEFAULT_COORDS.lat}, {DEFAULT_COORDS.lng}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  className="input-field"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Confirmar</label>
                <input
                  type="password"
                  className="input-field"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Nombre del local</label>
              <input
                type="text"
                className="input-field"
                placeholder="Opcional al registrar"
                value={form.cafeteriaName}
                onChange={e => setForm(p => ({ ...p, cafeteriaName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Descripción</label>
              <textarea
                className="input-field min-h-[80px]"
                value={form.cafeteriaDescription}
                onChange={e => setForm(p => ({ ...p, cafeteriaDescription: e.target.value }))}
              />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Dirección</label>
              <input
                type="text"
                className="input-field"
                value={form.cafeteriaAddress}
                onChange={e => setForm(p => ({ ...p, cafeteriaAddress: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Latitud</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={form.latitude}
                  onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))}
                />
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">Longitud</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  value={form.longitude}
                  onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2">
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Store size={16} />}
              Crear cuenta negocio
            </button>
          </form>

          <p className="font-body text-center text-sm text-coffee-500 mt-6">
            ¿Sos consumidor? <Link to="/register" className="font-semibold text-coffee-700 hover:underline">Registro consumidor</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
