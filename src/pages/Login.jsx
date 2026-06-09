import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User, Store } from 'lucide-react';
import Logo from '../components/Logo';
import AuthBackLink from '../components/AuthBackLink';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/apiClient';

export default function Login() {
  const { loginConsumer, loginEnterprise } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('consumer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email) return setError('Ingresá tu correo electrónico.');
    if (!form.password) return setError('Ingresá tu contraseña.');
    setLoading(true);
    try {
      if (mode === 'consumer') {
        await loginConsumer(form.email, form.password);
        navigate('/explore');
      } else {
        await loginEnterprise(form.email, form.password);
        navigate('/enterprise');
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Email o contraseña incorrectos. Intentá de nuevo.'
      );
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
          <h1 className="font-display text-5xl font-bold text-cream-100 mb-4">Find My Coffee</h1>
          <p className="font-body text-cream-300 text-lg leading-relaxed max-w-sm">
            Consumidores exploran cafeterías; negocios gestionan su local en el mapa.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-cream-50">
        <div className="w-full max-w-md animate-slide-up">
          <AuthBackLink />

          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Logo size={40} color="#7d5420" />
            <span className="font-display text-2xl font-bold text-coffee-700">Find My Coffee</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-coffee-800 mb-2">Bienvenido de vuelta</h2>
          <p className="font-body text-coffee-500 mb-4">Elegí el tipo de cuenta</p>

          <div className="flex gap-2 mb-6 p-1 bg-cream-100 rounded-xl border border-sand-200">
            <button
              type="button"
              onClick={() => { setMode('consumer'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm font-semibold transition-all ${
                mode === 'consumer' ? 'bg-white text-coffee-800 shadow-sm' : 'text-coffee-500'
              }`}
            >
              <User size={16} /> Consumidor
            </button>
            <button
              type="button"
              onClick={() => { setMode('enterprise'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm font-semibold transition-all ${
                mode === 'enterprise' ? 'bg-white text-coffee-800 shadow-sm' : 'text-coffee-500'
              }`}
            >
              <Store size={16} /> Negocio
            </button>
          </div>

          <p className="font-body text-coffee-400 text-xs mb-6">
            Demo {mode === 'consumer' ? 'consumidor' : 'enterprise'}@seed.fmc / SeedPass-123
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-semibold text-coffee-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : null}
              Iniciar sesión
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="font-body text-coffee-500 text-sm">
              ¿No tenés cuenta?{' '}
              <Link
                to={mode === 'consumer' ? '/register' : '/register-business'}
                className="text-coffee-700 font-semibold hover:underline"
              >
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
