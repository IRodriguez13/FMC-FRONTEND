import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import AuthBackLink from '../components/AuthBackLink';
import { useAuth } from '../context/AuthContext';
import { friendlyApiMessage } from '../lib/userFacingError';

export default function Register() {
  const { registerConsumer } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '', confirm: '', terms: false });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Requerido';
    if (!form.email.includes('@')) errs.email = 'Email inválido';
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirm) errs.confirm = 'Las contraseñas no coinciden';
    if (!form.terms) errs.terms = 'Debés aceptar los términos';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setError('');
    setLoading(true);
    try {
      await registerConsumer({ email: form.email, password: form.password });
      navigate('/explore');
    } catch (err) {
      setError(friendlyApiMessage(err, 'No pudimos crear tu cuenta. Revisá los datos e intentá otra vez.'));
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
          <h1 className="font-display text-5xl font-bold text-cream-100 mb-4">Unite a la comunidad</h1>
          <p className="font-body text-cream-300 text-lg leading-relaxed max-w-sm">
            Creá tu cuenta de consumidor y descubrí cafeterías cerca tuyo.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-cream-50 dark:bg-coffee-900 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-slide-up">
          <AuthBackLink />
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Logo size={40} color="#7d5420" />
            <span className="font-display text-2xl font-bold text-coffee-800 dark:text-cream-100">Find My Coffee</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-coffee-900 dark:text-cream-50 mb-2">Crear cuenta</h2>
          <p className="font-body text-coffee-600 dark:text-coffee-300 mb-8">Registro de consumidor</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-sm font-semibold text-coffee-800 dark:text-cream-100 mb-1.5">Nombre</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
                  <input
                    type="text"
                    placeholder="Juan"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className={`input-field pl-9 ${errors.name ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 font-body">{errors.name}</p>}
              </div>
              <div>
                <label className="block font-body text-sm font-semibold text-coffee-800 dark:text-cream-100 mb-1.5">Apellido</label>
                <input
                  type="text"
                  placeholder="García"
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-semibold text-coffee-800 dark:text-cream-100 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-body">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-body text-sm font-semibold text-coffee-800 dark:text-cream-100 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-body">{errors.password}</p>}
            </div>

            <div>
              <label className="block font-body text-sm font-semibold text-coffee-800 dark:text-cream-100 mb-1.5">Confirmar contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
                <input
                  type="password"
                  placeholder="Repetí tu contraseña"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  className={`input-field pl-9 ${errors.confirm ? 'border-red-400' : ''}`}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {errors.confirm && <p className="text-red-500 text-xs mt-1 font-body">{errors.confirm}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={form.terms}
                onChange={e => setForm(p => ({ ...p, terms: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded border-sand-300 accent-coffee-600"
              />
              <label htmlFor="terms" className="font-body text-sm text-coffee-600 leading-relaxed">
                Acepto los{' '}
                <Link to="/terms" className="text-coffee-800 dark:text-cream-100 font-semibold hover:underline">términos y condiciones</Link>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs font-body">{errors.terms}</p>}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
              Registrarse
            </button>
          </form>

          <p className="font-body text-center text-coffee-600 dark:text-coffee-300 text-sm mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-coffee-800 dark:text-cream-100 font-semibold hover:underline">Iniciá sesión</Link>
          </p>
          <p className="font-body text-center text-coffee-600 dark:text-coffee-300 text-sm mt-2">
            ¿Tenés una cafetería?{' '}
            <Link to="/register-business" className="text-coffee-800 dark:text-cream-100 font-semibold hover:underline">
              Registro negocio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
